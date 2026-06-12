/**
 * Compare Alpha Bible (Supabase bible_verses) vs Katameros books JSON.
 * Report only — writes bible-comparison-report.md
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const KATAMEROS_BOOKS_DIR = path.join(
  ROOT,
  "katameros-data/katameros-preparation/data/books",
);
const REPORT_PATH = path.join(ROOT, "bible-comparison-report.md");

const supabase = createClient(
  "https://usflbjlyadihyitnvzya.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZmxiamx5YWRpaHlpdG52enlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3OTM5NDQsImV4cCI6MjA5NDM2OTk0NH0.rntQyBXmRPag1LtpVRCfIHdZbI3BAgV8rU5agbTgUNY",
);

const ALPHA_ALIASES = {
  "رسالة بول الرسول إلى تيطس": "رسالة بولس الرسول إلى تيطس",
  "رسالة بولس الرسول الثانية إلى أهل تسالونيك": "رسالة بولس الرسول الثانية إلى أهل تسالونيكي",
  "سفر أخبار لأيام الثاني": "سفر أخبار الأيام الثاني",
  "سفر المزاير": "سفر المزامير",
  "سفر يوديت": "سفر يهوديت",
};

/** Katameros numeric book ID → canonical Alpha Supabase book_name */
const KATAMEROS_ID_TO_ALPHA = {
  1: "سفر التكوين",
  2: "سفر الخروج",
  3: "سفر اللاويين",
  4: "سفر العدد",
  5: "سفر التثنية",
  6: "سفر يشوع",
  7: "سفر القضاة",
  8: "سفر راعوث",
  9: "سفر صموئيل الأول",
  10: "سفر صموئيل الثاني",
  11: "سفر الملوك الأول",
  12: "سفر الملوك الثاني",
  13: "سفر أخبار الأيام الأول",
  14: "سفر أخبار الأيام الثاني",
  15: "سفر عزرا",
  16: "سفر نحميا",
  17: "سفر أستير",
  18: "سفر أيوب",
  19: "سفر المزامير",
  20: "سفر الأمثال",
  21: "سفر الجامعة",
  22: "سفر نشيد الأنشاد",
  23: "سفر إشعياء",
  24: "سفر إرميا",
  25: "مراثي إرميا",
  26: "سفر حزقيال",
  27: "سفر دانيال",
  28: "سفر هوشع",
  29: "سفر يوئيل",
  30: "سفر عاموس",
  31: "سفر عوبديا",
  32: "سفر يونان",
  33: "سفر ميخا",
  34: "سفر ناحوم",
  35: "سفر حبقوق",
  36: "سفر صفنيا",
  37: "سفر حجي",
  38: "سفر زكريا",
  39: "سفر ملاخي",
  40: "إنجيل متى",
  41: "إنجيل مرقس",
  42: "إنجيل لوقا",
  43: "إنجيل يوحنا",
  44: "سفر أعمال الرسل",
  45: "رسالة بولس الرسول إلى أهل رومية",
  46: "رسالة بولس الرسول الأولى إلى أهل كورنثوس",
  47: "رسالة بولس الرسول الثانية إلى أهل كورنثوس",
  48: "رسالة بولس الرسول إلى أهل غلاطية",
  49: "رسالة بولس الرسول إلى أهل أفسس",
  50: "رسالة بولس الرسول إلى أهل فيلبي",
  51: "رسالة بولس الرسول إلى أهل كولوسي",
  52: "رسالة بولس الرسول الأولى إلى أهل تسالونيكي",
  53: "رسالة بولس الرسول الثانية إلى أهل تسالونيكي",
  54: "رسالة بولس الرسول الأولى إلى تيموثاوس",
  55: "رسالة بولس الرسول الثانية إلى تيموثاوس",
  56: "رسالة بولس الرسول إلى تيطس",
  57: "رسالة بولس الرسول إلى فليمون",
  58: "رسالة بولس الرسول إلى العبرانيين",
  59: "رسالة يعقوب",
  60: "رسالة بطرس الرسول الأولى",
  61: "رسالة بطرس الرسول الثانية",
  62: "رسالة يوحنا الرسول الأولى",
  63: "رسالة يوحنا الرسول الثانية",
  64: "رسالة يوحنا الرسول الثالثة",
  65: "رسالة يهوذا",
  66: "رؤيا يوحنا اللاهوتي",
  67: "سفر طوبيا",
  68: "سفر باروخ",
  69: "سفر يهوديت",
  70: "سفر المكابيين الأول",
  71: "سفر المكابيين الثاني",
  72: "سفر الحكمة",
  73: "سفر يشوع بن سيراخ",
};

