import { createHash } from "node:crypto";

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function dayId(copticYear, copticMonth, copticDay) {
  return `${copticYear}-${pad2(copticMonth)}-${pad2(copticDay)}`;
}

export function slugifyArabic(text) {
  const base = (text || "")
    .replace(/\([^)]*\)/g, "")
    .replace(/^(نياحة|استشهاد|تذكار|تكريس|شفاء|عيد|النيروز)\s+/u, "")
    .replace(/^(القديس|القديسة|الشهيد|الشهيدة|البابا|الأنبا|الأب)\s+/gu, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .slice(0, 80);
  const hash = createHash("sha1").update(base).digest("hex").slice(0, 8);
  const ascii = base
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return ascii || `saint-${hash}`;
}

export function normalizeWhitespace(text) {
  return (text || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripHtml(html) {
  return (html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(?:h[1-6]|p|div|table|tr|li|hr|blockquote)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .replace(/^[\s\n]+|[\s\n]+$/g, "");
}

export function parseOccasionType(titleAr) {
  const t = titleAr || "";
  if (/^نياحة/u.test(t)) return { occasion_type: "departure", occasion_type_ar: "نياحة" };
  if (/^استشهاد/u.test(t)) return { occasion_type: "martyrdom", occasion_type_ar: "استشهاد" };
  if (/^تذكار/u.test(t)) return { occasion_type: "commemoration", occasion_type_ar: "تذكار" };
  if (/^تكريس/u.test(t)) return { occasion_type: "consecration", occasion_type_ar: "تكريس" };
  if (/^شفاء/u.test(t)) return { occasion_type: "healing", occasion_type_ar: "شفاء" };
  if (/^النيروز/u.test(t)) return { occasion_type: "feast", occasion_type_ar: "النيروز" };
  return { occasion_type: "other", occasion_type_ar: null };
}

export function extractClosing(text) {
  const m = (text || "").match(/(صلات(?:ه|هم|ها|كم)? تكون معنا[^.]*\.)/u);
  return m ? normalizeWhitespace(m[1]) : null;
}

export function parseCopticDateFromTitle(title) {
  const m = (title || "").match(/(\d+)\s*([^\d()]+?)(?:\s*\(|$)/u);
  if (!m) return null;
  return normalizeWhitespace(`${m[1]} ${m[2].replace(/ـ/g, "").trim()}`);
}
