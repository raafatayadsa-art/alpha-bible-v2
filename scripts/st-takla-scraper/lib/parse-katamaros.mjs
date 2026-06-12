import * as cheerio from "cheerio";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  dayId,
  normalizeWhitespace,
  stripHtml,
} from "./utils.mjs";
import {
  parseCopticFromPageText,
  detectSeason,
} from "./coptic-calendar.mjs";
import { parseSynaxariumEmbedFromKatamaros } from "./parse-synaxarium.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const readingTypes = JSON.parse(
  readFileSync(join(__dirname, "../discovery/reading-types.json"), "utf8")
);

const SUBHEADING_MAP = [
  { pattern: /^مزمور العشية/u, reading_type: "vespers_psalm", title_ar: "مزمور العشية", source_ar: "العشية" },
  { pattern: /^إنجيل العشية/u, reading_type: "vespers_gospel", title_ar: "إنجيل العشية", source_ar: "العشية" },
  { pattern: /^مزمور باكر/u, reading_type: "matins_psalm", title_ar: "مزمور باكر", source_ar: "باكر" },
  { pattern: /^إنجيل باكر/u, reading_type: "matins_gospel", title_ar: "إنجيل باكر", source_ar: "باكر" },
  { pattern: /^البولس/u, reading_type: "pauline", title_ar: "البولس", source_ar: "قراءات القداس" },
  { pattern: /^الكاثوليكون/u, reading_type: "catholic", title_ar: "الكاثوليكون", source_ar: "قراءات القداس" },
  { pattern: /^الإبركسيس/u, reading_type: "praxis", title_ar: "الإبركسيس", source_ar: "قراءات القداس" },
  { pattern: /^السنكسار/u, reading_type: "synaxarium", title_ar: "السنكسار", source_ar: "السنكسار" },
  { pattern: /^مزمور القداس/u, reading_type: "liturgy_psalm", title_ar: "مزمور القداس", source_ar: null },
  { pattern: /^إنجيل القداس/u, reading_type: "liturgy_gospel", title_ar: "إنجيل القداس", source_ar: null },
];

const SECTION_HEADINGS = new Set([
  "العشية",
  "باكر",
  "قراءات القداس",
  "الكاثوليكون",
  "الإبركسيس",
  "السنكسار",
  "مزمور القداس",
  "إنجيل القداس",
]);

const REFERENCE_RE =
  /^(?:من\s+)?(?:[\u0600-\u06FF\s]+?\s+)?(\d+\s*:\s*[\d\s,؛;-]+(?:\s*:\s*[\d\s-]+)?(?:\s*;\s*[\d\s:؛,-]+)*)/u;

