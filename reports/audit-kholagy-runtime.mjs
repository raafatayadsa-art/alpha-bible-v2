/**
 * Runtime audit — Kholagy home card + index screen.
 * Run: node reports/audit-kholagy-runtime.mjs
 */
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.AUDIT_BASE_URL ?? "http://localhost:8080";
const OUT = path.join(__dirname, "audit-screenshots");

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));

const results = {};

async function audit(name, url, checks) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(2500);
  const bodyText = await page.locator("body").innerText();
  const checksResult = {};
  for (const [key, fn] of Object.entries(checks)) {
    checksResult[key] = await fn(page, bodyText);
  }
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
  results[name] = { url, checks: checksResult, bodySample: bodyText.slice(0, 500) };
}

await audit("home-kholagy", `${BASE}/home`, {
  homeCardTitle: async (_p, text) => text.includes("الخولاجي المقدس"),
  readButton: async (_p, text) => text.includes("اقرأ"),
  gridCardClass: async (p) => (await p.locator(".kholagy-grid-card").count()) > 0,
});

await audit("kholagy-index", `${BASE}/kholagy`, {
  pageTitle: async (_p, text) => text.includes("الخولاجي المقدس"),
  gridCards: async (p) => await p.locator(".kholagy-grid-card").count(),
  gapClass: async (p) => {
    const grid = p.locator(".grid.grid-cols-2").first();
    const cls = (await grid.getAttribute("class")) ?? "";
    return cls.includes("gap-1.5");
  },
  loadError: async (_p, text) => text.includes("تعذّر تحميل الخولاجي"),
});

await browser.close();

const report = { base: BASE, results, consoleErrors };
await writeFile(path.join(__dirname, "audit-kholagy-runtime.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
