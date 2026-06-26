/**
 * Export churches missing coordinates to reports/churches-to-geocode.json
 * Uses the app's public Supabase anon key (read-only). No service role needed.
 *
 * Run: node scripts/export-churches-for-geocode.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_PATH = path.join(ROOT, "reports", "churches-to-geocode.json");

const SUPABASE_URL = "https://usflbjlyadihyitnvzya.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZmxiamx5YWRpaHlpdG52enlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3OTM5NDQsImV4cCI6MjA5NDM2OTk0NH0.rntQyBXmRPag1LtpVRCfIHdZbI3BAgV8rU5agbTgUNY";

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const rows = [];
  const pageSize = 500;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("churches")
      .select("id, church_name, formatted_address, city, governorate, country, latitude, longitude")
      .eq("is_active", true)
      .or("latitude.is.null,longitude.is.null")
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw new Error(error.message);
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(rows, null, 2));

  console.log(`Exported ${rows.length} churches → ${OUT_PATH}`);
  console.log("Next:");
  console.log("  node scripts/geocode-churches-offline.mjs --limit 5");
}

main().catch((error) => {
  console.error("Export failed:", error.message);
  console.error("");
  console.error("Fallback: Supabase Dashboard → SQL Editor → run scripts/sql/export-churches-missing-coords.sql");
  process.exit(1);
});
