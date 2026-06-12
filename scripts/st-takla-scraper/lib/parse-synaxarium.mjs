import * as cheerio from "cheerio";
import {
  dayId,
  slugifyArabic,
  normalizeWhitespace,
  stripHtml,
  parseOccasionType,
  extractClosing,
  parseCopticDateFromTitle,
} from "./utils.mjs";

function findMainRoot($) {
  const selectors = [
    ".SynaxariumContent",
    "#SynaxariumContent",
    ".item-page",
    "article",
    "#content",
    ".content",
    "body",
  ];
  for (const sel of selectors) {
    const el = $(sel).first();
    if (el.length) return el;
  }
  return $("body");
}

function extractNameFromTitle(titleAr) {
  let name = titleAr
    .replace(/\([^)]*\)/g, "")
    .replace(/^(نياحة|استشهاد|تذكار|تكريس|شفاء|النيروز)\s+/u, "")
    .replace(/^(القديس|القديسة|الشهيد|الشهيدة|البابا|الأنبا|الأب)\s+/u, "")
    .trim();
  name = name.replace(/\s+(?:و|،|,).*$/u, "").trim();
  return name || titleAr.slice(0, 60);
}

function collectSaintBlocks($, root) {
  const blocks = [];
  root.find("h2").each((_, el) => {
    const titleAr = normalizeWhitespace($(el).text());
    if (!titleAr || titleAr.length < 4) return;

    const parts = [];
    let sib = $(el).next();
    while (sib.length) {
      if (sib.is("h2, h1")) break;
      parts.push($.html(sib));
      sib = sib.next();
    }

    const html = parts.join("\n");
    const text = stripHtml(html);
    if (!text && !titleAr) return;

    blocks.push({ titleAr, html, text });
  });
  return blocks;
}

export function parseSynaxariumHtml(html, meta) {
  const $ = cheerio.load(html, { decodeEntities: false });
  const root = findMainRoot($);

  const h1 = normalizeWhitespace(root.find("h1").first().text());
  const heading_ar = h1 || meta.fallback_heading || null;

  const introCandidates = [];
  root.find("p").each((_, el) => {
    const t = normalizeWhitespace($(el).text());
    if (t && t.length > 40 && !/^St-Takla|^صورة|^Copy Copied|^تقصير/u.test(t)) {
      introCandidates.push(t);
    }
  });

  const saintBlocks = collectSaintBlocks($, root);
  const intro_ar =
    introCandidates.find((p) => !/^(في مثل هذا اليوم|تذكار|استشهاد|نياحة)/u.test(p)) ||
    (saintBlocks[0] ? null : introCandidates[0]) ||
    null;

  const copticYear = meta.coptic_year;
  const copticMonth = meta.coptic_month;
  const copticDay = meta.coptic_day;
  const id = dayId(copticYear, copticMonth, copticDay);
  const source_url_ar = meta.source_url;

  const saints = saintBlocks.map((block, idx) => {
    const display_order = idx + 1;
    const { occasion_type, occasion_type_ar } = parseOccasionType(block.titleAr);
    const closing_ar = extractClosing(block.text);
    let bio_ar = block.text;
    if (closing_ar) {
      bio_ar = bio_ar.replace(closing_ar, "").trim();
    }

    const summaryMatch = bio_ar.match(/^(.{40,400}?)(?:\.\s|$)/u);
    const summary_ar = summaryMatch ? normalizeWhitespace(summaryMatch[1]) : bio_ar.slice(0, 200);

    return {
      id: `${id}-${String(display_order).padStart(2, "0")}`,
      day_id: id,
      display_order,
      slug: slugifyArabic(block.titleAr),
      name_ar: extractNameFromTitle(block.titleAr),
      title_ar: block.titleAr,
      title_en: null,
      occasion_type,
      occasion_type_ar,
      summary_ar,
      summary_en: null,
      bio_ar,
      bio_en: null,
      closing_ar,
      coptic_date_label_ar: parseCopticDateFromTitle(block.titleAr),
      gregorian_date_label_ar: null,
      image_urls: [],
      source_url_ar,
      source_kind: "static_html",
    };
  });

  const day = {
    id,
    coptic_month: copticMonth,
    coptic_day: copticDay,
    coptic_year: copticYear,
    heading_ar,
    heading_en: null,
    intro_ar,
    intro_en: null,
    church_reading_suppressed: false,
    church_reading_note_ar: null,
    source: {
      primary_ar: source_url_ar,
      primary_en: null,
      katamaros_embed_ar: null,
    },
    saints: saints.map((s) => s.id),
  };

  return { day, saints };
}

