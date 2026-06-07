import { displayName } from "@/lib/bible-books";

function normBook(s: string): string {
  return displayName(s)
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim();
}

/** True only for the Psalms book — not other books. */
export function isPsalmsBook(book: string): boolean {
  const n = normBook(book);
  return n.includes("مزامير") || n === "مزمور";
}

/** Singular unit label: مزmور vs إصحاح */
export function chapterUnitLabel(book: string): string {
  return isPsalmsBook(book) ? "مزمور" : "إصحاح";
}

export function chapterCountLabel(book: string, count: number): string {
  return `${count} ${isPsalmsBook(book) ? "مزمور" : "إصحاح"}`;
}

export function chapterWithNumber(book: string, chapter: number): string {
  return `${chapterUnitLabel(book)} ${chapter}`;
}

/** Parse refs like "مزامير 46:1" or "إنجيل يوحنا 3:16" */
export function parseVerseReference(reference: string): {
  book: string;
  chapter: number;
  verse: number;
} | null {
  const m = reference.trim().match(/^(.+?)\s+(\d+)\s*:\s*(\d+)\s*$/);
  if (!m) return null;
  return {
    book: m[1].trim(),
    chapter: Number(m[2]),
    verse: Number(m[3]),
  };
}
