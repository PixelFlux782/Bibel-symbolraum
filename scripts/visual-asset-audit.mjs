import { chromium } from "playwright";
import fs from "node:fs/promises";

const routes = [
  "/",
  "/symbolnetz",
  "/archiv",
  "/mein-pfad",
  "/raeume/wasser",
  "/raeume/licht",
  "/raeume/feuer",
  "/raeume/wueste",
  "/raeume/brot",
];

const viewports = [
  { name: "desktop", width: 1440, height: 1100 },
  { name: "mobile", width: 390, height: 844 },
];

const bases = [
  { name: "local", url: process.env.LOCAL_URL ?? "http://127.0.0.1:3000" },
  ...(process.env.LIVE_URL ? [{ name: "live", url: process.env.LIVE_URL }] : []),
];

const visualAssets = [
  "/Visuals/start_symbolraum_hero.png",
  "/Visuals/wasser_tiefenbild.png",
  "/Visuals/wasser_interface_backround.png",
  "/Visuals/wasser_makro.png",
  "/Visuals/wasser_szenenbild.png",
  "/Visuals/wasser_hebr_symbl.png",
  "/Visuals/licht_raum_hero.png",
  "/Visuals/feuer_glut_raum.png",
  "/Visuals/wueste_nacht_raum.png",
  "/Visuals/brot_manna_gabe.png",
  "/Visuals/hebr_archiv_waende_background.png",
  "/Visuals/symbolnetz_backround.png",
  "/Visuals/tiefenraum_backround.png",
];

