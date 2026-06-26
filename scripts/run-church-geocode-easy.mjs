/**
 * Easiest church geocoding flow — no Supabase service role key needed.
 *
 * Run:
 *   node scripts/run-church-geocode-easy.mjs
 *
 * Then paste reports/geocode-updates.sql into Supabase → SQL Editor → Run
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function run(label, script, extraArgs = []) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(process.execPath, [script, ...extraArgs], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("Church geocoding — easy mode (Google key only)");
console.log("No Supabase service role key required.\n");

run("Step 1/2 — Export churches missing coordinates", "scripts/export-churches-for-geocode.mjs");
run("Step 2/2 — Geocode with Google Places", "scripts/geocode-churches-offline.mjs");

console.log("\nDone.");
console.log("Final step (manual, in browser):");
console.log("1) Supabase Dashboard → SQL Editor");
console.log("2) Open reports/geocode-updates.sql");
console.log("3) Paste → Run");
