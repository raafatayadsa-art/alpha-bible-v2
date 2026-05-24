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
  /** Source table — controls highlight eligibility. */
  source?: "alpha_dictionary" | "alpha_dictionary_deep" | "bible_encyclopedia" | "bible_names_dictionary";
  /** True only for entries that represent a non-obvious / explanatory word. */
  highlightable?: boolean;
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
    // Question / interrogative particles and small grammar words
    "متي","اين","كيف","لماذا","ماذا","هل","أ","كم","اي","ايها","ايتها",
    "الي","علي","عليه","عليها","عليهم","اليه","اليها","اليهم","به","بها","بهم","له","لها","لهم","فيه","فيها","فيهم","منه","منها","منهم",
    "ثمه","هنا","هناك","هنالك","الان","قبل","بعد","فوق","تحت","امام","خلف","يمين","يسار","داخل","خارج",
    "نعم","بلي","كلا","لو","لولا","ليت","لعل","عسي","سوف","سا","قط","ابدا","دائما","احيانا",
    "و","ف","ب","ل","ك","س","ال",

  ].map(normalizeAr),
);

const GENERIC_BLACKLIST = new Set(
  [
    "خلق","راي","صباح","مساء","نور","ماء","ارض","سماء","يوم","ليل","نهار",
    "قال","رجل","امراه","ابن","ابنه","اب","ام","بيت","يد","قلب","عين","فم",
  ].map(normalizeAr),
);

function mapRow(
  row: any,
  source: NonNullable<DictionaryEntry["source"]>,
  defaultCategory?: string,
): DictionaryEntry {
  const word = ((row.word ?? row.term ?? row.title ?? row.name ?? "") as string).toString().trim();
  const wordNormalized = ((row.word_normalized ?? row.normalized_term ?? row.normalized ?? "") as string)
    .toString()
    .trim();
  const shortMeaning = row.short_meaning ?? row.summary ?? row.meaning ?? undefined;
  const fullDescription = row.full_description ?? row.description ?? row.explanation ?? row.content ?? undefined;

  // Decide if this entry counts as "non-obvious / explanatory" for highlighting.
  let highlightable = false;
  if (source === "alpha_dictionary" || source === "alpha_dictionary_deep") {
    const explanation = (row.explanation ?? "").toString().trim();
    const meaning = (shortMeaning ?? "").toString().trim();
    const meaningNorm = normalizeAr(meaning);
    const wordNorm = wordNormalized || normalizeAr(word);

    // Length / content heuristics: an entry is "explanatory" if it has a real
    // explanation paragraph OR a meaning that is substantially longer than a
    // single-word synonym.
    const hasExplanation = explanation.length >= 12;
    const hasRichMeaning = meaning.length >= 28; // a true definition, not a synonym
    const trivialSynonym = meaningNorm && wordNorm && meaningNorm === wordNorm;

    highlightable =
      (hasExplanation || hasRichMeaning) &&
      !trivialSynonym &&
      wordNorm.length >= 3;
  }

  return {
    id: row.id,
    term: word,
    normalizedTerm: wordNormalized || undefined,
    category: row.category ?? row.kind ?? defaultCategory,
    shortMeaning,
    fullDescription,
    bibleReferencesRaw: row.bible_references ?? row.scripture_refs ?? row.references ?? undefined,
    keywords: row.keywords ?? undefined,
    source,
    highlightable,
  } as DictionaryEntry;
}

async function fetchTable(
  table: NonNullable<DictionaryEntry["source"]>,
  defaultCategory?: string,
): Promise<DictionaryEntry[]> {
  const { data, error } = await (supabase as any).from(table).select("*");
  if (error) {
    // eslint-disable-next-line no-console
    console.warn(`[${table}] fetch failed:`, error.message);
    return [];
  }
  const rows = (data ?? [])
    .map((r: any) => mapRow(r, table, defaultCategory))
    .filter(
      (e: DictionaryEntry) =>
        (e.term && e.term.trim().length > 1) ||
        (e.normalizedTerm && e.normalizedTerm.trim().length > 1),
    );
  // eslint-disable-next-line no-console
  console.log(`[${table}] loaded entries:`, (data ?? []).length, "valid:", rows.length);
  return rows;
}

