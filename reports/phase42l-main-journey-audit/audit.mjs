import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = "http://localhost:3000";
const outDir = path.resolve("reports/phase42l-main-journey-audit");

const roomRoutes = [
  "/raeume/wasser",
  "/raeume/licht",
  "/raeume/feuer",
  "/raeume/wueste",
  "/raeume/brot",
];

const finalNavLabels = {
  "/raeume/wasser": "Licht",
  "/raeume/licht": "Feuer",
  "/raeume/feuer": "Sendung",
  "/raeume/wueste": "Brot / Heimat",
  "/raeume/brot": "Tisch",
};

const checkRoutes = [
  ...roomRoutes,
  "/symbolnetz",
  "/symbolnetz?symbol=brot",
  "/codex/wasser",
  "/codex/licht",
  "/codex/feuer",
  "/codex/wueste",
  "/codex/brot",
  "/codex/majim",
  "/codex/or",
  "/codex/esch",
  "/codex/midbar",
  "/codex/lechem",
];

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
];

function safeName(route) {
  return route
    .replace(/^\//, "")
    .replace(/\?/g, "__")
    .replace(/[=/]/g, "_");
}

async function pageSnapshot(page) {
  return page.evaluate(() => {
    const text = document.body.innerText;
    const main = document.querySelector("main");
    return {
      title: document.title,
      bodyText: text.slice(0, 2000),
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      hasEngineText: /\bEngine\b|Relations|Relationen|Connection Panel|Symbol-Engine/i.test(text),
      hasPersonalTrace: Boolean(document.querySelector(".symbol-engine__personal-trace")),
      mainClass: main?.className?.toString() ?? "",
      linkHrefs: Array.from(document.querySelectorAll("a")).map((link) => link.getAttribute("href")).filter(Boolean),
    };
  });
}

const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
const results = [];

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();

  for (const route of roomRoutes) {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    const shotPath = path.join(outDir, `${viewport.name}-${safeName(route)}.png`);
    await page.screenshot({ path: shotPath, fullPage: true });
    results.push({ route, viewport: viewport.name, status: response?.status() ?? null, screenshot: shotPath, ...(await pageSnapshot(page)) });

    await page.getByRole("button", { name: new RegExp(finalNavLabels[route], "i") }).click();
    await page.waitForTimeout(700);
    const finalShotPath = path.join(outDir, `${viewport.name}-${safeName(route)}-final.png`);
    await page.screenshot({ path: finalShotPath, fullPage: true });
    const primaryExit = await page.locator("a[class*='primary-exit']").first().evaluate((link) => ({
      text: link.textContent?.replace(/\s+/g, " ").trim() ?? "",
      href: link.getAttribute("href"),
    })).catch(() => null);
    results.push({
      route: `${route}#final`,
      viewport: viewport.name,
      status: response?.status() ?? null,
      screenshot: finalShotPath,
      primaryExit,
      ...(await pageSnapshot(page)),
    });
  }

  await context.close();
}

const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();

for (const route of checkRoutes) {
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(350);
  results.push({ route, viewport: "route-check", status: response?.status() ?? null, ...(await pageSnapshot(page)) });
}

await context.close();
await browser.close();

await fs.writeFile(path.join(outDir, "audit-results.json"), JSON.stringify(results, null, 2));

const failures = results.filter((item) => item.status !== 200 || item.horizontalOverflow || item.hasEngineText);
console.log(JSON.stringify({ checked: results.length, failures }, null, 2));
