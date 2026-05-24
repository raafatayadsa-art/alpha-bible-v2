import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Small dictionary entry — schema mapped from `alpha_dictionary`.
 *
 * Column mapping (alpha_dictionary):
 *   word              → term            (display title; original Arabic)
 *   word_normalized   → normalizedTerm  (SEARCH-ONLY key; never displayed)
 *   meaning           → meaning         (short meaning shown in the sheet)
 *
 * Long-form content lives in `alpha_dictionary_deep` (title, content) and is
 * fetched separately via useDeepDictionary().
 */
export type DictionaryEntry = {
  id: number;
  /** Display title — sourced from `word`. */
  term: string;
  /** Search key — sourced from `word_normalized`. Never display this. */
  normalizedTerm?: string;
  category?: string;
  /** Short meaning — sourced from `meaning`. */
  meaning?: string;
  // Legacy fields kept only for type back-compat; not populated by alpha_dictionary.
  shortMeaning?: string;
  explanation?: string;
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

// Pronouns, particles, prepositions, conjunctions, auxiliaries — never highlight.
const STOPWORDS = new Set(
  [
    // pronouns
    "هو","هي","هم","هن","انا","انت","انتي","انتم","انتن","نحن","هما","اياه","اياها","اياك","اياكم",
    // demonstratives / relatives
    "هذا","هذه","هذان","هاتان","هؤلاء","ذلك","تلك","اولئك","التي","الذي","الذين","اللتي","اللاتي","اللواتي",
    // prepositions / particles
    "علي","عليه","عليها","عليهم","الي","اليه","اليها","في","فيه","فيها","من","منه","منها","عن","عنه","عنها",
    "مع","معه","معها","بين","عند","عنده","لدي","حتي","ثم","او","ام","لا","ما","لم","لن","لو","قد","كل","بعض","غير","ايضا","ايضا",
    "ب","ل","و","ف","ك","يا","ها","لها","له","لهم","بها","به","بهم","فيهما",
    // verbs of being / auxiliaries
    "كان","كانت","كانوا","يكون","تكون","نكون","ليس","ليست","ليسوا","صار","صارت","اصبح","امسي",
    // conjunctions / connectors
    "ان","انه","انها","انك","انكم","لان","لانه","لانها","كما","لذلك","اذا","اذ","حيث","حينما","عندما","بينما","لكي","حتي","لكن","لكنه","لكنها","بل","اما","اذن",
    // common verbs / sayings — not theological
    "قال","قالت","قالوا","يقول","تقول","قل","قيل","فقال","وقال",
    // very common nouns
    "يوم","ليله","سنه","سنين","شهر","وقت","حين","مره","مرات","شيء","اشياء","امر","امور",
  ].map(normalizeAr),
);

// Common, non-explanatory everyday words. Even if the DB contains these, do not highlight.
const GENERIC_BLACKLIST = new Set(
  [
    "صباح","مساء","يوم","ليل","نهار",
    "رجل","امراه","ولد","بنت","اطفال","ناس","شعب","قوم","جماعه","اهل","عائله",
    "بيت","بيوت","باب","حائط","سقف","ارض","ماء","نار","هواء","ريح","تراب","حجر","طريق","جبل","واد",
    "يد","يدين","رجل","قدم","قلب","عين","عينين","فم","انف","اذن","راس","شعر","وجه","جسم","دم","عظم",
    "اب","ام","ابن","ابنه","اخ","اخت","زوج","زوجه","جد","جده",
    "اكل","شرب","نام","قام","جلس","مشي","ذهب","جاء","اتي","راي","سمع","عرف","علم","قال","فعل","عمل",
    "كبير","صغير","طويل","قصير","حسن","جميل","قبيح","قوي","ضعيف","جديد","قديم",
    "اول","ثاني","ثالث","واحد","اثنان","ثلاثه","اربعه","خمسه","سته","سبعه","ثمانيه","تسعه","عشره",
    "كثير","قليل","جدا","فقط","ايضا","معا","هنا","هناك","الان","اليوم","امس","غدا",
  ].map(normalizeAr),
);

// Categories that indicate the entry IS worth highlighting (theological / names / places / etc.).
// If a row has a category and it does NOT match any of these, we skip it.
// Rows with no category are allowed (fail-open).
const ALLOWED_CATEGORY_RE = /(person|place|symbol|word|theolog|نبي|رسول|قديس|ملك|كاهن|شخص|تلميذ|بطريرك|مدين|قري|نهر|جبل|بحر|ارض|منطق|بلد|اقليم|موقع|بريه|واد|رمز|روحي|سر|تشبيه|كنسي|طقسي|ليتورج|مصطلح|لاهوت|عقيده|سفر|اسم|تعبير|معجم)/i;

function isAllowedCategory(category?: string): boolean {
  if (!category) return true;
  return ALLOWED_CATEGORY_RE.test(category);
}

async function fetchDictionary(): Promise<DictionaryEntry[]> {
  // Source: alpha_dictionary. Columns used: word, word_normalized, meaning.
  // word_normalized is SEARCH-ONLY — never shown to the user.
  const { data, error } = await (supabase as any)
    .from("alpha_dictionary")
    .select("id, word, word_normalized, meaning, category");
  if (error) throw error;
  const rows = (data ?? [])
    .map((row: any) => {
      const word = ((row.word ?? "") as string).toString().trim();
      const wordNormalized = ((row.word_normalized ?? "") as string).toString().trim();
      return {
        id: row.id,
        term: word,
        normalizedTerm: wordNormalized || undefined,
        category: row.category ?? undefined,
        meaning: row.meaning ?? undefined,
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

/* ---------------- Deep dictionary (alpha_dictionary_deep) ----------------
 * Column mapping:
 *   title    → long-form headword (matched against the tapped word, normalized)
 *   content  → long-form description shown in the meaning sheet's details area
 */
export type DeepEntry = { title: string; content: string };
export type DeepDictionaryIndex = Map<string, DeepEntry>;

async function fetchDeepDictionary(): Promise<DeepEntry[]> {
  const { data, error } = await (supabase as any)
    .from("alpha_dictionary_deep")
    .select("title, content");
  if (error) throw error;
  return (data ?? [])
    .map((row: any) => ({
      title: ((row.title ?? "") as string).toString().trim(),
      content: ((row.content ?? "") as string).toString().trim(),
    }))
    .filter((e: DeepEntry) => e.title && e.content);
}

export function useDeepDictionary() {
  return useQuery({
    queryKey: ["alpha_dictionary_deep"],
    queryFn: fetchDeepDictionary,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: 2,
  });
}

export function buildDeepIndex(entries: DeepEntry[]): DeepDictionaryIndex {
  const m = new Map<string, DeepEntry>();
  for (const e of entries) {
    const key = normalizeAr(e.title);
    if (key && !m.has(key)) m.set(key, e);
  }
  return m;
}

export function lookupDeep(idx: DeepDictionaryIndex, word: string): DeepEntry | undefined {
  return idx.get(normalizeAr(word));
}

/* ---------------- Bible book abbreviations (bible_book_abbreviations) ----
 * Column mapping:
 *   book          → full book name
 *   abbreviation  → short display abbreviation
 */
export type BookAbbrev = { book: string; abbreviation: string };

async function fetchBookAbbreviations(): Promise<BookAbbrev[]> {
  const { data, error } = await (supabase as any)
    .from("bible_book_abbreviations")
    .select("book, abbreviation");
  if (error) throw error;
  return (data ?? [])
    .map((row: any) => ({
      book: ((row.book ?? "") as string).toString().trim(),
      abbreviation: ((row.abbreviation ?? "") as string).toString().trim(),
    }))
    .filter((r: BookAbbrev) => r.book && r.abbreviation);
}

export function useBookAbbreviations() {
  return useQuery({
    queryKey: ["bible_book_abbreviations"],
    queryFn: fetchBookAbbreviations,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: 2,
  });
}

export function buildAbbrevMap(rows: BookAbbrev[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const r of rows) m.set(r.book, r.abbreviation);
  return m;
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
    if (!isAllowedCategory(e.category)) return;
    const toks = tokenizeAr(surface);
    if (toks.length === 0) return;
    if (toks.length === 1) {
      const t = toks[0];
      if (STOPWORDS.has(t.norm)) return;
      if (GENERIC_BLACKLIST.has(t.norm)) return;
      if (t.norm.length < 3) return; // single short tokens are almost always particles
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
