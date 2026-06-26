import { chromium } from "@playwright/test";

const BASE = process.env.AUDIT_BASE_URL ?? "http://localhost:8082";
const errors = [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

page.on("pageerror", (err) => {
  errors.push({ type: "pageerror", message: err.message, stack: err.stack });
});
page.on("console", (msg) => {
  if (msg.type() === "error") {
    errors.push({ type: "console", text: msg.text() });
  }
});

await page.goto(`${BASE}/home`, { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(4000);

const bodyText = await page.locator("body").innerText();
const hasErrorUi = bodyText.includes("تعذّر تحميل الصفحة");

console.log(JSON.stringify({ base: BASE, hasErrorUi, bodySample: bodyText.slice(0, 400), errors }, null, 2));
await browser.close();
