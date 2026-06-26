/**
 * One-off runtime audit — Church Directory MapLibre verification.
 * Run: node reports/audit-maplibre-runtime.mjs
 */
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.AUDIT_BASE_URL ?? "http://localhost:8084";
const OUT = path.join(__dirname, "audit-screenshots");

const routes = [
  { name: "church-directory", url: `${BASE}/church/directory` },
  { name: "churches-directory", url: `${BASE}/churches-directory` },
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const consoleLogs = [];
const consoleErrors = [];
page.on("console", (msg) => {
  const entry = `[${msg.type()}] ${msg.text()}`;
  consoleLogs.push(entry);
  if (msg.type() === "error") consoleErrors.push(entry);
});
page.on("pageerror", (err) => {
  consoleErrors.push(`[pageerror] ${err.message}`);
});

const results = {};

for (const route of routes) {
  await page.goto(route.url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);

  const listAudit = await page.evaluate(() => {
    const hasLeaflet = Boolean(document.querySelector(".leaflet-container, .leaflet-pane"));
    const hasMaplibre = Boolean(
      document.querySelector(".maplibregl-map, .maplibregl-canvas, canvas.maplibregl-canvas"),
    );
    const mapGateText = document.body.innerText.includes("جاري تحميل الخريطة");
    const mapErrorText = document.body.innerText.includes("تعذّر تحميل الخريطة");
    const listVisible = Boolean(document.querySelector('[class*="ChurchDirectoryListView"], .no-scrollbar'));
    return {
      hasLeaflet,
      hasMaplibre,
      mapGateText,
      mapErrorText,
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim() ?? null,
      bodySnippet: document.body.innerText.slice(0, 400),
    };
  });

  await page.screenshot({
    path: path.join(OUT, `${route.name}-list-mode.png`),
    fullPage: false,
  });

  const mapBtn = page.getByRole("button", { name: "الخريطة" });
  if (await mapBtn.isVisible().catch(() => false)) {
    await mapBtn.click();
    await page.waitForTimeout(2500);

    const mapAudit = await page.evaluate(() => {
      const hasLeaflet = Boolean(document.querySelector(".leaflet-container, .leaflet-pane"));
      const maplibreRoot = document.querySelector(".maplibregl-map, .church-directory-map");
      const canvas = document.querySelector("canvas.maplibregl-canvas");
      const canvasSize =
        canvas instanceof HTMLCanvasElement
          ? { width: canvas.width, height: canvas.height, clientW: canvas.clientWidth, clientH: canvas.clientHeight }
          : null;
      return {
        hasLeaflet,
        hasMaplibreRoot: Boolean(maplibreRoot),
        hasMaplibreCanvas: Boolean(canvas),
        canvasSize,
        mapClasses: maplibreRoot?.className ?? null,
      };
    });

    await page.screenshot({
      path: path.join(OUT, `${route.name}-map-mode.png`),
      fullPage: false,
    });

    results[route.name] = { listAudit, mapAudit };
  } else {
    results[route.name] = { listAudit, mapAudit: null, mapButtonMissing: true };
  }
}

await writeFile(
  path.join(__dirname, "audit-maplibre-runtime.json"),
  JSON.stringify({ baseUrl: BASE, results, consoleErrors, consoleLogs: consoleLogs.slice(-40) }, null, 2),
);

await browser.close();
console.log(JSON.stringify({ outDir: OUT, consoleErrorCount: consoleErrors.length, results }, null, 2));
