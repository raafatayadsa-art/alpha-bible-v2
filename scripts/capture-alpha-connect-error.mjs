import { chromium } from "@playwright/test";

const baseUrl = process.env.ALPHA_DEV_URL ?? "http://localhost:8082";

const browser = await chromium.launch({ headless: true, channel: "msedge" });
const page = await browser.newPage();

const errors = [];
page.on("pageerror", (e) => errors.push({ type: "pageerror", message: e.message, stack: e.stack }));
page.on("console", (m) => {
  if (m.type() === "error") errors.push({ type: "console", message: m.text() });
});

await page.goto(`${baseUrl}/home`, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2000);

const card = page.locator('a[aria-label="Alpha Connect"]');
console.log("CARD_COUNT:", await card.count());
if (await card.count()) {
  await card.first().click();
  await page.waitForTimeout(5000);
}

const body = await page.locator("body").innerText();
console.log("URL:", page.url());
console.log("TITLE:", await page.title());
console.log("HAS_LOAD_FAILED:", body.includes("تعذر تحميل"));
console.log("HAS_ALPHA_CONNECT:", body.includes("Alpha Connect"));
console.log("BODY_SNIPPET:", body.slice(0, 400));
console.log("ERRORS_JSON:", JSON.stringify(errors, null, 2));

await browser.close();
