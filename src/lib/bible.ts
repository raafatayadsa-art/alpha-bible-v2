import { queryOptions } from "@tanstack/react-query";
import { supabase, type BibleVerse } from "@/integrations/supabase/client";

export async function fetchBooks(): Promise<string[]> {
  const { data, error } = await supabase
    .from("bible_verses")
    .select("book_name")
    .order("book_name", { ascending: true });
  if (error) throw error;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of data ?? []) {
    const b = (row as { book_name: string }).book_name;
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
    .order("chapter_number", { ascending: true });
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
    .order("verse_number", { ascending: true });
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
