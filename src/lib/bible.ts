import { queryOptions } from "@tanstack/react-query";
import { supabase, type BibleVerse } from "@/integrations/supabase/client";

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
  const seen = new Set<string>();
  const out: string[] = [];
  for (const b of all) {
    if (!seen.has(b)) {
      seen.add(b);
      out.push(b);
    }
  }
  return out;
}

export async function fetchChapters(book: string): Promise<number[]> {
  const { data, error } = await supabase
    .from("bible_verses")
    .select("chapter_number")
    .eq("book_name", book)
    .order("chapter_number", { ascending: true })
    .limit(10000);
  if (error) throw error;
  const seen = new Set<number>();
  const out: number[] = [];
  for (const row of data ?? []) {
    const c = (row as { chapter_number: number }).chapter_number;
    if (!seen.has(c)) {
      seen.add(c);
      out.push(c);
    }
  }
  return out;
}

export async function fetchVerses(book: string, chapter: number): Promise<BibleVerse[]> {
  const { data, error } = await supabase
    .from("bible_verses")
    .select("ID, book_name, chapter_number, verse_number, verse_text")
    .eq("book_name", book)
    .eq("chapter_number", chapter)
    .order("verse_number", { ascending: true })
    .limit(10000);
  if (error) throw error;
  return (data ?? []) as BibleVerse[];
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
    queryKey: ["verses", book, chapter],
    queryFn: () => fetchVerses(book, chapter),
    staleTime: 1000 * 60 * 60,
  });
