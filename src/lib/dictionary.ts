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

/** Tokenize text into normalized Arabic word tokens, keeping original surface forms. */
export function tokenizeAr(text: string): { surface: string; norm: string }[] {
  if (!text) return [];
  const out: { surface: string; norm: string }[] = [];
  const re = /[\u0600-\u06FF\u0750-\u077F]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const surface = m[0];
    const norm = normalizeAr(surface);
    if (norm) out.push({ surface, norm });
  }
  return out;
}

/**
 * Common Arabic ordinals, conjunctions, and high-frequency function words that
 * should never be treated as dictionary entries even if a row exists for them.
 * Keeps highlighting precise and avoids false positives like "سادسا".
 */
const STOPWORDS = new Set(
  [
    // ordinals (masc + fem)
    "اولا","ثانيا","ثالثا","رابعا","خامسا","سادسا","سابعا","ثامنا","تاسعا","عاشرا",
    "اولي","ثانيه","ثالثه","رابعه","خامسه","سادسه","سابعه","ثامنه","تاسعه","عاشره",
    // pronouns / connectors / very common verbs
    "هو","هي","هم","هن","انا","انت","انتم","نحن","انتما","هما",
    "هذا","هذه","ذلك","تلك","هؤلاء","اولئك","التي","الذي","الذين","اللاتي","اللواتي",
    "علي","الي","في","من","عن","مع","بين","عند","لدي","حتي","ثم","او","ام","لا","ما","لم","لن","قد","كل","بعض","غير","سوي","ايضا","ايضا","ايضا",
    "كان","كانت","يكون","تكون","صار","ليس","ليست",
    "قال","قالت","قالوا","قلت","قلنا","يقول","تقول","نقول",
    "ان","انه","انها","انهم","لان","لانه","كما","لذلك","لذا","اذا","اذ","حيث",
  ].map((w) => normalizeAr(w)),
);

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
  /** normalized single-token word -> entry */
  map: Map<string, DictionaryEntry>;
  /** normalized multi-token phrases (token arrays joined by single space) -> entry */
  phrases: Map<string, DictionaryEntry>;
  /** max token length across phrase entries (for bounded greedy scan) */
  maxPhraseTokens: number;
};

export function buildDictionaryIndex(entries: DictionaryEntry[]): DictionaryIndex {
  const map = new Map<string, DictionaryEntry>();
  const phrases = new Map<string, DictionaryEntry>();
  let maxPhraseTokens = 1;

  for (const e of entries) {
    const tokens = tokenizeAr(e.word).map((t) => t.norm);
    if (tokens.length === 0) continue;

    if (tokens.length === 1) {
      const key = tokens[0];
      // Reject stopwords and ultra-short tokens (<2 chars) outright.
      if (STOPWORDS.has(key)) continue;
      if (key.length < 2) continue;
      if (!map.has(key)) map.set(key, e);
    } else {
      const key = tokens.join(" ");
      if (!phrases.has(key)) phrases.set(key, e);
      if (tokens.length > maxPhraseTokens) maxPhraseTokens = tokens.length;
    }
  }
  return { map, phrases, maxPhraseTokens };
}
