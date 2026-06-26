import { supabase } from "@/integrations/supabase/client";
import {
  BIBLE_BOOK_ICON_BY_ID,
  BIBLE_BOOK_ICONS,
  type BibleBookId,
} from "@/lib/bible-icons/BibleBookIcons";
import { parseVerseReference } from "@/lib/bible-labels";
import { resolveBibleRouteBookParam } from "@/lib/bible-book-names";

export type DailyVerseData = {
  id: string;
  text: string;
  reference: string;
  /** Canonical Supabase `book_name` for reader navigation */
  bookRoute?: string;
  chapter?: number;
  verse?: number;
  category?: string | null;
};

type DailyVerseRow = {
  id: string;
  reference: string;
  verse_text: string | null;
  category: string | null;
};

const ENGLISH_TO_BOOK_ID = new Map<string, BibleBookId>();

function registerEnglishBookId(key: string, id: BibleBookId) {
  ENGLISH_TO_BOOK_ID.set(key.trim().toLowerCase(), id);
}

for (const row of BIBLE_BOOK_ICONS) {
  const spaced = row.bookId.replace(/(\d)([A-Z])/g, "$1 $2");
  registerEnglishBookId(spaced, row.bookId);
  registerEnglishBookId(row.bookId, row.bookId);
  if (spaced.endsWith("s")) registerEnglishBookId(spaced.slice(0, -1), row.bookId);
}

registerEnglishBookId("Psalm", "Psalms");
registerEnglishBookId("Song of Solomon", "SongOfSolomon");
registerEnglishBookId("1 Samuel", "1Samuel");
registerEnglishBookId("2 Samuel", "2Samuel");
registerEnglishBookId("1 Kings", "1Kings");
registerEnglishBookId("2 Kings", "2Kings");
registerEnglishBookId("1 Chronicles", "1Chronicles");
registerEnglishBookId("2 Chronicles", "2Chronicles");
registerEnglishBookId("1 Corinthians", "1Corinthians");
registerEnglishBookId("2 Corinthians", "2Corinthians");
registerEnglishBookId("1 Thessalonians", "1Thessalonians");
registerEnglishBookId("2 Thessalonians", "2Thessalonians");
registerEnglishBookId("1 Timothy", "1Timothy");
registerEnglishBookId("2 Timothy", "2Timothy");
registerEnglishBookId("1 Peter", "1Peter");
registerEnglishBookId("2 Peter", "2Peter");
registerEnglishBookId("1 John", "1John");
registerEnglishBookId("2 John", "2John");
registerEnglishBookId("3 John", "3John");

export function parseEnglishVerseReference(reference: string): {
  bookId: BibleBookId;
  chapter: number;
  verse: number;
} | null {
  const m = reference.trim().match(/^((?:\d\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+)\s*:\s*(\d+)\s*$/);
  if (!m) return null;
  const bookId = ENGLISH_TO_BOOK_ID.get(m[1].trim().toLowerCase());
  if (!bookId) return null;
  return { bookId, chapter: Number(m[2]), verse: Number(m[3]) };
}

export function arabicVerseReference(bookId: BibleBookId, chapter: number, verse: number): string {
  const entry = BIBLE_BOOK_ICON_BY_ID.get(bookId);
  const name = entry?.bookName ?? bookId;
  return `${name} ${chapter}:${verse}`;
}

async function lookupBibleVerseText(
  bookId: BibleBookId,
  chapter: number,
  verse: number,
): Promise<string | null> {
  const entry = BIBLE_BOOK_ICON_BY_ID.get(bookId);
  if (!entry) return null;

  const tokens = entry.bookName.split(/\s+/).filter((t) => t.length > 1);
  let query = supabase
    .from("bible_verses")
    .select("verse_text, book_name")
    .eq("chapter_number", chapter)
    .eq("verse_number", verse);

  for (const token of tokens) {
    query = query.ilike("book_name", `%${token}%`);
  }

  if (bookId === "Joshua") {
    query = query.not("book_name", "ilike", "%سيراخ%");
  }

  const { data, error } = await query.limit(12);
  if (error || !data?.length) return null;

  const hit = data.find((row) => row.verse_text?.trim());
  return hit?.verse_text?.trim() ?? null;
}

async function resolveVerseFromReference(
  reference: string,
  storedText: string | null,
): Promise<{
  text: string;
  reference: string;
  bookRoute?: string;
  chapter?: number;
  verse?: number;
} | null> {
  const trimmedStored = storedText?.trim();
  const english = parseEnglishVerseReference(reference);

  if (english) {
    const arRef = arabicVerseReference(english.bookId, english.chapter, english.verse);
    const bookRoute = resolveBibleRouteBookParam(english.bookId);
    if (trimmedStored) {
      return {
        text: trimmedStored,
        reference: arRef,
        bookRoute,
        chapter: english.chapter,
        verse: english.verse,
      };
    }
    const fromBible = await lookupBibleVerseText(english.bookId, english.chapter, english.verse);
    if (fromBible) {
      return {
        text: fromBible,
        reference: arRef,
        bookRoute,
        chapter: english.chapter,
        verse: english.verse,
      };
    }
    return null;
  }

  const arabic = parseVerseReference(reference);
  if (arabic && trimmedStored) {
    return {
      text: trimmedStored,
      reference,
      bookRoute: resolveBibleRouteBookParam(arabic.book),
      chapter: arabic.chapter,
      verse: arabic.verse,
    };
  }

  if (arabic) {
    const { data, error } = await supabase
      .from("bible_verses")
      .select("verse_text, book_name")
      .ilike("book_name", `%${arabic.book}%`)
      .eq("chapter_number", arabic.chapter)
      .eq("verse_number", arabic.verse)
      .limit(5);
    if (!error && data?.length) {
      const hit = data.find((row) => row.verse_text?.trim());
      if (hit?.verse_text) {
        return {
          text: hit.verse_text.trim(),
          reference,
          bookRoute: hit.book_name,
          chapter: arabic.chapter,
          verse: arabic.verse,
        };
      }
    }
  }

  if (trimmedStored) return { text: trimmedStored, reference };
  return null;
}

function pickIndexForDay(dayKey: string, size: number): number {
  if (size <= 0) return 0;
  let h = 2166136261;
  for (let i = 0; i < dayKey.length; i++) {
    h ^= dayKey.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % size;
}

/** Today's verse from `daily_verses` (stable per calendar day). */
export async function fetchTodaysDailyVerse(): Promise<DailyVerseData | null> {
  const { data, error } = await supabase
    .from("daily_verses")
    .select("id, reference, verse_text, category, is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error || !data?.length) return null;

  const dayKey = new Date().toISOString().slice(0, 10);
  const row = data[pickIndexForDay(dayKey, data.length)] as DailyVerseRow;
  const resolved = await resolveVerseFromReference(row.reference, row.verse_text);
  if (!resolved) return null;

  return {
    id: row.id,
    text: resolved.text,
    reference: resolved.reference,
    bookRoute: resolved.bookRoute,
    chapter: resolved.chapter,
    verse: resolved.verse,
    category: row.category,
  };
}
