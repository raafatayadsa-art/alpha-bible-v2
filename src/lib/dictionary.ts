import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Dictionary entry — standardized English schema.
 * Source columns (dictionary_entries):
 *   term, normalized_term, category, short_meaning,
 *   full_description, bible_references, keywords
 *
 * Highlighting uses ONLY `term` and `normalized_term` (exact match after
 * Arabic normalization). `keywords` is search-only, never used for matching.
 */
export type DictionaryEntry = {
  id: number;
  /** Display title — sourced from `term`. */
  term: string;
  /** Optional extra exact-match source. */
  normalizedTerm?: string;
  category?: string;
  shortMeaning?: string;
  fullDescription?: string;
  bibleReferencesRaw?: string;
  keywords?: string;
};

export type EntryKind = "person" | "place" | "symbol" | "word" | "other";

export function classifyEntry(category?: string): EntryKind {
  const c = (category ?? "").toLowerCase();
  if (!c) return "other";
  if (/(person|نبي|رسول|قديس|ملك|كاهن|شخص|اب |ام |ابن|تلميذ|بطريرك)/.test(c)) return "person";
  if (/(place|مدين|قري|نهر|جبل|بحر|ارض|منطق|بلد|اقليم|موقع|بريه|واد)/.test(c)) return "place";
  if (/(symbol|رمز|روحي|سر|تشبيه|كنسي|طقسي|ليتورج)/.test(c)) return "symbol";
  if (/(word|كلم|مصطلح|معجم|مفرد|تعبير|لغوي)/.test(c)) return "word";
  return "other";
}

/** Strict normalization: tashkeel/tatweel removal, alef + yaa-maksura unification. */
export function normalizeAr(s: string): string {
  if (!s) return "";
  return s
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/[^\u0600-\u06FF\s]/g, "")
    .trim();
}

/** Legacy export — kept as identity (no stemming) so callers still compile. */
export function stemAr(input: string): string {
  return normalizeAr(input);
}

export function tokenizeAr(text: string): { surface: string; norm: string }[] {
  if (!text) return [];
  const out: { surface: string; norm: string }[] = [];
  const re = /[\u0600-\u06FF\u0750-\u077F]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const surface = m[0];
    const norm = normalizeAr(surface);
    if (!norm) continue;
    out.push({ surface, norm });
  }
  return out;
}

const STOPWORDS = new Set(
  [
    "هو","هي","هم","هن","انا","انت","انتم","نحن","هما",
    "هذا","هذه","ذلك","تلك","التي","الذي","الذين",
    "علي","الي","في","من","عن","مع","بين","عند","حتي","ثم","او","ام","لا","ما","لم","لن","قد","كل","بعض","غير","ايضا",
    "كان","كانت","يكون","تكون","ليس","ليست",
    "ان","انه","انها","لان","كما","لذلك","اذا","حيث",
  ].map(normalizeAr),
);

const GENERIC_BLACKLIST = new Set(
  [
    "خلق","راي","صباح","مساء","نور","ماء","ارض","سماء","يوم","ليل","نهار",
    "قال","رجل","امراه","ابن","ابنه","اب","ام","بيت","يد","قلب","عين","فم",
  ].map(normalizeAr),
);

async function fetchDictionary(): Promise<DictionaryEntry[]> {
  // Data source: alpha_dictionary. Exact-match lookup uses `word_normalized`.
  const { data, error } = await (supabase as any).from("alpha_dictionary").select("*");
  if (error) throw error;
  const rows = (data ?? [])
    .map((row: any) => {
      const word = ((row.word ?? row.term ?? "") as string).toString().trim();
      const wordNormalized = ((row.word_normalized ?? "") as string).toString().trim();
      return {
        id: row.id,
        term: word,
        normalizedTerm: wordNormalized || undefined,
        category: row.category ?? undefined,
        shortMeaning: row.short_meaning ?? undefined,
        fullDescription: row.full_description ?? undefined,
        bibleReferencesRaw: row.bible_references ?? undefined,
        keywords: row.keywords ?? undefined,
      } as DictionaryEntry;
    })
    .filter(
      (e: DictionaryEntry) =>
        (e.term && e.term.trim().length > 1) ||
        (e.normalizedTerm && e.normalizedTerm.trim().length > 1),
    );
  // eslint-disable-next-line no-console
  console.log("[alpha_dictionary] loaded entries:", (data ?? []).length, "valid terms:", rows.length);
  return rows;
}

export function useDictionary() {
  return useQuery({
    queryKey: ["dictionary_entries"],
    queryFn: fetchDictionary,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export type DictionaryIndex = {
  map: Map<string, DictionaryEntry>;
  stems: Map<string, DictionaryEntry>; // unused, kept for API compat
  phrases: Map<string, DictionaryEntry>;
  phraseStems: Map<string, DictionaryEntry>; // unused, kept for API compat
  maxPhraseTokens: number;
};

export function buildDictionaryIndex(entries: DictionaryEntry[]): DictionaryIndex {
  const map = new Map<string, DictionaryEntry>();
  const phrases = new Map<string, DictionaryEntry>();
  let maxPhraseTokens = 1;

  const registerSurface = (surface: string, e: DictionaryEntry) => {
    const toks = tokenizeAr(surface);
    if (toks.length === 0) return;
    if (toks.length === 1) {
      const t = toks[0];
      if (STOPWORDS.has(t.norm)) return;
      if (GENERIC_BLACKLIST.has(t.norm)) return;
      if (t.norm.length < 2) return;
      if (!map.has(t.norm)) map.set(t.norm, e);
    } else {
      const normKey = toks.map((t) => t.norm).join(" ");
      if (!phrases.has(normKey)) phrases.set(normKey, e);
      if (toks.length > maxPhraseTokens) maxPhraseTokens = toks.length;
    }
  };

  for (const e of entries) {
    if (e.term) registerSurface(e.term, e);
    if (e.normalizedTerm) registerSurface(e.normalizedTerm, e);
  }
  return {
    map,
    stems: new Map(),
    phrases,
    phraseStems: new Map(),
    maxPhraseTokens,
  };
}

export function lookupEntry(idx: DictionaryIndex, key: string): DictionaryEntry | undefined {
  return idx.phrases.get(key) ?? idx.map.get(key);
}
