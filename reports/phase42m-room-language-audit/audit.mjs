import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.AUDIT_BASE_URL ?? "http://localhost:3000";
const outDir = "reports/phase42m-room-language-audit";

const rooms = [
  ["wasser", "/raeume/wasser"],
  ["licht", "/raeume/licht"],
  ["feuer", "/raeume/feuer"],
  ["wueste", "/raeume/wueste"],
  ["brot", "/raeume/brot"],
];

const extraRoutes = [
  "/symbolnetz",
  "/codex/wasser",
  "/codex/licht",
  "/codex/feuer",
  "/codex/wueste",
  "/codex/brot",
];

const viewports = [
  ["desktop", { width: 1440, height: 1000 }],
  ["mobile", { width: 390, height: 844 }],
];

const suspiciousText = [
  "Wueste",
  "Pruefung",
  "Fuehrung",
  "Rueckkehr",
  "Tagesmass",
  "zurueck",
  "Archivspuren",
  "Esh",
  " OR ",
  "Route",
  "Debug",
  "CTA",
  "recordRoomVisit",
  "from=journey",
  "path=",
  "query",
  "symbol=",
];

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

async function inspectPage(page, route, label, screenshotPath) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);

  const info = await page.evaluate((terms) => {
    const text = document.body.innerText;
    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    const hits = terms.filter((term) => text.includes(term));
    const buttons = [...document.querySelectorAll("button, a")].map((node) => node.textContent?.trim() ?? "");
    return {
      title: document.title,
      overflow,
      hits,
      textLength: text.length,
      emptyControls: buttons.filter((text) => text.length === 0).length,
    };
  }, suspiciousText);

  if (screenshotPath) {
    await page.screenshot({ path: screenshotPath, fullPage: true });
  }

  results.push({ route, label, screenshotPath, ...info });
}

for (const [viewportLabel, viewport] of viewports) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();

  for (const [room, route] of rooms) {
    const screenshotPath = path.join(outDir, `${viewportLabel}-raeume-${room}.png`);
    await inspectPage(page, route, `${viewportLabel}:${room}`, screenshotPath);
  }

  for (const route of extraRoutes) {
    await inspectPage(page, route, `${viewportLabel}:${route}`, null);
  }

  await context.close();
}

await browser.close();

await fs.writeFile(path.join(outDir, "audit-results.json"), JSON.stringify(results, null, 2), "utf8");

const failures = results.filter((result) => result.overflow || result.hits.length > 0);
if (failures.length > 0) {
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log(`Wrote ${results.length} route checks and ${rooms.length * viewports.length} screenshots to ${outDir}`);
