import { chromium } from "@playwright/test";

const baseUrl = process.env.ALPHA_DEV_URL ?? "http://localhost:8082";
const paths = [
  "/alpha-connect",
  "/alpha-connect?tab=calls",
  "/alpha-connect?tab=messages",
  "/alpha-connect?tab=settings",
  "/alpha-connect?tab=channels",
  "/alpha-connect?chat=priest",
];

const browser = await chromium.launch({ headless: true, channel: "msedge" });
const page = await browser.newPage();

for (const path of paths) {
  const errors = [];
  page.removeAllListeners("pageerror");
  page.removeAllListeners("console");
  page.on("pageerror", (e) => errors.push({ message: e.message, stack: e.stack }));
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().includes("404") && !m.text().includes("<path>")) {
      errors.push({ message: m.text() });
    }
  });

  await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2000);
  const body = await page.locator("body").innerText();
  const failed = body.includes("تعذر تحميل");
  console.log("\n===", path, "===");
  console.log("LOAD_FAILED:", failed);
  console.log("URL:", page.url());
  if (failed) console.log("BODY:", body.slice(0, 200));
  if (errors.length) console.log("ERRORS:", JSON.stringify(errors, null, 2));
}

await browser.close();
