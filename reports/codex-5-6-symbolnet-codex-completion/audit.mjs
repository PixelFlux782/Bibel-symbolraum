import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = "http://localhost:3000";
const outDir = path.resolve("reports/codex-5-6-symbolnet-codex-completion");
const requested = ["wasser","majim","tiefe","ruach","licht","or","genesis-1-3","tov","raah","feuer","esch","dornbusch","pruefung","reinigung","wueste","midbar","manna","stimme","weg","vertrauen","brot","lechem","wort","leben","teilen","gabe","hunger","grenze","uebergang","geburt","spiegel","ordnung"];
const visible = JSON.parse((await fs.readFile(path.join(outDir, "audit-results.json"), "utf8")).replace(/^\uFEFF/, "")).visibleTargets;
const slugs = [...new Set([...visible, ...requested])];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const routes = [];
for (const slug of slugs) {
  const response = await page.goto(`${baseUrl}/codex/${slug}`, { waitUntil: "domcontentloaded" });
  const body = await page.locator("body").innerText();
  routes.push({ slug, status: response?.status() ?? 0, title: await page.title(), mojibake: /Ã.|Â.|×.|�/.test(body), technicalRemainder: /\b(?:undefined|null|TODO|Placeholder|debug|handler|active|path=|from=journey|symbol=)\b/i.test(body) });
}
for (const sample of ["wasser", "dornbusch", "vertrauen", "spiegel"]) {
  await page.goto(`${baseUrl}/codex/${sample}`, { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  await page.screenshot({ path: path.join(outDir, `desktop-codex-${sample}.png`), fullPage: true });
  routes.find((item) => item.slug === sample).desktopOverflow = overflow;
}
await page.setViewportSize({ width: 390, height: 844 });
for (const sample of ["wasser", "dornbusch", "vertrauen", "spiegel"]) {
  await page.goto(`${baseUrl}/codex/${sample}`, { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  await page.screenshot({ path: path.join(outDir, `mobile-codex-${sample}.png`), fullPage: true });
  routes.find((item) => item.slug === sample).mobileOverflow = overflow;
}
await page.goto(`${baseUrl}/symbolnetz`, { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(outDir, "desktop-symbolnetz.png"), fullPage: true });
const codexLinks = await page.locator('a[href^="/codex/"]').evaluateAll((links) => links.map((link) => link.getAttribute("href")));
await browser.close();

const result = { checkedAt: new Date().toISOString(), counts: { slugs: slugs.length, ok: routes.filter((route) => route.status === 200).length }, allValid: routes.every((route) => route.status === 200), cleanEncoding: routes.every((route) => !route.mojibake), cleanVisibleText: routes.every((route) => !route.technicalRemainder), symbolNetworkCodexLinks: codexLinks, routes };
await fs.writeFile(path.join(outDir, "route-check-output.json"), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result.counts));
if (!result.allValid || !result.cleanEncoding || !result.cleanVisibleText) process.exitCode = 1;
