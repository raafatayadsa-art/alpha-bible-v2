/**
 * Known misspelled `bible_verses.book_name` values in Supabase and their canonical names.
 * Used to merge duplicate books in the UI until DB rows are corrected.
 */
import { BIBLE_EXPECTED_CHAPTERS } from "@/lib/bible-expected-chapters";
import { resolveBookId } from "@/lib/bible-icons";

export const BIBLE_BOOK_NAME_ALIASES: Record<string, string> = {
  "رسالة بول الرسول إلى تيطس": "رسالة بولس الرسول إلى تيطس",
  "رسالة بولس الرسول الثانية إلى أهل تسالونيك": "رسالة بولس الرسول الثانية إلى أهل تسالونيكي",
  "سفر أخبار لأيام الثاني": "سفر أخبار الأيام الثاني",
  "سفر المزاير": "سفر المزامير",
  "سفر يوديت": "سفر يهوديت",
};

const ALIAS_BY_CANONICAL = new Map<string, string[]>();
for (const [wrong, correct] of Object.entries(BIBLE_BOOK_NAME_ALIASES)) {
  const list = ALIAS_BY_CANONICAL.get(correct) ?? [];
  list.push(wrong);
  ALIAS_BY_CANONICAL.set(correct, list);
}

/** Map a DB or UI book name to its canonical Supabase name. */
export function canonicalBookName(book: string): string {
  return BIBLE_BOOK_NAME_ALIASES[book] ?? book;
}

/** All DB names that should be queried for a canonical book (canonical + known typos). */
export function dbBookNamesForQuery(book: string): string[] {
  const canonical = canonicalBookName(book);
  const aliases = ALIAS_BY_CANONICAL.get(canonical) ?? [];
  return [canonical, ...aliases];
}

/** Collapse duplicate typo/canonical names into one canonical list, preserving first-seen order. */
export function dedupeBookNames(books: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const book of books) {
    const canonical = canonicalBookName(book);
    if (seen.has(canonical)) continue;
    seen.add(canonical);
    out.push(canonical);
  }
  return out;
}

/** Supabase `book_name` used in `/$book/$chapter` routes (Van Dyck naming). */
const ROUTE_BOOK_BY_ID = (() => {
  const map = new Map<string, string>();
  for (const dbName of Object.keys(BIBLE_EXPECTED_CHAPTERS)) {
    const id = resolveBookId(dbName);
    if (id) map.set(id, dbName);
  }
  return map;
})();

/** Map Arabic short name, bookId, or DB typo → canonical route `book` param. */
export function resolveBibleRouteBookParam(bookRef: string): string {
  const trimmed = bookRef.trim();
  if (!trimmed) return trimmed;
  if (trimmed in BIBLE_EXPECTED_CHAPTERS) return trimmed;
  const canonical = canonicalBookName(trimmed);
  if (canonical in BIBLE_EXPECTED_CHAPTERS) return canonical;
  const id = resolveBookId(trimmed);
  if (id && ROUTE_BOOK_BY_ID.has(id)) return ROUTE_BOOK_BY_ID.get(id)!;
  return trimmed;
}
