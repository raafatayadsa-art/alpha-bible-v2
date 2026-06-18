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

const ARABIC_ORDINAL_ONES: Record<number, string> = {
  1: "الأول",
  2: "الثاني",
  3: "الثالث",
  4: "الرابع",
  5: "الخامس",
  6: "السادس",
  7: "السابع",
  8: "الثامن",
  9: "التاسع",
  10: "العاشر",
  11: "الحادي عشر",
  12: "الثاني عشر",
  13: "الثالث عشر",
  14: "الرابع عشر",
  15: "الخامس عشر",
  16: "السادس عشر",
  17: "السابع عشر",
  18: "الثامن عشر",
  19: "التاسع عشر",
};

const ARABIC_ORDINAL_TENS: Record<number, string> = {
  2: "العشرون",
  3: "الثلاثون",
  4: "الأربعون",
  5: "الخمسون",
  6: "الستون",
  7: "السبعون",
  8: "الثمانون",
  9: "التسعون",
};

function arabicOrdinal(n: number): string {
  if (n <= 0) return String(n);
  if (ARABIC_ORDINAL_ONES[n]) return ARABIC_ORDINAL_ONES[n];
  if (n >= 20 && n <= 99) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    const tensWord = ARABIC_ORDINAL_TENS[tens];
    if (!tensWord) return String(n);
    if (ones === 0) return tensWord;
    const onesWord = ARABIC_ORDINAL_ONES[ones];
    return onesWord ? `${onesWord} و${tensWord.replace(/^ال/, "")}` : tensWord;
  }
  if (n >= 100) return String(n);
  return String(n);
}

/** Premium badge label, e.g. «الإصحاح الخامس» or «المزمور الأول». */
export function chapterOrdinalBadge(book: string, chapter: number): string {
  const unit = chapterUnitLabel(book);
  const ord = arabicOrdinal(chapter);
  if (unit === "مزمور") return ord;
  return `ال${unit} ${ord}`;
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
