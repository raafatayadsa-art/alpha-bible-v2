import { canonicalBookName } from "@/lib/bible-book-names";
import { displayName } from "@/lib/bible-books";

export function normSearchText(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

/** Popular books + common short labels users type in search. */
export const BIBLE_SEARCH_HINTS: { title: string; book: string }[] = [
  { title: "إنجيل يوحنا", book: "إنجيل يوحنا" },
  { title: "إنجيل متى", book: "إنجيل متى" },
  { title: "إنجيل مرقس", book: "إنجيل مرقس" },
  { title: "إنجيل لوقا", book: "إنجيل لوقا" },
  { title: "سفر المزامير", book: "سفر المزامير" },
  { title: "سفر التكوين", book: "سفر التكوين" },
  { title: "سفر الخروج", book: "سفر الخروج" },
  { title: "سفر إشعياء", book: "سفر إشعياء" },
  { title: "سفر الأمثال", book: "سفر الأمثال" },
  { title: "سفر أعمال الرسل", book: "سفر أعمال الرسل" },
  { title: "رسالة رومية", book: "رسالة بولس الرسول إلى أهل رومية" },
  { title: "سفر الرؤيا", book: "رؤيا يوحنا اللاهوتي" },
];

export function bibleBookHaystack(book: string): string {
  const name = displayName(book);
  const normalized = normSearchText(name);
  const core = normalized.replace(/^(سفر|كتاب|انجيل|رسالة)\s+/, "");
  const aliases = BIBLE_SEARCH_HINTS.filter((h) => canonicalBookName(h.book) === canonicalBookName(book)).map(
    (h) => normSearchText(h.title),
  );
  return [normalized, core, ...aliases].join(" ");
}

export function includesBookQuery(book: string, query: string): boolean {
  const nq = normSearchText(query);
  if (!nq) return true;
  return normSearchText(bibleBookHaystack(book)).includes(nq);
}

export function resolveCatalogBook(preferred: string, books: string[]): string {
  const canonical = canonicalBookName(preferred);
  const fromList = books.find((b) => canonicalBookName(b) === canonical);
  if (fromList) return fromList;
  const nPreferred = normSearchText(preferred);
  for (const book of books) {
    const nBook = normSearchText(displayName(book));
    if (nBook === nPreferred || nBook.includes(nPreferred) || nPreferred.includes(nBook)) return book;
  }
  return preferred;
}

export function bibleBookResultId(book: string): string {
  return `book:${canonicalBookName(book)}`;
}

export function hasBibleBookResult(
  results: { id: string; params?: Record<string, string> }[],
  book: string,
): boolean {
  const canonical = canonicalBookName(book);
  return results.some((r) => r.params?.book === book || r.params?.book === canonical || r.id === bibleBookResultId(book));
}
