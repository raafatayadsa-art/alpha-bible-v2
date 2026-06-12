import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://usflbjlyadihyitnvzya.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZmxiamx5YWRpaHlpdG52enlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3OTM5NDQsImV4cCI6MjA5NDM2OTk0NH0.rntQyBXmRPag1LtpVRCfIHdZbI3BAgV8rU5agbTgUNY";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

/** Expected chapters — Orthodox / Coptic Arabic Bible (Van Dyck-style naming). */
const EXPECTED = {
  "سفر التكوين": 50,
  "سفر الخروج": 40,
  "سفر اللاويين": 27,
  "سفر العدد": 36,
  "سفر التثنية": 34,
  "سفر يشوع": 24,
  "سفر القضاة": 21,
  "سفر راعوث": 4,
  "سفر صموئيل الأول": 31,
  "سفر صموئيل الثاني": 24,
  "سفر الملوك الأول": 22,
  "سفر الملوك الثاني": 25,
  "سفر أخبار الأيام الأول": 29,
  "سفر أخبار الأيام الثاني": 36,
  "سفر عزرا": 10,
  "سفر نحميا": 13,
  "سفر طوبيا": 14,
  "سفر يهوديت": 16,
  "سفر أستير": 16,
  "سفر المكابيين الأول": 16,
  "سفر المكابيين الثاني": 15,
  "سفر أيوب": 42,
  "سفر المزامير": 151,
  "سفر الأمثال": 31,
  "سفر الجامعة": 12,
  "سفر نشيد الأنشاد": 8,
  "سفر الحكمة": 19,
  "سفر يشوع بن سيراخ": 51,
  "سفر إشعياء": 66,
  "سفر إرميا": 52,
  "مراثي إرميا": 5,
  "سفر باروخ": 6,
  "سفر حزقيال": 48,
  "سفر دانيال": 14,
  "سفر هوشع": 14,
  "سفر يوئيل": 3,
  "سفر عاموس": 9,
  "سفر عوبديا": 1,
  "سفر يونان": 4,
  "سفر ميخا": 7,
  "سفر ناحوم": 3,
  "سفر حبقوق": 3,
  "سفر صفنيا": 3,
  "سفر حجي": 2,
  "سفر زكريا": 14,
  "سفر ملاخي": 4,
  "إنجيل متى": 28,
  "إنجيل مرقس": 16,
  "إنجيل لوقا": 24,
  "إنجيل يوحنا": 21,
  "سفر أعمال الرسل": 28,
  "رسالة بولس الرسول إلى أهل رومية": 16,
  "رسالة بولس الرسول الأولى إلى أهل كورنثوس": 16,
  "رسالة بولس الرسول الثانية إلى أهل كورنثوس": 13,
  "رسالة بولس الرسول إلى أهل غلاطية": 6,
  "رسالة بولس الرسول إلى أهل أفسس": 6,
  "رسالة بولس الرسول إلى أهل فيلبي": 4,
  "رسالة بولس الرسول إلى أهل كولوسي": 4,
  "رسالة بولس الرسول الأولى إلى أهل تسالونيكي": 5,
  "رسالة بولس الرسول الثانية إلى أهل تسالونيكي": 3,
  "رسالة بولس الرسول الأولى إلى تيموثاوس": 6,
  "رسالة بولس الرسول الثانية إلى تيموثاوس": 4,
  "رسالة بولس الرسول إلى تيطس": 3,
  "رسالة بولس الرسول إلى فليمون": 1,
  "رسالة بولس الرسول إلى العبرانيين": 13,
  "رسالة يعقوب": 5,
  "رسالة بطرس الرسول الأولى": 5,
  "رسالة بطرس الرسول الثانية": 3,
  "رسالة يوحنا الرسول الأولى": 5,
  "رسالة يوحنا الرسول الثانية": 1,
  "رسالة يوحنا الرسول الثالثة": 1,
  "رسالة يهوذا": 1,
  "رؤيا يوحنا اللاهوتي": 22,
};

const ALIASES = {
  "رسالة بول الرسول إلى تيطس": "رسالة بولس الرسول إلى تيطس",
  "رسالة بولس الرسول الثانية إلى أهل تسالونيك": "رسالة بولس الرسول الثانية إلى أهل تسالونيكي",
  "سفر أخبار لأيام الثاني": "سفر أخبار الأيام الثاني",
  "سفر المزاير": "سفر المزامير",
  "سفر يوديت": "سفر يهوديت",
};

