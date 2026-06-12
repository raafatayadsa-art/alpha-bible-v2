import type { BibleVerse } from "@/integrations/supabase/client";
import { canonicalBookName } from "@/lib/bible-book-names";

/**
 * Correct known Supabase verse-numbering issues until SQL migrations are applied.
 * Returns a new sorted array; does not mutate input rows.
 */
export function normalizeChapterVerses(
  book: string,
  chapter: number,
  verses: BibleVerse[],
): BibleVerse[] {
  const bookName = canonicalBookName(book);

  // Sirach 29: rows are stored as v1–15, v18–35 but Van Dyck uses v1–33 (v16–17 were skipped in import).
  if (bookName === "سفر يشوع بن سيراخ" && chapter === 29) {
    const nums = new Set(verses.map((v) => v.verse_number));
    const needsShift = !nums.has(16) && nums.has(18);
    if (needsShift) {
      return verses
        .map((v) =>
          v.verse_number >= 18 ? { ...v, verse_number: v.verse_number - 2 } : v,
        )
        .sort((a, b) => a.verse_number - b.verse_number);
    }
  }

  return verses;
}

/** Map display verse number → DB row when numbering is still offset in Supabase. */
export function dbVerseNumberForQuery(book: string, chapter: number, verse: number): number {
  const bookName = canonicalBookName(book);
  if (bookName === "سفر يشوع بن سيراخ" && chapter === 29 && verse >= 16 && verse <= 33) {
    return verse + 2;
  }
  return verse;
}