export function parseSynaxariumEmbedFromKatamaros(text, dayMeta) {
  const lines = (text || "")
    .split(/\n+/)
    .map((l) => normalizeWhitespace(l))
    .filter(Boolean);

  const introLines = [];
  const saintLines = [];
  let inSaints = false;

  for (const line of lines) {
    if (/^(نياحة|استشهاد|تذكار|تكريس|شفاء)/u.test(line)) {
      inSaints = true;
      saintLines.push(line);
    } else if (!inSaints) {
      introLines.push(line);
    } else if (/^صلات(?:ه|هم|ها)/u.test(line)) {
      saintLines[saintLines.length - 1] = `${saintLines[saintLines.length - 1]} ${line}`;
    } else if (line.length > 20) {
      saintLines[saintLines.length - 1] = `${saintLines[saintLines.length - 1]} ${line}`;
    }
  }

  const id = dayMeta.id;
  const saints = [];
  const headingPattern = /^(نياحة|استشهاد|تذكار|تكريس|شفاء)[^(]*(\([^)]*\))?/u;

  for (const chunk of saintLines) {
    const m = chunk.match(headingPattern);
    if (!m) continue;
    const titleStart = chunk.match(/^(نياحة|استشهاد|تذكار|تكريس|شفاء[^.]+\([^)]*\))/u);
    const title_ar = titleStart ? normalizeWhitespace(titleStart[0]) : normalizeWhitespace(chunk.slice(0, 120));
    const body = chunk.slice(title_ar.length).trim();
    const display_order = saints.length + 1;
    const { occasion_type, occasion_type_ar } = parseOccasionType(title_ar);
    const closing_ar = extractClosing(chunk);

    saints.push({
      id: `${id}-${String(display_order).padStart(2, "0")}`,
      day_id: id,
      display_order,
      slug: slugifyArabic(title_ar),
      name_ar: extractNameFromTitle(title_ar),
      title_ar,
      title_en: null,
      occasion_type,
      occasion_type_ar,
      summary_ar: body.slice(0, 250),
      summary_en: null,
      bio_ar: body,
      bio_en: null,
      closing_ar,
      coptic_date_label_ar: parseCopticDateFromTitle(title_ar),
      gregorian_date_label_ar: null,
      image_urls: [],
      source_url_ar: dayMeta.source_url,
      source_kind: "katamaros_embed",
    });
  }

  return {
    intro_ar: introLines.join(" "),
    saints,
  };
}

export function mergeSaintRecords(staticSaint, embedSaint) {
  if (!staticSaint && embedSaint) return embedSaint;
  if (staticSaint && !embedSaint) return staticSaint;

  const staticBioLen = (staticSaint.bio_ar || "").length;
  const embedBioLen = (embedSaint.bio_ar || "").length;

  return {
    ...staticSaint,
    summary_ar: staticSaint.summary_ar || embedSaint.summary_ar,
    bio_ar: staticBioLen >= embedBioLen ? staticSaint.bio_ar : embedSaint.bio_ar,
    closing_ar: staticSaint.closing_ar || embedSaint.closing_ar,
    source_kind: staticBioLen >= embedBioLen ? "static_html" : "katamaros_embed",
  };
}
