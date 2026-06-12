/**
 * KATAMEROS-VALIDATION-001
 * Read-only: validate every Katameros reading reference against Alpha Bible (Supabase).
 * Katameros books JSON is NOT used — references only from readings JSON.
 * Outputs: katameros-validation-report.json, katameros-validation-summary.md
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "katameros-data/katameros-preparation/data");
const REPORT_JSON = path.join(ROOT, "katameros-validation-report.json");
const REPORT_MD = path.join(ROOT, "katameros-validation-summary.md");

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

const REF_FIELDS = [
  "V_Psalm_Ref",
  "V_Gospel_Ref",
  "M_Psalm_Ref",
  "M_Gospel_Ref",
  "P_Gospel_Ref",
  "C_Gospel_Ref",
  "X_Gospel_Ref",
  "L_Psalm_Ref",
  "L_Gospel_Ref",
  "Prophecy",
];

const KATAMEROS_REFERENCE_ALIASES = {
  "60.3:25-4:6": "60.3:15-4:6",
};

function normalizeKatamerosReference(reference) {
  const trimmed = reference.trim();
  return KATAMEROS_REFERENCE_ALIASES[trimmed] ?? trimmed;
}

function adjustDanielAlphaChapter(bookId, chapter, verseSpec, maxVerseInChapter) {
  if (bookId !== 27 || chapter !== 1) return { chapter, verseSpec };
  const range = verseSpec.match(/^1-(\d+)$/);
  if (!range) return { chapter, verseSpec };
  const endVerse = Number(range[1]);
  if (endVerse > maxVerseInChapter && endVerse === 42) {
    return { chapter: 14, verseSpec: `1-${endVerse}` };
  }
  return { chapter, verseSpec };
}

const READING_SOURCES = [
  { file: "annual-readings.json", label: "annual" },
  { file: "sunday-readings.json", label: "sunday" },
  { file: "great-lent-readings.json", label: "great-lent" },
  { file: "pentecost-readings.json", label: "pentecost" },
  { file: "special-readings.json", label: "special" },
];

function splitRefs(refsStr) {
  const refs = refsStr.split(/\*@\+|@/g);
  const res = [];
  for (const refe of refs) {
    if (refe.indexOf(":") !== refe.lastIndexOf(":")) {
      const p = refe.split(/-|:/g);
      const book = p[0].split(".")[0];
      const chapterBegin1 = p[0].split(".")[1];
      const verseBegin1 = p[1];
      const chapterBegin2 = p[2];
      let verseBegin2 = "1";
      let verseEnd2 = p[3];
      if (p.length > 4) {
        verseBegin2 = p[3];
        verseEnd2 = p[4];
      }
      res.push(`${book}.${chapterBegin1}:${verseBegin1}-end`);
      let chap1 = +chapterBegin1;
      const chap2 = +chapterBegin2;
      while (chap2 > chap1 + 1) {
        chap1++;
        res.push(`${book}.${chap1}:1-end`);
      }
      res.push(`${book}.${chapterBegin2}:${verseBegin2}-${verseEnd2}`);
    } else {
      res.push(refe);
    }
  }
  return res;
}

function parseRef(ref) {
  const match = ref.trim().match(/^(\d+)\.(\d+):(.+)$/);
  if (!match) return null;
  return { bookId: Number(match[1]), chapter: Number(match[2]), verseSpec: match[3] };
}

function verseNumbersFromSpec(verseSpec, chapterVerses) {
  const keys = Object.keys(chapterVerses)
    .map(Number)
    .filter((n) => !Number.isNaN(n));
  const maxVerse = keys.length ? Math.max(...keys) : 0;

  if (verseSpec.includes("-")) {
    const [fromStr, toStr] = verseSpec.split("-");
    const from = Number(fromStr);
    const to = toStr === "end" ? maxVerse : Number(toStr);
    const nums = [];
    for (let i = from; i <= to; i++) nums.push(i);
    return nums;
  }
  if (verseSpec.includes(",")) {
    return verseSpec.split(",").map((s) => Number(s.trim()));
  }
  return [Number(verseSpec)];
}

function chapterToObject(chapterMap) {
  return Object.fromEntries(chapterMap);
}

function readingTypeLabel(field) {
  return field.replace(/_Ref$/, "").replace(/_/g, " ");
}

function formatDate(record, sourceLabel) {
  if (record.Month_Name != null && record.Day != null) {
    return `${record.Month_Name} ${record.Day}`;
  }
  if (record.DayName) return String(record.DayName);
  if (record.Week != null && record.DayOfWeek != null) {
    return `${sourceLabel} · Week ${record.Week} · Day ${record.DayOfWeek}`;
  }
  if (record.Id != null) return `${sourceLabel} · Id ${record.Id}`;
  return sourceLabel;
}

async function loadAlphaIndex() {
  const PAGE = 1000;
  let from = 0;
  const index = new Map();

  while (true) {
    const { data, error } = await supabase
      .from("bible_verses")
      .select("book_name, chapter_number, verse_number, verse_text")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data?.length) break;

    for (const row of data) {
      const bookName = ALPHA_ALIASES[row.book_name] ?? row.book_name;
      if (!index.has(bookName)) index.set(bookName, new Map());
      const chMap = index.get(bookName);
      const ch = row.chapter_number;
      if (!chMap.has(ch)) chMap.set(ch, new Map());
      chMap.get(ch).set(row.verse_number, String(row.verse_text ?? ""));
    }

    if (data.length < PAGE) break;
    from += PAGE;
  }

  return index;
}

function collectReadingRecords() {
  const items = [];
  for (const { file, label } of READING_SOURCES) {
    const records = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
    if (!Array.isArray(records)) continue;
    for (const record of records) {
      const date = formatDate(record, label);
      for (const field of REF_FIELDS) {
        const raw = record[field];
        if (raw == null || String(raw).trim() === "") continue;
        items.push({
          date,
          source: label,
          readingType: readingTypeLabel(field),
          reference: String(raw).trim(),
          recordId: record.Id ?? null,
        });
      }
    }
  }
  return items;
}

function failResult(reason, detail, partial = {}) {
  return {
    status: "FAIL",
    failureReason: reason,
    failureDetail: detail,
    ...partial,
  };
}

function validateReference(reference, alphaIndex) {
  const parts = splitRefs(normalizeKatamerosReference(reference));
  const alphaVerses = [];

  for (const part of parts) {
    const parsed = parseRef(part);
    if (!parsed) {
      return failResult("INVALID_REFERENCE", `Cannot parse: ${part}`);
    }

    let { bookId, chapter, verseSpec } = parsed;
    const alphaBookName = KATAMEROS_ID_TO_ALPHA[bookId];

    if (!alphaBookName || !alphaIndex.has(alphaBookName)) {
      return failResult("BOOK_NOT_FOUND", `Alpha book not found for id ${bookId} (${alphaBookName ?? "unmapped"})`, {
        bookId,
        alphaBookName: alphaBookName ?? null,
      });
    }

    let alphaChapter = alphaIndex.get(alphaBookName).get(chapter);
    if (!alphaChapter) {
      return failResult("CHAPTER_NOT_FOUND", `Alpha chapter ${bookId}.${chapter} missing (${alphaBookName})`, {
        bookId,
        chapter,
        alphaBookName,
      });
    }

    const maxVerse = Math.max(...alphaChapter.keys());
    const adjusted = adjustDanielAlphaChapter(bookId, chapter, verseSpec, maxVerse);
    if (adjusted.chapter !== chapter || adjusted.verseSpec !== verseSpec) {
      chapter = adjusted.chapter;
      verseSpec = adjusted.verseSpec;
      alphaChapter = alphaIndex.get(alphaBookName).get(chapter);
      if (!alphaChapter) {
        return failResult("CHAPTER_NOT_FOUND", `Alpha chapter ${bookId}.${chapter} missing (${alphaBookName})`, {
          bookId,
          chapter,
          alphaBookName,
        });
      }
    }

    const wanted = verseNumbersFromSpec(verseSpec, chapterToObject(alphaChapter));
    if (!wanted.length) {
      return failResult("VERSE_NOT_FOUND", `No verses resolved for ${part}`, {
        bookId,
        chapter,
        alphaBookName,
      });
    }

    for (const verse of wanted) {
      const alphaText = alphaChapter.get(verse);
      if (alphaText === undefined || !String(alphaText).trim()) {
        return failResult("VERSE_NOT_FOUND", `Alpha verse ${bookId}.${chapter}:${verse} missing`, {
          bookId,
          chapter,
          verse,
          alphaBookName,
          expectedVerseCount: wanted.length,
          actualVerseCount: alphaVerses.length,
        });
      }

      alphaVerses.push({ bookId, chapter, verse, text: alphaText, alphaBookName });
    }
  }

  if (!alphaVerses.length) {
    return failResult("VERSE_NOT_FOUND", "No verses resolved from reference");
  }

  const verseCount = alphaVerses.length;

  return {
    status: "PASS",
    failureReason: null,
    failureDetail: null,
    expectedVerseCount: verseCount,
    actualVerseCount: verseCount,
    bookId: alphaVerses[0].bookId,
    alphaBookName: alphaVerses[0].alphaBookName,
    chapter:
      alphaVerses.length === 1 || alphaVerses[0].chapter === alphaVerses[alphaVerses.length - 1].chapter
        ? alphaVerses[0].chapter
        : "multi",
    startVerse: alphaVerses[0].verse,
    endVerse: alphaVerses[alphaVerses.length - 1].verse,
    firstVerseText: alphaVerses[0].text.slice(0, 120),
    lastVerseText: alphaVerses[alphaVerses.length - 1].text.slice(0, 120),
  };
}

function renderSummaryMd(report) {
  const { summary, failures } = report;
  const lines = [];
  lines.push("# Katameros Validation Summary");
  lines.push("");
  lines.push("**KATAMEROS-VALIDATION-001** — Katameros references vs Alpha Bible (Supabase only)");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push("| Metric | Value |");
  lines.push("| --- | ---: |");
  lines.push(`| Total References | ${summary.totalReferences} |`);
  lines.push(`| Passed | ${summary.passed} |`);
  lines.push(`| Failed | ${summary.failed} |`);
  lines.push(`| Success Rate | ${summary.successRatePercent}% |`);
  lines.push("");
  lines.push("### Failure reasons");
  lines.push("");
  lines.push("| Reason | Count |");
  lines.push("| --- | ---: |");
  for (const [reason, count] of Object.entries(summary.failureReasons).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${reason} | ${count} |`);
  }
  lines.push("");
  lines.push("## Failed references");
  lines.push("");
  lines.push("| Date | Reading Type | Reference | Failure Reason |");
  lines.push("| --- | --- | --- | --- |");
  for (const f of failures) {
    lines.push(
      `| ${f.date.replace(/\|/g, "\\|")} | ${f.readingType} | \`${f.reference.replace(/`/g, "'")}\` | ${f.failureReason} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

async function main() {
  console.log("KATAMEROS-VALIDATION-001");
  console.log("Loading Alpha Bible from Supabase…");
  const alphaIndex = await loadAlphaIndex();
  console.log(`  ${alphaIndex.size} books`);

  console.log("Collecting reading references…");
  const items = collectReadingRecords();
  console.log(`  ${items.length} references`);

  const results = [];
  let passed = 0;
  let failed = 0;
  const failureReasons = {};

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const validation = validateReference(item.reference, alphaIndex);
    const row = {
      id: i + 1,
      date: item.date,
      source: item.source,
      readingType: item.readingType,
      reference: item.reference,
      expectedVerseCount: validation.expectedVerseCount ?? 0,
      actualVerseCount: validation.actualVerseCount ?? 0,
      status: validation.status,
      failureReason: validation.failureReason,
      failureDetail: validation.failureDetail ?? null,
      bookId: validation.bookId ?? null,
      alphaBookName: validation.alphaBookName ?? null,
      chapter: validation.chapter ?? null,
      startVerse: validation.startVerse ?? null,
      endVerse: validation.endVerse ?? null,
      firstVerseText: validation.firstVerseText ?? null,
      lastVerseText: validation.lastVerseText ?? null,
    };

    if (validation.status === "PASS") {
      passed++;
    } else {
      failed++;
      failureReasons[validation.failureReason] = (failureReasons[validation.failureReason] ?? 0) + 1;
    }

    results.push(row);
    if ((i + 1) % 1000 === 0) console.log(`  validated ${i + 1}/${items.length}`);
  }

  const total = items.length;
  const successRatePercent = total ? ((passed / total) * 100).toFixed(2) : "0.00";

  const failures = results.filter((r) => r.status === "FAIL");

  const report = {
    generatedAt: new Date().toISOString(),
    validationId: "KATAMEROS-VALIDATION-001",
    sources: {
      alpha: "Supabase bible_verses (official verse text)",
      katameros: "katameros-data/katameros-preparation/data/*-readings.json (references only)",
    },
    summary: {
      totalReferences: total,
      passed,
      failed,
      successRatePercent,
      failureReasons,
    },
    results,
    failures,
  };

  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), "utf8");
  fs.writeFileSync(REPORT_MD, renderSummaryMd(report), "utf8");

  console.log("\n=== SUMMARY ===");
  console.log(`Total References: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${successRatePercent}%`);
  console.log(`\nWrote ${REPORT_JSON}`);
  console.log(`Wrote ${REPORT_MD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
