import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://usflbjlyadihyitnvzya.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZmxiamx5YWRpaHlpdG52enlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3OTM5NDQsImV4cCI6MjA5NDM2OTk0NH0.rntQyBXmRPag1LtpVRCfIHdZbI3BAgV8rU5agbTgUNY",
);

const ALIASES = {
  "رسالة بول الرسول إلى تيطس": "رسالة بولس الرسول إلى تيطس",
  "رسالة بولس الرسول الثانية إلى أهل تسالونيك": "رسالة بولس الرسول الثانية إلى أهل تسالونيكي",
  "سفر أخبار لأيام الثاني": "سفر أخبار الأيام الثاني",
  "سفر المزاير": "سفر المزامير",
  "سفر يوديت": "سفر يهوديت",
};

async function fetchAll() {
  const PAGE = 1000;
  let from = 0;
  const rows = [];
  while (true) {
    const { data, error } = await supabase
      .from("bible_verses")
      .select("book_name, chapter_number, verse_number")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return rows;
}

function analyze(rows) {
  const books = new Map();
  for (const r of rows) {
    const book = ALIASES[r.book_name] ?? r.book_name;
    if (!books.has(book)) books.set(book, new Map());
    const chMap = books.get(book);
    const ch = r.chapter_number;
    if (!chMap.has(ch)) chMap.set(ch, []);
    chMap.get(ch).push(r.verse_number);
  }

  console.log("=== GAPS IN CHAPTER NUMBERS ===");
  for (const [book, chMap] of [...books.entries()].sort((a, b) => a[0].localeCompare(b[0], "ar"))) {
    const nums = [...chMap.keys()].sort((a, b) => a - b);
    const gaps = [];
    for (let i = 1; i < nums.length; i++) {
      for (let g = nums[i - 1] + 1; g < nums[i]; g++) gaps.push(g);
    }
    if (gaps.length) console.log(`${book}: missing chapters ${gaps.join(", ")}`);
  }

  console.log("\n=== GAPS IN VERSE NUMBERS (first 40 issues) ===");
  console.log("Note: Sirach 29 may show gaps 16-17 when verses are stored as 18-35 — run fix_sirach_29 migration.");
  let n = 0;
  for (const [book, chMap] of books) {
    for (const [ch, verses] of [...chMap.entries()].sort((a, b) => a[0] - b[0])) {
      const sorted = [...new Set(verses)].sort((a, b) => a - b);
      const max = sorted.at(-1);
      const gaps = [];
      for (let v = 1; v <= max; v++) {
        if (!sorted.includes(v)) gaps.push(v);
      }
      if (gaps.length) {
        console.log(`${book} ${ch}: ${sorted.length}/${max} verses, missing v ${gaps.slice(0, 15).join(",")}${gaps.length > 15 ? "..." : ""}`);
        if (++n >= 40) {
          console.log("... truncated");
          return;
        }
      }
    }
  }

  console.log("\n=== DUPLICATE BOOK NAMES STILL IN DB ===");
  const rawBooks = new Map();
  for (const r of rows) {
    rawBooks.set(r.book_name, (rawBooks.get(r.book_name) ?? 0) + 1);
  }
  for (const [name, count] of rawBooks) {
    if (ALIASES[name]) console.log(`  typo still present: "${name}" (${count} verses)`);
  }

  console.log("\n=== BOOKS WITH UNUSUALLY SHORT CHAPTERS (<=3 verses, ch>1) ===");
  let short = 0;
  for (const [book, chMap] of books) {
    for (const [ch, verses] of chMap) {
      const unique = new Set(verses).size;
      if (ch > 1 && unique <= 3) {
        console.log(`  ${book} ch${ch}: ${unique} verses`);
        if (++short >= 25) {
          console.log("  ... truncated");
          return;
        }
      }
    }
  }
}

fetchAll().then(analyze).catch(console.error);