async function fetchBookChapterStats() {
  const PAGE = 1000;
  let from = 0;
  /** canonical book -> chapter -> verse count */
  const stats = new Map();

  while (true) {
    const { data, error } = await supabase
      .from("bible_verses")
      .select("book_name, chapter_number, verse_number")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data?.length) break;

    for (const row of data) {
      const canonical = ALIASES[row.book_name] ?? row.book_name;
      if (!stats.has(canonical)) stats.set(canonical, new Map());
      const chapters = stats.get(canonical);
      const ch = row.chapter_number;
      if (!chapters.has(ch)) chapters.set(ch, new Set());
      chapters.get(ch).add(row.verse_number);
    }

    if (data.length < PAGE) break;
    from += PAGE;
  }

  return stats;
}

function chapterRange(max) {
  return Array.from({ length: max }, (_, i) => i + 1);
}

async function audit() {
  const stats = await fetchBookChapterStats();
  const dbBooks = [...stats.keys()].sort((a, b) => a.localeCompare(b, "ar"));
  const expectedBooks = Object.keys(EXPECTED).sort((a, b) => a.localeCompare(b, "ar"));

  console.log("=== CHAPTER COUNT AUDIT ===\n");

  const issues = [];
  const missingBooks = [];
  const extraBooks = [];

  for (const book of expectedBooks) {
    const chapters = stats.get(book);
    const expected = EXPECTED[book];
    if (!chapters) {
      missingBooks.push(book);
      issues.push({ book, type: "missing_book", expected, actual: 0, missingChapters: chapterRange(expected) });
      continue;
    }

    const present = [...chapters.keys()].sort((a, b) => a - b);
    const actual = present.length;
    const missing = chapterRange(expected).filter((c) => !chapters.has(c));
    const extra = present.filter((c) => c > expected);

    if (actual !== expected || missing.length || extra.length) {
      issues.push({ book, type: "chapter_mismatch", expected, actual, missingChapters: missing, extraChapters: extra, maxChapter: present.at(-1) });
    }
  }

  for (const book of dbBooks) {
    if (!EXPECTED[book] && !Object.values(ALIASES).includes(book)) {
      const chapters = stats.get(book);
      extraBooks.push({ book, chapters: chapters.size });
    }
  }

  console.log(`Books in DB (canonical): ${dbBooks.length}`);
  console.log(`Expected Orthodox books: ${expectedBooks.length}`);
  console.log(`Books with chapter issues: ${issues.length}\n`);

  if (missingBooks.length) {
    console.log("--- MISSING BOOKS ---");
    for (const b of missingBooks) console.log(`  ❌ ${b}`);
    console.log();
  }

  if (extraBooks.length) {
    console.log("--- EXTRA / UNMAPPED BOOKS IN DB ---");
    for (const { book, chapters } of extraBooks) console.log(`  ⚠️  ${book}: ${chapters} chapters`);
    console.log();
  }

  console.log("--- INCOMPLETE OR WRONG CHAPTER COUNTS ---");
  for (const i of issues.filter((x) => x.type === "chapter_mismatch")) {
    const miss = i.missingChapters?.length ? ` missing [${i.missingChapters.slice(0, 20).join(",")}${i.missingChapters.length > 20 ? "..." : ""}]` : "";
    const extra = i.extraChapters?.length ? ` extra [${i.extraChapters.join(",")}]` : "";
    console.log(`  ❌ ${i.book}: expected ${i.expected}, got ${i.actual} (max ch ${i.maxChapter})${miss}${extra}`);
  }

  // Sample empty/suspicious chapters
  console.log("\n--- CHAPTERS WITH VERY FEW VERSES (possible partial import) ---");
  let suspicious = 0;
  for (const [book, chapters] of stats) {
    const expected = EXPECTED[book];
    if (!expected) continue;
    for (const [ch, verses] of chapters) {
      if (verses.size <= 2 && ch <= expected) {
        console.log(`  ⚠️  ${book} ch ${ch}: only ${verses.size} verse(s)`);
        suspicious++;
        if (suspicious >= 30) {
          console.log("  ... (truncated)");
          break;
        }
      }
    }
    if (suspicious >= 30) break;
  }

  // Summary table of all books
  console.log("\n--- FULL INVENTORY ---");
  for (const book of expectedBooks) {
    const chapters = stats.get(book);
    const expected = EXPECTED[book];
    const actual = chapters?.size ?? 0;
    const mark = actual === expected ? "✅" : "❌";
    console.log(`${mark} ${book}: ${actual}/${expected}`);
  }
}

audit().catch((e) => {
  console.error(e);
  process.exit(1);
});
