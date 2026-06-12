import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://usflbjlyadihyitnvzya.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZmxiamx5YWRpaHlpdG52enlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3OTM5NDQsImV4cCI6MjA5NDM2OTk0NH0.rntQyBXmRPag1LtpVRCfIHdZbI3BAgV8rU5agbTgUNY";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkBible() {
  console.log("=== BIBLE CHECK ===");
  // Supabase distinct query or pagination to get all books and chapters
  let from = 0;
  const PAGE = 1000;
  const bookStats = {};
  
  while(true) {
    const { data, error } = await supabase.from("bible_verses").select("book_name, chapter_number").range(from, from + PAGE - 1);
    if (error) {
      console.error("Bible fetch error:", error.message);
      break;
    }
    if (!data || data.length === 0) break;
    
    for (const row of data) {
      if (!bookStats[row.book_name]) {
        bookStats[row.book_name] = new Set();
      }
      bookStats[row.book_name].add(row.chapter_number);
    }
    
    if (data.length < PAGE) break;
    from += PAGE;
  }
  
  console.log(`Total books found: ${Object.keys(bookStats).length}`);
  for (const book of Object.keys(bookStats)) {
    console.log(`- ${book}: ${bookStats[book].size} chapters`);
  }
}

async function checkAgpeya() {
  console.log("\n=== AGPEYA CHECK ===");
  const { data: prayers, error } = await supabase.from("agpeya_prayers").select("id, prayer_key");
  if (error) {
    console.log("Error agpeya_prayers:", error.message);
  } else {
    console.log(`Found ${prayers.length} Agpeya prayers in DB:`, prayers.map(p => p.prayer_key).join(", "));
    for (const p of prayers) {
      const { count } = await supabase.from("agpeya_sections").select("*", { count: 'exact', head: true }).eq("prayer_id", p.id);
      console.log(`  - ${p.prayer_key}: ${count} sections`);
    }
  }
}

async function checkKatamaros() {
  console.log("\n=== KATAMAROS CHECK ===");
  const { error } = await supabase.from("katamaros_readings").select("id").limit(1);
  if (error) console.log("Table 'katamaros_readings' not found in Supabase.");
}

async function checkSynaxarium() {
  console.log("\n=== SYNAXARIUM CHECK ===");
  const { error } = await supabase.from("synaxarium_days").select("id").limit(1);
  if (error) console.log("Table 'synaxarium_days' not found in Supabase.");
}

async function run() {
  await checkBible();
  await checkAgpeya();
  await checkKatamaros();
  await checkSynaxarium();
}

run();