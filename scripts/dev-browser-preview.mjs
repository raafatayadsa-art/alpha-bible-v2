#!/usr/bin/env node
/**
 * Starts Vite + a public Cloudflare tunnel so you can open the app
 * in any browser (phone, laptop) — same as npm run dev but shareable.
 *
 * Usage: npm run dev:browser
 */
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { readFileSync, existsSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = process.env.PORT || "5173";
const LOG = "/tmp/alpha-dev-browser.log";

function run(cmd, args, opts = {}) {
  return spawn(cmd, args, { stdio: "inherit", shell: true, ...opts });
}

async function waitForUrl(maxMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    if (existsSync(LOG)) {
      const text = readFileSync(LOG, "utf8");
      const m = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (m) return m[0];
    }
    await sleep(500);
  }
  return null;
}

console.log("\nⲁ Alpha — Browser Preview\n");
console.log("Starting dev server on port", PORT, "...\n");

const vite = run("npx", [`vite dev --host 0.0.0.0 --port ${PORT}`]);

await sleep(3000);

const cfBin = existsSync("/tmp/cloudflared") ? "/tmp/cloudflared" : "cloudflared";
const logStream = createWriteStream(LOG);
const tunnel = spawn(cfBin, ["tunnel", "--url", `http://localhost:${PORT}`], {
  stdio: ["ignore", "pipe", "pipe"],
});

tunnel.stdout?.on("data", (d) => logStream.write(d));
tunnel.stderr?.on("data", (d) => logStream.write(d));

const publicUrl = await waitForUrl();

console.log("─────────────────────────────────────────────");
if (publicUrl) {
  console.log("✅ افتح التطبيق في أي متصفح:\n");
  console.log(`   ${publicUrl}/home\n`);
  console.log(`   الملف الشخصي: ${publicUrl}/profile`);
} else {
  console.log("⚠️  Tunnel لم يجهز بعد. شغّل يدوياً:");
  console.log(`   cloudflared tunnel --url http://localhost:${PORT}`);
}
console.log("─────────────────────────────────────────────");
console.log("\nاضغط Ctrl+C لإيقاف السيرفر\n");

const stop = () => {
  vite.kill("SIGTERM");
  tunnel.kill("SIGTERM");
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

vite.on("exit", (code) => process.exit(code ?? 0));
