import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = "http://localhost:3000";
const outDir = "reports/phase42n-first-journey-summary-room";
const now = "2026-07-15T12:00:00.000Z";
const journeySymbols = ["wasser", "licht", "feuer", "wueste", "brot"];

function roomEvents() {
  return journeySymbols.map((symbolId, index) => ({
    id: `audit-room-${symbolId}`,
    type: "room_entered",
    targetId: symbolId,
    targetType: "room",
    label: symbolId[0].toUpperCase() + symbolId.slice(1),
    sourceRoute: `/raeume/${symbolId}`,
    timestamp: new Date(Date.parse(now) + index * 1000).toISOString(),
    roomId: symbolId,
  }));
}

async function primeCompletedJourney(context) {
  await context.addInitScript((events) => {
    window.localStorage.setItem("symbolraum-personal-path-events", JSON.stringify(events));
    window.localStorage.setItem("symbolraum-personal-path-migrated", "1");
    window.localStorage.setItem(
      "bibel-symbolraum-path-activity",
      JSON.stringify({
        roomVisits: events.map((event) => ({
          id: `legacy-${event.targetId}`,
          symbolId: event.targetId,
          roomHref: event.sourceRoute,
          createdAt: event.timestamp,
        })),
        journeyStarts: [],
        activatedLetters: [],
      })
    );
  }, roomEvents());
}

async function checkPage(page, route, viewportName) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  return {
    route,
    viewport: viewportName,
    title: await page.title(),
    url: page.url(),
    horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1),
    textExcerpt: (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 700),
  };
}

async function screenshot(page, route, file, viewportName) {
  const result = await checkPage(page, route, viewportName);
  await page.screenshot({ path: path.join(outDir, file), fullPage: true });
  return { ...result, screenshot: path.join(outDir, file) };
}

async function run() {
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const results = [];
  const routes = [
    "/wege/tiefe-bis-brot",
    "/raeume/wasser",
    "/raeume/licht",
    "/raeume/feuer",
    "/raeume/wueste",
    "/raeume/brot",
    "/symbolnetz?symbol=brot",
    "/mein-pfad",
  ];

  for (const viewport of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const lockedContext = await browser.newContext({ viewport });
    const lockedPage = await lockedContext.newPage();
    results.push(await screenshot(lockedPage, "/wege/tiefe-bis-brot", `${viewport.name}-summary-locked.png`, viewport.name));
    await lockedContext.close();

    const context = await browser.newContext({ viewport });
    await primeCompletedJourney(context);
    const page = await context.newPage();

    results.push(await screenshot(page, "/wege/tiefe-bis-brot", `${viewport.name}-summary-open.png`, viewport.name));

    await page.goto(`${baseUrl}/raeume/brot`, { waitUntil: "networkidle" });
    await page.getByLabel("7. Tisch").click();
    await page.waitForTimeout(700);
    const brotOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    await page.screenshot({ path: path.join(outDir, `${viewport.name}-brot-summary-link.png`), fullPage: true });
    results.push({
      route: "/raeume/brot",
      viewport: viewport.name,
      horizontalOverflow: brotOverflow,
      hasSummaryLink: await page.getByText("Von der Tiefe zum Brot schauen").isVisible(),
      screenshot: path.join(outDir, `${viewport.name}-brot-summary-link.png`),
    });

    for (const route of routes) {
      results.push(await checkPage(page, route, viewport.name));
    }

    await context.close();
  }

  await browser.close();
  await fs.writeFile(path.join(outDir, "audit-results.json"), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results.map((result) => ({
    route: result.route,
    viewport: result.viewport,
    horizontalOverflow: result.horizontalOverflow,
    screenshot: result.screenshot,
    hasSummaryLink: result.hasSummaryLink,
  })), null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