function normalizeName(name) {
  return name
    .trim()
    .replace(/^سفر\s+/u, "")
    .replace(/^إنجيل\s+/u, "")
    .replace(/^رسالة\s+/u, "")
    .replace(/\s+/gu, "")
    .replace(/[أإآ]/gu, "ا")
    .replace(/ى/gu, "ي")
    .replace(/ة/gu, "ه")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toLowerCase();
}

function loadKatamerosBooks() {
  const books = new Map();
  for (const file of fs.readdirSync(KATAMEROS_BOOKS_DIR)) {
    const match = file.match(/^(\d+)\.json$/);
    if (!match) continue;
    const id = Number(match[1]);
    const json = JSON.parse(fs.readFileSync(path.join(KATAMEROS_BOOKS_DIR, file), "utf8"));
    const chapters = new Map();
    for (const [chKey, versesObj] of Object.entries(json.chapters ?? {})) {
      const ch = Number(chKey);
      const verses = new Set();
      const empty = [];
      for (const [vKey, text] of Object.entries(versesObj ?? {})) {
        const v = Number(vKey);
        if (Number.isNaN(v)) continue;
        verses.add(v);
        if (!String(text ?? "").trim()) empty.push(v);
      }
      chapters.set(ch, { verses, empty });
    }
    books.set(id, {
      id,
      name: json.name,
      numChapters: json.numChapters,
      chapters,
    });
  }
  return books;
}