const OT_PROPHECY_BOOKS =
  /^(?:\(من\s+)?(?:خروج|تكوين|الخروج|اشعياء|إشعياء|إرميا|حزقيال|دانيال|تثنية|العدد|يشوع|قضاة|صموئيل|ملوك|أخبار|راعوث|أستير|أيوب|امثال|جامعة|أرميا|حكيم|باروخ|مكابي)/u;

function findMainRoot($) {
  const selectors = [".item-page", "article", "#content", ".content", "body"];
  for (const sel of selectors) {
    const el = $(sel).first();
    if (el.length) return el;
  }
  return $("body");
}

function splitIntoBlocks(html) {
  const parts = html.split(/↑\s*أعلى الصفحة\s*↑|<hr\b[^>]*>/gi);
  return parts.map((p) => p.trim()).filter(Boolean);
}

function extractReference(text) {
  for (const line of (text || "").split(/\n+/)) {
    const l = normalizeWhitespace(line);
    if (REFERENCE_RE.test(l) || /\d+\s*:\s*\d+/u.test(l)) {
      if (/^الفصل/u.test(l)) continue;
      if (/^مزامير|^متى|^مرقس|^لوقا|^يو|^اعمال|^رومية|^فيلبي|^خروج|^اش|^تثنية|^إرم/u.test(l)) {
        return l;
      }
      if (/\d+\s*:\s*\d+/u.test(l)) return l;
    }
  }
  return null;
}

function extractBodyFromBlock($, blockHtml) {
  const $b = cheerio.load(`<div>${blockHtml}</div>`, { decodeEntities: false });
  const verses = [];
  $b("table tr").each((_, tr) => {
    const cells = $b(tr)
      .find("td,th")
      .map((__, td) => normalizeWhitespace($b(td).text()))
      .get()
      .filter(Boolean);
    if (cells.length >= 2 && /^\d+$/.test(cells[0])) {
      verses.push(`${cells[0]}|${cells.slice(1).join(" ")}`);
    }
  });

  const text = stripHtml(blockHtml);
  if (verses.length) {
    return { body_ar: verses.map((v) => v.split("|")[1]).join("\n"), verses_raw: verses };
  }
  return { body_ar: text, verses_raw: [] };
}

function classifyBakerBlock(text) {
  if (/مزمور باكر/u.test(text)) return "matins";
  if (/إنجيل باكر/u.test(text)) return "matins";
  if (OT_PROPHECY_BOOKS.test(text) || /\(من\s+سفر/u.test(text)) return "prophecy";
  if (/^باكر/u.test(text) && /\d+\s*:\s*\d+/u.test(text) && !/مزامير/u.test(text)) {
    return "prophecy";
  }
  return "matins";
}

function getDisplayOrder(reading_type, season, prophecyIndex = 0) {
  const variant = readingTypes.section_order_variants.find((v) => v.season === season);
  const order = variant?.order || readingTypes.section_order_variants[0].order;
  let idx = order.indexOf(reading_type);
  if (reading_type === "prophecy") idx = 0;
  if (idx < 0) idx = order.length + 10;
  return (idx + 1) * 10 + prophecyIndex;
}

function parseBlock(blockHtml, context) {
  const $ = cheerio.load(`<div>${blockHtml}</div>`, { decodeEntities: false });
  const rawText = (html) =>
    stripHtml(html)
      .split(/\n+/)
      .map(normalizeWhitespace)
      .filter(Boolean);
  const lines = rawText(blockHtml);

  let currentSection = context.currentSection;
  const readings = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const sub = SUBHEADING_MAP.find((s) => s.pattern.test(line));
    if (sub) {
      const nextSubIdx = lines.findIndex((l, idx) => idx > i && SUBHEADING_MAP.some((s) => s.pattern.test(l)));
      const sectionLines = lines.slice(i, nextSubIdx >= 0 ? nextSubIdx : undefined);
      const reference_ar = extractReference(sectionLines.join("\n"));
      const reading_key =
        sub.reading_type === "synaxarium" ? "synaxarium_intro" : sub.reading_type;

      if (!readings.some((r) => r.reading_key === reading_key)) {
        readings.push({
          reading_key,
          reading_type: sub.reading_type,
          title_ar: sub.title_ar,
          title_en: null,
          reference_ar,
          reference_en: null,
          source_ar: sub.source_ar,
          source_en: null,
          body_ar: sectionLines.join("\n"),
          body_en: null,
          display_order: getDisplayOrder(sub.reading_type, context.season),
          season: context.season,
          estimated_min: estimateMinutes(sectionLines.join("\n")),
        });
      }
      continue;
    }

    if (SECTION_HEADINGS.has(line)) {
      currentSection = line;
      continue;
    }

    if (currentSection === "باكر" && !readings.some((r) => r.reading_type === "matins_psalm" || r.reading_type === "prophecy")) {
      const kind = classifyBakerBlock(lines.slice(i).join("\n"));
      if (kind === "prophecy") {
        const prophecyIndex = context.prophecyCount;
        context.prophecyCount += 1;
        const reference_ar = extractReference(lines.slice(i).join("\n"));
        const title_ar = reference_ar ? `من ${reference_ar.split(/\d/)[0].trim()}` : "النبوة";
        readings.push({
          reading_key: `prophecy_${prophecyIndex + 1}`,
          reading_type: "prophecy",
          title_ar,
          title_en: null,
          reference_ar,
          reference_en: null,
          source_ar: "باكر",
          source_en: null,
          body_ar: lines.slice(i).join("\n"),
          body_en: null,
          display_order: getDisplayOrder("prophecy", context.season, prophecyIndex),
          season: context.season,
          estimated_min: estimateMinutes(lines.slice(i).join("\n")),
          metadata: { prophecy_index: prophecyIndex + 1 },
        });
        break;
      }
    }
  }

  if (currentSection === "السنكسار" || /السنكسار/u.test(stripHtml(blockHtml))) {
    const synText = stripHtml(blockHtml);
    if (synText && !readings.some((r) => r.reading_type === "synaxarium")) {
      const embed = parseSynaxariumEmbedFromKatamaros(synText, {
        id: context.dayId,
        source_url: context.source_url,
      });
      readings.push({
        reading_key: "synaxarium_intro",
        reading_type: "synaxarium",
        title_ar: "السنكسار",
        title_en: null,
        reference_ar: null,
        reference_en: null,
        source_ar: "السنكسار",
        source_en: null,
        body_ar: embed.intro_ar || synText.slice(0, 500),
        body_en: null,
        display_order: getDisplayOrder("synaxarium", context.season),
        season: context.season,
        estimated_min: estimateMinutes(embed.intro_ar),
        metadata: {
          saint_ids: embed.saints.map((s) => s.id),
          church_reading_suppressed: /لا\s*يُقرأ\s*في\s*الكنيسة/u.test(synText),
          church_reading_note_ar: /لا\s*يُقرأ\s*في\s*الكنيسة[^.]*\./u.test(synText)
            ? synText.match(/لا\s*يُقرأ\s*في\s*الكنيسة[^.]*\./u)[0]
            : null,
        },
      });
      context.embedSaints = embed.saints;
    }
  }

  context.currentSection = currentSection;
  return readings;
}

function estimateMinutes(body) {
  const words = (body || "").split(/\s+/).filter(Boolean).length;
  if (!words) return null;
  return Math.max(1, Math.round(words / 160));
}

function extractPageMeta($, root, source_url) {
  const bodyText = normalizeWhitespace(root.text());
  const liturgicalMatch = bodyText.match(/قراءات[^\n]{5,200}/u);
  const liturgical_day_ar = liturgicalMatch ? normalizeWhitespace(liturgicalMatch[0]) : null;

  const dateMatch = bodyText.match(
    /(?:ال\s*)?(?:[\u0600-\u06FF]+,\s*)?\d{1,2}\s+[\u0600-\u06FF]+\s+\d{4}\s*---\s*\d{1,2}\s+[\u0600-\u06FF]+\s+\d{4}/u
  );
  const dateLine = dateMatch ? normalizeWhitespace(dateMatch[0]) : null;

  let gregorian_date_label_ar = null;
  let coptic_date_label_ar = null;
  if (dateLine?.includes("---")) {
    const [g, c] = dateLine.split("---").map((s) => normalizeWhitespace(s));
    gregorian_date_label_ar = g;
    coptic_date_label_ar = c;
  }

  const parsed = parseCopticFromPageText(coptic_date_label_ar || bodyText);
  const season = detectSeason(liturgical_day_ar || bodyText);

  let occasion_ar = "";
  if (season === "great_lent") occasion_ar = "الصوم الكبير";
  else if (season === "pentecost") occasion_ar = "الخماسين المقدسة";
  else if (/عيد/u.test(liturgical_day_ar || "")) {
    occasion_ar = (liturgical_day_ar || "").replace(/^قراءات\s+/u, "");
  }

  const coptic_year = parsed?.coptic_year || null;
  const coptic_month = parsed?.coptic_month || null;
  const coptic_day = parsed?.coptic_day || null;

  const id =
    coptic_year && coptic_month && coptic_day
      ? dayId(coptic_year, coptic_month, coptic_day)
      : null;

  return {
    id,
    coptic_year,
    coptic_month,
    coptic_day,
    coptic_date_label_ar: parsed?.coptic_date_label_ar || coptic_date_label_ar,
    gregorian_date_label_ar,
    liturgical_day_ar,
    occasion_ar,
    occasion_en: null,
    season,
    source: {
      provider: "st-takla.org",
      url: source_url,
      fetched_at: new Date().toISOString(),
    },
  };
}

export function parseKatamarosHtml(html, source_url, expected = {}) {
  const $ = cheerio.load(html, { decodeEntities: false });
  const root = findMainRoot($);
  const meta = extractPageMeta($, root, source_url);

  if (expected.coptic_year && meta.coptic_year && meta.coptic_year !== expected.coptic_year) {
    meta.validation_warning = `year mismatch expected ${expected.coptic_year} got ${meta.coptic_year}`;
  }
  if (expected.coptic_month && meta.coptic_month && meta.coptic_month !== expected.coptic_month) {
    meta.validation_warning = `month mismatch expected ${expected.coptic_month} got ${meta.coptic_month}`;
  }
  if (expected.coptic_day && meta.coptic_day && meta.coptic_day !== expected.coptic_day) {
    meta.validation_warning = `day mismatch expected ${expected.coptic_day} got ${meta.coptic_day}`;
  }

  if (!meta.id && expected.coptic_year) {
    meta.coptic_year = expected.coptic_year;
    meta.coptic_month = expected.coptic_month;
    meta.coptic_day = expected.coptic_day;
    meta.id = dayId(expected.coptic_year, expected.coptic_month, expected.coptic_day);
  }

  const context = {
    currentSection: null,
    season: meta.season,
    prophecyCount: 0,
    dayId: meta.id,
    source_url,
    embedSaints: [],
  };

  const blocks = splitIntoBlocks(root.html() || html);
  const readings = [];

  for (const block of blocks) {
    readings.push(...parseBlock(block, context));
  }

  const deduped = dedupeReadings(readings);
  deduped.sort((a, b) => a.display_order - b.display_order);

  meta.readings = deduped;
  meta.embedSaints = context.embedSaints;

  return meta;
}

function dedupeReadings(readings) {
  const map = new Map();
  for (const r of readings) {
    const key = r.reading_key;
    const existing = map.get(key);
    if (!existing || (r.body_ar || "").length > (existing.body_ar || "").length) {
      map.set(key, r);
    }
  }
  return [...map.values()];
}

export function flattenKatamarosForExport(day) {
  return (day.readings || []).map((r) => ({
    day_id: day.id,
    reading_key: r.reading_key,
    reading_type: r.reading_type,
    title_ar: r.title_ar,
    reference_ar: r.reference_ar,
    source_ar: r.source_ar,
    display_order: r.display_order,
    season: r.season,
    body_ar: r.body_ar,
    estimated_min: r.estimated_min,
  }));
}
