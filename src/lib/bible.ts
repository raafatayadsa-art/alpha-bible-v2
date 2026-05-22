import { queryOptions } from "@tanstack/react-query";
import { supabase, type BibleVerse } from "@/integrations/supabase/client";

export const DEFAULT_LANGUAGE = "Arabic";
export const DEFAULT_TRANSLATION = "SVD";

export type BookSummary = {
  book: string;
  book_order: number;
  testament: string;
  chapters: number;
};

export async function fetchBooks(language: string, translation: string): Promise<BookSummary[]> {
  // Pull minimal cols, then dedupe client-side.
  const { data, error } = await supabase
    .from("bible_verses")
    .select("book, book_order, testament, chapter")
    .eq("language", language)
    .eq("translation", translation);
  if (error) throw error;

  const map = new Map<string, BookSummary & { _chapters: Set<number> }>();
  for (const row of data ?? []) {
    const key = row.book as string;
    let entry = map.get(key);
    if (!entry) {
      entry = {
        book: row.book as string,
        book_order: row.book_order as number,
        testament: row.testament as string,
        chapters: 0,
        _chapters: new Set<number>(),
      };
      map.set(key, entry);
    }
    entry._chapters.add(row.chapter as number);
  }
  return Array.from(map.values())
    .map((e) => ({ book: e.book, book_order: e.book_order, testament: e.testament, chapters: e._chapters.size }))
    .sort((a, b) => a.book_order - b.book_order);
}

export async function fetchChapters(
  book: string,
  language: string,
  translation: string,
): Promise<number[]> {
  const { data, error } = await supabase
    .from("bible_verses")
    .select("chapter, chapter_order")
    .eq("language", language)
    .eq("translation", translation)
    .eq("book", book)
    .order("chapter_order", { ascending: true });
  if (error) throw error;
  const seen = new Set<number>();
  const out: number[] = [];
  for (const row of data ?? []) {
    const c = row.chapter as number;
    if (!seen.has(c)) {
      seen.add(c);
      out.push(c);
    }
  }
  return out;
}

export async function fetchVerses(
  book: string,
  chapter: number,
  language: string,
  translation: string,
): Promise<BibleVerse[]> {
  const { data, error } = await supabase
    .from("bible_verses")
    .select("*")
    .eq("language", language)
    .eq("translation", translation)
    .eq("book", book)
    .eq("chapter", chapter)
    .order("verse_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as BibleVerse[];
}

export const booksQueryOptions = (language: string, translation: string) =>
  queryOptions({
    queryKey: ["books", language, translation],
    queryFn: () => fetchBooks(language, translation),
    staleTime: 1000 * 60 * 60,
  });

export const chaptersQueryOptions = (book: string, language: string, translation: string) =>
  queryOptions({
    queryKey: ["chapters", language, translation, book],
    queryFn: () => fetchChapters(book, language, translation),
    staleTime: 1000 * 60 * 60,
  });

export const versesQueryOptions = (
  book: string,
  chapter: number,
  language: string,
  translation: string,
) =>
  queryOptions({
    queryKey: ["verses", language, translation, book, chapter],
    queryFn: () => fetchVerses(book, chapter, language, translation),
    staleTime: 1000 * 60 * 60,
  });
