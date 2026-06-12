import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://usflbjlyadihyitnvzya.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZmxiamx5YWRpaHlpdG52enlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3OTM5NDQsImV4cCI6MjA5NDM2OTk0NH0.rntQyBXmRPag1LtpVRCfIHdZbI3BAgV8rU5agbTgUNY";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const tables = [
  "katamaros_days",
  "katamaros_readings",
  "synaxarium_saints",
  "synaxarium_events",
];

for (const table of tables) {
  const { data, error, count } = await supabase.from(table).select("id", { count: "exact" }).limit(1);
  if (error) {
    console.log(`${table}: MISSING (${error.code})`);
  } else {
    console.log(`${table}: EXISTS (rows=${count ?? 0})`);
  }
}
