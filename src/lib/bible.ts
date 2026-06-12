import { queryOptions } from "@tanstack/react-query";
import { supabase, type BibleVerse } from "@/integrations/supabase/client";
import { canonicalBookName, dbBookNamesForQuery, dedupeBookNames } from "@/lib/bible-book-names";
import { normalizeChapterVerses } from "@/lib/bible-verse-normalize";

const PAGE = 1000;

async function fetchAllColumn<T>(column: string): Promise<T[]> {
  const all: T[] = [];
  let from = 0;
  // Page through every row; Supabase caps each response at 1000.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await supabase
      .from("bible_verses")
      .select(column)
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const row of data) all.push((row as unknown as Record<string, T>)[column]);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

export async function fetchBooks(): Promise<string[]> {
  const all = await fetchAllColumn<string>("book_name");
  return dedupeBookNames(all);
}

export async function fetchChapters(book: string): Promise<number[]> {
  const names = dbBookNamesForQuery(book);
  const all: number[] = [];
  for (const name of names) {
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from("bible_verses")
        .select("chapter_number")
        .eq("book_name", name)
        .order("chapter_number", { ascending: true })
        .range(from, from + PAGE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      for (const row of data) all.push((row as { chapter_number: number }).chapter_number);
      if (data.length < PAGE) break;
      from += PAGE;
    }
  }
  const seen = new Set<number>();
  const out: number[] = [];
  for (const c of all.sort((a, b) => a - b)) {
    if (!seen.has(c)) {
      seen.add(c);
      out.push(c);
    }
  }
  return out;
}

export async function fetchVerses(book: string, chapter: number): Promise<BibleVerse[]> {
  const names = dbBookNamesForQuery(book);
  try {
    const { data, error } = await supabase
      .from("bible_verses")
      .select("*")
      .in("book_name", names)
      .eq("chapter_number", chapter)
      .order("verse_number", { ascending: true })
      .limit(10000);
    if (error) throw error;
    const raw = (data ?? []) as BibleVerse[];
    const mapped = raw.map((verse) => ({
      ...verse,
      book_name: canonicalBookName(verse.book_name),
    }));
    return normalizeChapterVerses(book, chapter, mapped);
  } catch (e) {
    console.error("fetchVerses failed", { book, chapter, error: e });
    throw e;
  }
}

export const booksQueryOptions = () =>
  queryOptions({
    queryKey: ["books"],
    queryFn: () => fetchBooks(),
    staleTime: 1000 * 60 * 60,
  });

export const chaptersQueryOptions = (book: string) =>
  queryOptions({
    queryKey: ["chapters", book],
    queryFn: () => fetchChapters(book),
    staleTime: 1000 * 60 * 60,
  });

export const versesQueryOptions = (book: string, chapter: number) =>
  queryOptions({
    queryKey: ["verses", book, chapter, "norm-v1"],
    queryFn: () => fetchVerses(book, chapter),
    staleTime: 1000 * 60 * 60,
  });