function normalizeImageUrl(raw) {
  if (!raw) return "";
  try {
    const url = new URL(raw, "http://audit.local");
    if (url.pathname === "/_next/image" && url.searchParams.has("url")) {
      return decodeURIComponent(url.searchParams.get("url"));
    }
    return url.pathname;
  } catch {
    return raw;
  }
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

async function auditPage(browser, base, route, viewport) {
  const page = await browser.newPage({ viewport });
  const imageRequests = [];
  const failedRequests = [];
  const consoleMessages = [];

  page.on("requestfinished", (request) => {
    const type = request.resourceType();
    const normalized = normalizeImageUrl(request.url());
    if (type === "image" || normalized.includes("/Visuals/")) {
      imageRequests.push({
        url: normalized,
        rawUrl: request.url(),
        type,
      });
    }
  });

  page.on("requestfailed", (request) => {
    const normalized = normalizeImageUrl(request.url());
    if (request.resourceType() === "image" || normalized.includes("/Visuals/")) {
      failedRequests.push({
        url: normalized,
        failure: request.failure()?.errorText ?? "unknown",
      });
    }
  });

  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleMessages.push({
        type: message.type(),
        text: message.text(),
      });
    }
  });

  const response = await page.goto(new URL(route, base.url).toString(), {
    waitUntil: "networkidle",
    timeout: 45_000,
  });
  await page.waitForTimeout(750);

  const dom = await page.evaluate(() => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const isVisibleRect = (rect) =>
      rect.width > 1 &&
      rect.height > 1 &&
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < viewport.height &&
      rect.left < viewport.width;

    const imgElements = Array.from(document.images).map((img) => {
      const rect = img.getBoundingClientRect();
      const style = getComputedStyle(img);
      return {
        src: img.getAttribute("src"),
        currentSrc: img.currentSrc,
        alt: img.alt,
        className: img.className,
        rect: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
        visibleInViewport: isVisibleRect(rect) && style.visibility !== "hidden" && style.display !== "none" && Number(style.opacity) !== 0,
        objectFit: style.objectFit,
        objectPosition: style.objectPosition,
        opacity: style.opacity,
        zIndex: style.zIndex,
      };
    });

    const backgroundElements = Array.from(document.querySelectorAll("*"))
      .map((element) => {
        const style = getComputedStyle(element);
        const backgroundImage = style.backgroundImage;
        if (!backgroundImage || backgroundImage === "none") return null;
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          className: element.className?.toString?.() ?? "",
          backgroundImage,
          rect: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
          visibleInViewport: isVisibleRect(rect) && style.visibility !== "hidden" && style.display !== "none" && Number(style.opacity) !== 0,
          opacity: style.opacity,
        };
      })
      .filter(Boolean);

    const hero = document.querySelector(".symbol-portal");
    const heroRect = hero?.getBoundingClientRect();
    const h1 = document.querySelector("h1");
    const h1Style = h1 ? getComputedStyle(h1) : null;

    return {
      title: document.title,
      imgElements,
      backgroundElements,
      heroRect: heroRect
        ? {
            x: Math.round(heroRect.x),
            y: Math.round(heroRect.y),
            width: Math.round(heroRect.width),
            height: Math.round(heroRect.height),
          }
        : null,
      h1Text: h1?.textContent?.trim() ?? null,
      h1Color: h1Style?.color ?? null,
    };
  });

  await page.screenshot({
    path: `reports/visual-audit/${base.name}-${viewport.name}${route === "/" ? "-home" : route.replaceAll("/", "-")}.png`,
    fullPage: false,
  });

  await page.close();

  const imgSources = uniqueSorted(dom.imgElements.flatMap((img) => [normalizeImageUrl(img.src), normalizeImageUrl(img.currentSrc)]));
  const cssBackgrounds = uniqueSorted(
    dom.backgroundElements.flatMap((bg) =>
      [...bg.backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map((match) => normalizeImageUrl(match[1])),
    ),
  );
  const loadedImages = uniqueSorted(imageRequests.map((request) => request.url));

  return {
    base: base.name,
    route,
    viewport: viewport.name,
    status: response?.status() ?? null,
    loadedImages,
    visualAssetRequests: loadedImages.filter((url) => url.includes("/Visuals/")),
    imgSources: imgSources.filter((url) => url.includes("/Visuals/")),
    cssBackgrounds: cssBackgrounds.filter((url) => url.includes("/Visuals/")),
    visibleImgs: dom.imgElements
      .map((img) => ({ ...img, normalized: normalizeImageUrl(img.currentSrc || img.src) }))
      .filter((img) => img.normalized.includes("/Visuals/") && img.visibleInViewport),
    visibleBackgrounds: dom.backgroundElements
      .map((bg) => ({
        ...bg,
        urls: [...bg.backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map((match) => normalizeImageUrl(match[1])),
      }))
      .filter((bg) => bg.visibleInViewport && bg.urls.some((url) => url.includes("/Visuals/"))),
    failedRequests,
    consoleMessages,
    heroRect: dom.heroRect,
    h1Text: dom.h1Text,
    h1Color: dom.h1Color,
  };
}

await fs.mkdir("reports/visual-audit", { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const base of bases) {
  for (const viewport of viewports) {
    for (const route of routes) {
      results.push(await auditPage(browser, base, route, viewport));
    }
  }
}

await browser.close();

const usedAssets = uniqueSorted(results.flatMap((result) => result.visualAssetRequests));
const unusedVisualAssetSlots = visualAssets.filter((asset) => !usedAssets.includes(asset));
const oldFallbacks = usedAssets.filter((asset) =>
  ["/Visuals/Logo_hero.png", "/Visuals/cinem_lichtraum_backround.png", "/Visuals/mockup.png", "/Visuals/mockup2.png", "/Visuals/wasser_hero.png", "/Visuals/wasser_karte.png"].includes(asset),
);

const output = {
  generatedAt: new Date().toISOString(),
  bases,
  routes,
  viewports,
  unusedVisualAssetSlots,
  oldFallbacks,
  results,
};

await fs.writeFile("reports/visual-audit/asset-coverage.json", JSON.stringify(output, null, 2));
console.log(JSON.stringify(output, null, 2));
