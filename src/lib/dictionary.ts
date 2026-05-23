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

/** Coarse category buckets used by the overlay to pick which fields to surface. */
export type EntryKind =
  | "person"
  | "place"
  | "symbol"
  | "word"
  | "other";

export function classifyEntry(category?: string): EntryKind {
  const c = (category ?? "").toLowerCase();
  if (!c) return "other";
  // Arabic + English category heuristics — defensive, table values vary.
  if (/(person|نبي|رسول|قديس|ملك|كاهن|شخص|اب |ام |ابن|ابنه|تلميذ|بطريرك)/.test(c))
    return "person";
  if (/(place|مدين|قري|نهر|جبل|بحر|ارض|منطق|بلد|اقليم|موقع|بريه|واد)/.test(c))
    return "place";
  if (/(symbol|رمز|روحي|روحانيه|سر|تشبيه|كنسي|طقسي|ليتورج)/.test(c))
    return "symbol";
  if (/(word|كلم|مصطلح|معجم|مفرد|تعبير|لغوي)/.test(c))
    return "word";
  return "other";
}

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
    .replace(/[^\u0600-\u06FF\s]/g, "") // strip punctuation
    .trim();
}

/**
 * Light Arabic stemmer: strip common attached prefixes and suffixes so that
 * "كجنسها" matches "جنس", "السادسة" matches "سادسه", "والملك" matches "ملك".
 * Conservative — only strips when stem stays ≥ 3 chars to avoid false matches.
 */
const PREFIXES = [
  "وبال","فبال","وكال","فكال","وللل","بال","كال","فال","وال","لل",
  "وب","فب","وك","فك","ول","فل","وس","فس","ست",
  "ال","و","ف","ب","ك","ل","س",
];
const SUFFIXES = [
  "كما","كم","كن","هما","هم","هن","ها","نا","تن","تما","تم",
  "ون","ين","ات","ان","تي","ته","تك","ني","ني",
  "ه","ك","ي","ا","ت","ة","ن",
];

export function stemAr(input: string): string {
  let s = normalizeAr(input);
  if (s.length < 4) return s;
  // strip one prefix (longest first)
  for (const p of PREFIXES) {
    if (s.length - p.length >= 3 && s.startsWith(p)) {
      s = s.slice(p.length);
      break;
    }
  }
  // strip one suffix (longest first)
  for (const sf of SUFFIXES) {
    if (s.length - sf.length >= 3 && s.endsWith(sf)) {
      s = s.slice(0, s.length - sf.length);
      break;
    }
  }
  return s;
}

/** Tokenize text into normalized Arabic word tokens, keeping original surface forms. */
export function tokenizeAr(text: string): { surface: string; norm: string; stem: string }[] {
  if (!text) return [];
  const out: { surface: string; norm: string; stem: string }[] = [];
  const re = /[\u0600-\u06FF\u0750-\u077F]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const surface = m[0];
    const norm = normalizeAr(surface);
    if (!norm) continue;
    out.push({ surface, norm, stem: stemAr(surface) });
  }
  return out;
}

/**
 * Stopwords: Arabic ordinals, pronouns, particles, very common verbs that
 * should never trigger highlighting even if a row exists.
 */
const STOPWORDS = new Set(
  [
    "اولا","ثانيا","ثالثا","رابعا","خامسا","سادسا","سابعا","ثامنا","تاسعا","عاشرا",
    "اولي","ثانيه","ثالثه","رابعه","خامسه","سادسه","سابعه","ثامنه","تاسعه","عاشره",
    "هو","هي","هم","هن","انا","انت","انتم","نحن","انتما","هما",
    "هذا","هذه","ذلك","تلك","هؤلاء","اولئك","التي","الذي","الذين","اللاتي","اللواتي",
    "علي","الي","في","من","عن","مع","بين","عند","لدي","حتي","ثم","او","ام","لا","ما","لم","لن","قد","كل","بعض","غير","سوي","ايضا",
    "كان","كانت","يكون","تكون","صار","ليس","ليست",
    "قال","قالت","قالوا","قلت","قلنا","يقول","تقول","نقول",
    "ان","انه","انها","انهم","لان","لانه","كما","لذلك","لذا","اذا","اذ","حيث",
  ].map(normalizeAr),
);

async function fetchDictionary(): Promise<DictionaryEntry[]> {
  const { data, error } = await supabase
    .from("dictionary_entries")
    .select("*");
  if (error) throw error;
  return (data ?? [])
    .map((row: any) => ({
      id: row.id,
      word: row["المصطلح"] ?? row.word ?? "",
      category: row["التصنيف"] ?? row.category,
      meaning: row["المعنى والأصل"] ?? row.meaning,
      description: row["الوصف والتفاصيل"] ?? row.description,
      relatedVersesRaw: row["الشواهد الكتابية"] ?? row.related_verses,
    }))
    .filter((e) => e.word && e.word.trim().length > 1);
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
  /** normalized single-token surface -> entry (exact match) */
  map: Map<string, DictionaryEntry>;
  /** stem -> entry (morphological fallback for single tokens) */
  stems: Map<string, DictionaryEntry>;
  /** normalized multi-token phrases joined by single space -> entry */
  phrases: Map<string, DictionaryEntry>;
  /** stem-form multi-token phrases joined by single space -> entry */
  phraseStems: Map<string, DictionaryEntry>;
  /** max token length across phrase entries (for bounded greedy scan) */
  maxPhraseTokens: number;
};

export function buildDictionaryIndex(entries: DictionaryEntry[]): DictionaryIndex {
  const map = new Map<string, DictionaryEntry>();
  const stems = new Map<string, DictionaryEntry>();
  const phrases = new Map<string, DictionaryEntry>();
  const phraseStems = new Map<string, DictionaryEntry>();
  let maxPhraseTokens = 1;

  for (const e of entries) {
    const toks = tokenizeAr(e.word);
    if (toks.length === 0) continue;

    if (toks.length === 1) {
      const t = toks[0];
      if (STOPWORDS.has(t.norm)) continue;
      if (t.norm.length < 2) continue;
      if (!map.has(t.norm)) map.set(t.norm, e);
      // Only register a stem if it's distinct, >= 3 chars, and not a stopword.
      if (t.stem && t.stem !== t.norm && t.stem.length >= 3 && !STOPWORDS.has(t.stem)) {
        if (!stems.has(t.stem)) stems.set(t.stem, e);
      }
    } else {
      const normKey = toks.map((t) => t.norm).join(" ");
      const stemKey = toks.map((t) => t.stem).join(" ");
      if (!phrases.has(normKey)) phrases.set(normKey, e);
      if (stemKey !== normKey && !phraseStems.has(stemKey)) phraseStems.set(stemKey, e);
      if (toks.length > maxPhraseTokens) maxPhraseTokens = toks.length;
    }
  }
  return { map, stems, phrases, phraseStems, maxPhraseTokens };
}

/** Resolve a single normalized-or-stem key back to its entry (used by overlay). */
export function lookupEntry(
  idx: DictionaryIndex,
  key: string,
): DictionaryEntry | undefined {
  return (
    idx.phrases.get(key) ??
    idx.phraseStems.get(key) ??
    idx.map.get(key) ??
    idx.stems.get(key)
  );
}
