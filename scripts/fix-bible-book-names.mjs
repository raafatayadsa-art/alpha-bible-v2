import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://usflbjlyadihyitnvzya.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZmxiamx5YWRpaHlpdG52enlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3OTM5NDQsImV4cCI6MjA5NDM2OTk0NH0.rntQyBXmRPag1LtpVRCfIHdZbI3BAgV8rU5agbTgUNY";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const FIXES = [
  { wrong: "رسالة بول الرسول إلى تيطس", correct: "رسالة بولس الرسول إلى تيطس" },
  { wrong: "رسالة بولس الرسول الثانية إلى أهل تسالونيك", correct: "رسالة بولس الرسول الثانية إلى أهل تسالونيكي" },
  { wrong: "سفر أخبار لأيام الثاني", correct: "سفر أخبار الأيام الثاني" },
  { wrong: "سفر المزاير", correct: "سفر المزامير" },
  { wrong: "سفر يوديت", correct: "سفر يهوديت" },
];

async function inspect() {
  for (const { wrong, correct } of FIXES) {
    const { count: wrongCount } = await supabase
      .from("bible_verses")
      .select("*", { count: "exact", head: true })
      .eq("book_name", wrong);
    const { count: correctCount } = await supabase
      .from("bible_verses")
      .select("*", { count: "exact", head: true })
      .eq("book_name", correct);
    const { data: sample } = await supabase
      .from("bible_verses")
      .select("chapter_number, verse_number")
      .eq("book_name", wrong)
      .limit(5);
    console.log(`\n${wrong}`);
    console.log(`  wrong rows: ${wrongCount}, correct rows: ${correctCount}`);
    console.log(`  sample chapters:`, sample?.map((r) => `${r.chapter_number}:${r.verse_number}`).join(", "));
  }
}

async function applyFixes() {
  for (const { wrong, correct } of FIXES) {
    const { data, error } = await supabase
      .from("bible_verses")
      .update({ book_name: correct })
      .eq("book_name", wrong)
      .select("ID");
    if (error) {
      console.error(`FAILED ${wrong}:`, error.message);
    } else {
      console.log(`UPDATED ${wrong} -> ${correct}: ${data?.length ?? 0} rows`);
    }
  }
}

const mode = process.argv[2] ?? "inspect";
if (mode === "fix") await applyFixes();
else await inspect();
