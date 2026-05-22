import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DictionaryEntry = {
  id: number;
  word: string;
  category?: string;
  meaning?: string;
  description?: string;
  relatedVersesRaw?: string;
};

/** Strip tashkeel + unify alef/yaa/taa-marbuta so matches survive Arabic variants. */
export function normalizeAr(s: string): string {
  if (!s) return "";
  return s
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "") // tashkeel + tatweel
    .replace(/[أإآٱا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .trim();
}

async function fetchDictionary(): Promise<DictionaryEntry[]> {
  const { data, error } = await supabase
    .from("dictionary_entries")
    .select("*");
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    word: row["المصطلح"] ?? row.word ?? "",
    category: row["التصنيف"] ?? row.category,
    meaning: row["المعنى والأصل"] ?? row.meaning,
    description: row["الوصف والتفاصيل"] ?? row.description,
    relatedVersesRaw: row["الشواهد الكتابية"] ?? row.related_verses,
  })).filter((e) => e.word && e.word.trim().length > 1);
}

export function useDictionary() {
  return useQuery({
    queryKey: ["dictionary_entries"],
    queryFn: fetchDictionary,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
  });
}

export type DictionaryIndex = {
  /** normalized word -> entry (longest match preferred upstream) */
  map: Map<string, DictionaryEntry>;
  /** sorted normalized words, longest first, for greedy matching */
  words: string[];
};

export function buildDictionaryIndex(entries: DictionaryEntry[]): DictionaryIndex {
  const map = new Map<string, DictionaryEntry>();
  for (const e of entries) {
    const key = normalizeAr(e.word);
    if (!key) continue;
    // Keep first occurrence; ignore duplicates.
    if (!map.has(key)) map.set(key, e);
  }
  const words = [...map.keys()].sort((a, b) => b.length - a.length);
  return { map, words };
}