async function fetchDictionary(): Promise<DictionaryEntry[]> {
  // Order is for popup lookup priority. Highlight eligibility is decided
  // per-entry via `highlightable` + the names exclusion in the index builder.
  const [names, encyclopedia, primary, deep] = await Promise.all([
    fetchTable("bible_names_dictionary", "شخص"),
    fetchTable("bible_encyclopedia"),
    fetchTable("alpha_dictionary"),
    fetchTable("alpha_dictionary_deep"),
  ]);
  return [...names, ...encyclopedia, ...primary, ...deep];
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

export type SourceKey = "alpha" | "name" | "encyclopedia" | "deep";

export type DictionaryIndex = {
  map: Map<string, DictionaryEntry>;
  stems: Map<string, DictionaryEntry>; // unused, kept for API compat
  phrases: Map<string, DictionaryEntry>;
  phraseStems: Map<string, DictionaryEntry>; // unused, kept for API compat
  maxPhraseTokens: number;
  /** Per-source lookup maps — used to route data into the correct sheet tab. */
  bySource: Record<SourceKey, { words: Map<string, DictionaryEntry>; phrases: Map<string, DictionaryEntry> }>;
};

function sourceKeyOf(source?: DictionaryEntry["source"]): SourceKey | null {
  if (source === "alpha_dictionary") return "alpha";
  if (source === "bible_names_dictionary") return "name";
  if (source === "bible_encyclopedia") return "encyclopedia";
  if (source === "alpha_dictionary_deep") return "deep";
  return null;
}

export function buildDictionaryIndex(entries: DictionaryEntry[]): DictionaryIndex {
  const map = new Map<string, DictionaryEntry>();
  const phrases = new Map<string, DictionaryEntry>();
  let maxPhraseTokens = 1;

  const bySource: DictionaryIndex["bySource"] = {
    alpha: { words: new Map(), phrases: new Map() },
    name: { words: new Map(), phrases: new Map() },
    encyclopedia: { words: new Map(), phrases: new Map() },
    deep: { words: new Map(), phrases: new Map() },
  };

  // Populate per-source maps with EVERY entry (regardless of highlightable)
  // so tab routing can pull names/encyclopedia even when highlight came from alpha.
  for (const e of entries) {
    const sk = sourceKeyOf(e.source);
    if (!sk) continue;
    for (const surface of [e.term, e.normalizedTerm]) {
      if (!surface) continue;
      const toks = tokenizeAr(surface);
      if (toks.length === 0) continue;
      if (toks.length === 1) {
        const n = toks[0].norm;
        if (n.length < 2) continue;
        if (!bySource[sk].words.has(n)) bySource[sk].words.set(n, e);
      } else {
        const k = toks.map((t) => t.norm).join(" ");
        if (!bySource[sk].phrases.has(k)) bySource[sk].phrases.set(k, e);
      }
    }
  }

  // Highlight-eligibility set: a normalized surface is highlightable only if
  // it appears in bible_names_dictionary (names are NEVER highlighted) — used
  // as an exclusion below.
  const nameSet = new Set<string>([
    ...bySource.name.words.keys(),
    ...bySource.name.phrases.keys(),
  ]);

  const registerSurface = (surface: string, e: DictionaryEntry) => {
    // Highlight ONLY entries that are explicitly flagged as non-obvious /
    // explanatory. This is a general rule applied to the whole Bible — no
    // fixed word list, no example-only matching.
    if (!e.highlightable) return;

    const toks = tokenizeAr(surface);
    if (toks.length === 0) return;
    if (toks.length === 1) {
      const t = toks[0];
      if (STOPWORDS.has(t.norm)) return;
      if (GENERIC_BLACKLIST.has(t.norm)) return;
      if (nameSet.has(t.norm)) return;
      if (t.norm.length < 3) return;
      if (!map.has(t.norm)) map.set(t.norm, e);
    } else {
      const normKey = toks.map((t) => t.norm).join(" ");
      if (nameSet.has(normKey)) return;
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
    bySource,
  };
}

export function lookupEntry(idx: DictionaryIndex, key: string): DictionaryEntry | undefined {
  return idx.phrases.get(key) ?? idx.map.get(key);
}

/** Look up the same normalized key across every source. Used for tab routing. */
export function lookupAllSources(
  idx: DictionaryIndex,
  key: string,
): Record<SourceKey, DictionaryEntry | undefined> {
  const get = (sk: SourceKey) =>
    idx.bySource[sk].phrases.get(key) ?? idx.bySource[sk].words.get(key);
  return {
    alpha: get("alpha"),
    name: get("name"),
    encyclopedia: get("encyclopedia"),
    deep: get("deep"),
  };
}