async function loadAlphaBooks() {
  const PAGE = 1000;
  let from = 0;
  const rows = [];
  while (true) {
    const { data, error } = await supabase
      .from("bible_verses")
      .select("book_name, chapter_number, verse_number, verse_text")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  const books = new Map();
  for (const row of rows) {
    const bookName = ALPHA_ALIASES[row.book_name] ?? row.book_name;
    if (!books.has(bookName)) books.set(bookName, new Map());
    const chMap = books.get(bookName);
    const ch = row.chapter_number;
    if (!chMap.has(ch)) chMap.set(ch, { verses: new Set(), empty: [] });
    const entry = chMap.get(ch);
    entry.verses.add(row.verse_number);
    if (!String(row.verse_text ?? "").trim()) entry.empty.push(row.verse_number);
  }
  return books;
}

function matchBooks(katamerosBooks, alphaBooks) {
  const pairs = [];
  const usedAlpha = new Set();

  for (const [id, kat] of [...katamerosBooks.entries()].sort((a, b) => a[0] - b[0])) {
    const alphaName = KATAMEROS_ID_TO_ALPHA[id] ?? null;
    const alpha = alphaName && alphaBooks.has(alphaName) ? alphaBooks.get(alphaName) : null;

    if (alphaName && alpha) usedAlpha.add(alphaName);

    pairs.push({
      bookNumber: id,
      katameros: kat,
      alphaName: alpha ? alphaName : null,
      alpha,
      expectedAlphaName: alphaName,
    });
  }

  const unmatchedAlpha = [...alphaBooks.keys()].filter((n) => !usedAlpha.has(n));
  const missingKatamerosIds = Object.keys(KATAMEROS_ID_TO_ALPHA)
    .map(Number)
    .filter((id) => !katamerosBooks.has(id));

  return { pairs, unmatchedAlpha, missingKatamerosIds };
}

function verseList(set) {
  return [...set].sort((a, b) => a - b);
}

function formatVerseRange(nums) {
  if (!nums.length) return "0";
  if (nums.length <= 8) return nums.join(", ");
  return `${nums.slice(0, 6).join(", ")}… (+${nums.length - 6} more)`;
}

function compareSources(katamerosBooks, alphaBooks) {
  const rows = [];
  const summary = {
    totalBooksAlpha: alphaBooks.size,
    totalBooksKatameros: katamerosBooks.size,
    missingBooks: 0,
    missingChapters: 0,
    missingVerses: 0,
    extraVerses: 0,
    emptyVersesAlpha: 0,
    emptyVersesKatameros: 0,
    issueRows: 0,
  };

  const { pairs, unmatchedAlpha, missingKatamerosIds } = matchBooks(katamerosBooks, alphaBooks);

  for (const id of missingKatamerosIds) {
    const alphaName = KATAMEROS_ID_TO_ALPHA[id];
    if (!alphaBooks.has(alphaName)) continue;
    summary.missingBooks++;
    const alpha = alphaBooks.get(alphaName);
    let verseCount = 0;
    for (const ch of alpha.values()) verseCount += ch.verses.size;
    rows.push({
      bookNumber: id,
      alphaName,
      katamerosName: "—",
      chapter: "—",
      issueType: "missing_book_katameros",
      alphaCount: `${alpha.size} ch / ${verseCount} v`,
      katamerosCount: "0",
      details: `Expected Katameros book ${id}.json is absent; Alpha has ${alphaName}`,
    });
  }

  const missingKatamerosAlphaNames = new Set(
    missingKatamerosIds.map((id) => KATAMEROS_ID_TO_ALPHA[id]).filter(Boolean),
  );

  for (const alphaName of unmatchedAlpha) {
    if (missingKatamerosAlphaNames.has(alphaName)) continue;
    summary.missingBooks++;
    const alpha = alphaBooks.get(alphaName);
    const chCount = alpha?.size ?? 0;
    let verseCount = 0;
    for (const ch of alpha?.values() ?? []) verseCount += ch.verses.size;
    rows.push({
      bookNumber: "—",
      alphaName,
      katamerosName: "—",
      chapter: "—",
      issueType: "missing_book_katameros",
      alphaCount: chCount ? `${chCount} ch / ${verseCount} v` : "0",
      katamerosCount: "0",
      details: `Book exists in Alpha only: ${alphaName}`,
    });
  }

  for (const pair of pairs) {
    const { bookNumber, katameros, alphaName, alpha } = pair;

    if (!alpha) {
      summary.missingBooks++;
      rows.push({
        bookNumber,
        alphaName: pair.expectedAlphaName ?? "—",
        katamerosName: katameros.name,
        chapter: "—",
        issueType: "missing_book_alpha",
        alphaCount: "0",
        katamerosCount: String(katameros.chapters.size),
        details: pair.expectedAlphaName
          ? `Katameros book ${bookNumber} present; Alpha missing ${pair.expectedAlphaName}`
          : `Book ${bookNumber} has no Alpha mapping`,
      });
      continue;
    }

    if (normalizeName(alphaName) !== normalizeName(katameros.name)) {
      rows.push({
        bookNumber,
        alphaName,
        katamerosName: katameros.name,
        chapter: "—",
        issueType: "book_name_mismatch",
        alphaCount: alphaName,
        katamerosCount: katameros.name,
        details: "Display names differ (ID mapping still applied)",
      });
    }

    const alphaChapters = [...alpha.keys()].sort((a, b) => a - b);
    const katChapters = [...katameros.chapters.keys()].sort((a, b) => a - b);

    if (alphaChapters.length !== katChapters.length) {
      rows.push({
        bookNumber,
        alphaName,
        katamerosName: katameros.name,
        chapter: "—",
        issueType: "chapter_count_mismatch",
        alphaCount: String(alphaChapters.length),
        katamerosCount: String(katChapters.length),
        details: `Alpha chapters: ${alphaChapters.length}, Katameros chapters: ${katChapters.length}, declared numChapters: ${katameros.numChapters}`,
      });
    }

    const allChapters = new Set([...alphaChapters, ...katChapters]);
    for (const ch of [...allChapters].sort((a, b) => a - b)) {
      const aCh = alpha.get(ch);
      const kCh = katameros.chapters.get(ch);

      if (!aCh && kCh) {
        summary.missingChapters++;
        rows.push({
          bookNumber,
          alphaName,
          katamerosName: katameros.name,
          chapter: String(ch),
          issueType: "missing_chapter_alpha",
          alphaCount: "0",
          katamerosCount: String(kCh.verses.size),
          details: `Chapter ${ch} in Katameros only (${kCh.verses.size} verse keys)`,
        });
        continue;
      }

      if (aCh && !kCh) {
        summary.missingChapters++;
        rows.push({
          bookNumber,
          alphaName,
          katamerosName: katameros.name,
          chapter: String(ch),
          issueType: "missing_chapter_katameros",
          alphaCount: String(aCh.verses.size),
          katamerosCount: "0",
          details: `Chapter ${ch} in Alpha only (${aCh.verses.size} verses)`,
        });
        continue;
      }

      const aVerses = verseList(aCh.verses);
      const kVerses = verseList(kCh.verses);
      const missingInAlpha = kVerses.filter((v) => !aCh.verses.has(v));
      const extraInAlpha = aVerses.filter((v) => !kCh.verses.has(v));

      if (missingInAlpha.length) {
        summary.missingVerses += missingInAlpha.length;
        rows.push({
          bookNumber,
          alphaName,
          katamerosName: katameros.name,
          chapter: String(ch),
          issueType: "missing_verse_alpha",
          alphaCount: String(aCh.verses.size),
          katamerosCount: String(kCh.verses.size),
          details: `Verses in Katameros but not Alpha: ${formatVerseRange(missingInAlpha)}`,
        });
      }

      if (extraInAlpha.length) {
        summary.extraVerses += extraInAlpha.length;
        rows.push({
          bookNumber,
          alphaName,
          katamerosName: katameros.name,
          chapter: String(ch),
          issueType: "extra_verse_alpha",
          alphaCount: String(aCh.verses.size),
          katamerosCount: String(kCh.verses.size),
          details: `Verses in Alpha but not Katameros: ${formatVerseRange(extraInAlpha)}`,
        });
      }

      if (aCh.empty.length) {
        summary.emptyVersesAlpha += aCh.empty.length;
        rows.push({
          bookNumber,
          alphaName,
          katamerosName: katameros.name,
          chapter: String(ch),
          issueType: "empty_verse_alpha",
          alphaCount: String(aCh.verses.size),
          katamerosCount: String(kCh.verses.size),
          details: `Empty verse text in Alpha: ${formatVerseRange(aCh.empty)}`,
        });
      }

      if (kCh.empty.length) {
        summary.emptyVersesKatameros += kCh.empty.length;
        rows.push({
          bookNumber,
          alphaName,
          katamerosName: katameros.name,
          chapter: String(ch),
          issueType: "empty_verse_katameros",
          alphaCount: String(aCh.verses.size),
          katamerosCount: String(kCh.verses.size),
          details: `Empty verse text in Katameros: ${formatVerseRange(kCh.empty)}`,
        });
      }
    }
  }

  summary.issueRows = rows.length;
  return { rows, summary };
}

function recommendSource(summary) {
  if (summary.missingBooks > 0) {
    return (
      "**Alpha Bible (Supabase)** as the primary app source — it includes deuterocanonical books missing from Katameros JSON files (Tobit, Judith, 1–2 Maccabees). " +
      "Use **Katameros JSON** only for Katameros `bookId` reference resolution, with a parser that handles single-block chapters and Orthodox chapter splits (Esther, Daniel, Psalms 151)."
    );
  }
  if (summary.extraVerses > summary.missingVerses) {
    return "**Alpha Bible (Supabase)** — per-verse structure and fuller Orthodox canon; Katameros JSON compresses many chapters into single verse keys.";
  }
  return "**Alpha Bible (Supabase)** for reading UI; Katameros JSON for numeric book-id lookups after structural normalization.";
}

function mdEscape(s) {
  return String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function renderReport({ rows, summary }) {
  const lines = [];
  lines.push("# Bible Source Comparison Report");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("## Sources");
  lines.push("");
  lines.push("- **Source A (Alpha):** Supabase `bible_verses` table (canonical book names after typo merge)");
  lines.push("- **Source B (Katameros):** `katameros-data/katameros-preparation/data/books/*.json`");
  lines.push("");
  lines.push("> Structure-only comparison (book → chapter → verse). Text wording not compared.");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`| Metric | Count |`);
  lines.push(`| --- | ---: |`);
  lines.push(`| Total books (Alpha) | ${summary.totalBooksAlpha} |`);
  lines.push(`| Total books (Katameros) | ${summary.totalBooksKatameros} |`);
  lines.push(`| Missing books (either source) | ${summary.missingBooks} |`);
  lines.push(`| Missing chapters | ${summary.missingChapters} |`);
  lines.push(`| Missing verses (in Alpha) | ${summary.missingVerses} |`);
  lines.push(`| Extra verses (in Alpha only) | ${summary.extraVerses} |`);
  lines.push(`| Empty verses (Alpha) | ${summary.emptyVersesAlpha} |`);
  lines.push(`| Empty verses (Katameros) | ${summary.emptyVersesKatameros} |`);
  lines.push(`| Total issue rows | ${summary.issueRows} |`);
  lines.push("");
  lines.push("### Recommended source");
  lines.push("");
  lines.push(recommendSource(summary));
  lines.push("");
  lines.push("## Issue table");
  lines.push("");
  lines.push(
    "| Book # | Book name (Alpha) | Book name (Katameros) | Chapter | Issue type | Alpha count | Katameros count | Details |",
  );
  lines.push("| ---: | --- | --- | ---: | --- | ---: | ---: | --- |");

  const MAX_ROWS = 500;
  const shown = rows.slice(0, MAX_ROWS);
  for (const row of shown) {
    lines.push(
      `| ${mdEscape(row.bookNumber)} | ${mdEscape(row.alphaName)} | ${mdEscape(row.katamerosName)} | ${mdEscape(row.chapter)} | ${row.issueType} | ${mdEscape(row.alphaCount)} | ${mdEscape(row.katamerosCount)} | ${mdEscape(row.details)} |`,
    );
  }

  if (rows.length > MAX_ROWS) {
    lines.push("");
    lines.push(`_Table truncated at ${MAX_ROWS} rows (${rows.length - MAX_ROWS} more issues)._`);
  }

  lines.push("");
  return lines.join("\n");
}

async function main() {
  console.log("Loading Katameros books…");
  const katamerosBooks = loadKatamerosBooks();
  console.log(`Katameros: ${katamerosBooks.size} books`);

  console.log("Fetching Alpha bible_verses from Supabase…");
  const alphaBooks = await loadAlphaBooks();
  console.log(`Alpha: ${alphaBooks.size} books`);

  const result = compareSources(katamerosBooks, alphaBooks);
  const markdown = renderReport(result);
  fs.writeFileSync(REPORT_PATH, markdown, "utf8");

  console.log("\n=== SUMMARY ===");
  console.log(JSON.stringify(result.summary, null, 2));
  console.log(`\nReport written to ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
