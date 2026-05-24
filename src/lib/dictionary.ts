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

// Pronouns, particles, prepositions, conjunctions, auxiliaries — never highlight.
const STOPWORDS = new Set(
  [
    // pronouns
    "هو","هي","هم","هن","انا","انت","انتي","انتم","انتن","نحن","هما","اياه","اياها","اياك","اياكم",
    // demonstratives / relatives
    "هذا","هذه","هذان","هاتان","هؤلاء","ذلك","تلك","اولئك","التي","الذي","الذين","اللتي","اللاتي","اللواتي",
    // prepositions / particles
    "علي","عليه","عليها","عليهم","الي","اليه","اليها","في","فيه","فيها","من","منه","منها","عن","عنه","عنها",
    "مع","معه","معها","بين","عند","عنده","لدي","حتي","ثم","او","ام","لا","ما","لم","لن","لو","قد","كل","بعض","غير","ايضا",
    "ب","ل","و","ف","ك","يا","ها","لها","له","لهم","بها","به","بهم","فيهما",
    "نعم","بلي","كلا","اي","ايها","ايتها","سوف","قط","ابدا","دائما","ربما","لعل","ليت","انما","فقط",
    // verbs of being / auxiliaries
    "كان","كانت","كانوا","يكون","تكون","نكون","ليس","ليست","ليسوا","صار","صارت","اصبح","امسي","ظل","بات",
    // conjunctions / connectors
    "ان","انه","انها","انك","انكم","لان","لانه","لانها","كما","لذلك","اذا","اذ","حيث","حينما","عندما","بينما","لكي","لكن","لكنه","لكنها","بل","اما","اذن","كذلك","هكذا","حسب","مثل","مثلما","نحو",
    // common verbs / sayings — not theological
    "قال","قالت","قالوا","يقول","تقول","قل","قيل","فقال","وقال","اجاب","اجابت","سال","سالت","رد","ردت",
    // very common nouns
    "يوم","ليله","سنه","سنين","شهر","وقت","حين","مره","مرات","شيء","اشياء","امر","امور","حال","احوال","جهه","جهات",
  ].map(normalizeAr),
);

// Common, non-explanatory everyday words. Even if the DB contains these, do not highlight.
const GENERIC_BLACKLIST = new Set(
  [
    "صباح","مساء","يوم","ليل","نهار","اسبوع","شهر","سنه","ساعه","لحظه",
    "رجل","امراه","ولد","بنت","اطفال","ناس","شعب","قوم","جماعه","اهل","عائله","صديق","صديقه",
    "بيت","بيوت","باب","حائط","سقف","ارض","ماء","نار","هواء","ريح","تراب","حجر","طريق","شارع",
    "يد","يدين","رجل","قدم","قلب","عين","عينين","فم","انف","اذن","راس","شعر","وجه","جسم","دم","عظم","ظهر","صدر",
    "اب","ام","ابن","ابنه","اخ","اخت","زوج","زوجه","جد","جده","عم","خال","عمه","خاله",
    "اكل","شرب","نام","قام","جلس","مشي","ذهب","جاء","اتي","راي","سمع","عرف","علم","فعل","عمل","اخذ","اعطي","وضع","رفع",
    "كبير","صغير","طويل","قصير","حسن","جميل","قبيح","قوي","ضعيف","جديد","قديم","قريب","بعيد","عالي","واطي",
    "اول","ثاني","ثالث","رابع","خامس","واحد","اثنان","ثلاثه","اربعه","خمسه","سته","سبعه","ثمانيه","تسعه","عشره","مئه","الف",
    "كثير","قليل","جدا","فقط","معا","هنا","هناك","الان","اليوم","امس","غدا","قبل","بعد","فوق","تحت","امام","خلف","يمين","يسار",
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
  // Data source: alpha_dictionary. Exact-match lookup uses `word_normalized`.
  const { data, error } = await (supabase as any).from("alpha_dictionary").select("*");
  if (error) throw error;
  const rows = (data ?? [])
    .map((row: any) => {
      const word = ((row.word ?? row.term ?? "") as string).toString().trim();
      const wordNormalized = ((row.word_normalized ?? "") as string).toString().trim();
      // Per spec: short meaning lives in `short_meaning` (fallback `meaning`). No long descriptions.
      const meaning = ((row.short_meaning ?? row.meaning ?? "") as string).toString().trim();
      return {
        id: row.id,
        term: word,
        normalizedTerm: wordNormalized || undefined,
        category: row.category ?? undefined,
        shortMeaning: meaning || undefined,
        fullDescription: undefined,
        bibleReferencesRaw: row.bible_references ?? row.reference ?? undefined,
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

/* ============================================================
 * alpha_dictionary_deep — Persons / detailed entries
 * ============================================================ */

export type DeepEntry = {
  word: string;
  meaning?: string;
  reference?: string;
  wordNormalized?: string;
};

export async function fetchDeepByNormalized(norm: string): Promise<DeepEntry | null> {
  if (!norm) return null;
  try {
    const { data, error } = await (supabase as any)
      .from("alpha_dictionary_deep")
      .select("word, meaning, reference, word_normalized")
      .eq("word_normalized", norm)
      .limit(1);
    if (error) {
      // eslint-disable-next-line no-console
      console.warn("[alpha_dictionary_deep] lookup failed:", error.message);
      return null;
    }
    const row = (data ?? [])[0];
    if (!row) return null;
    return {
      word: row.word,
      meaning: row.meaning ?? undefined,
      reference: row.reference ?? undefined,
      wordNormalized: row.word_normalized ?? undefined,
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[alpha_dictionary_deep] threw:", e);
    return null;
  }
}

/* ============================================================
 * bible_book_abbreviations — reference parsing
 * ============================================================ */

export type BookAbbrevMaps = {
  /** normalized abbreviation -> canonical book_name */
  abbr: Map<string, string>;
  /** normalized full book name -> canonical book_name */
  full: Map<string, string>;
};

function normRefKey(s: string): string {
  return normalizeAr(s).replace(/\s+/g, "");
}

async function fetchBookAbbreviations(): Promise<BookAbbrevMaps> {
  const { data, error } = await supabase
    .from("bible_book_abbreviations")
    .select("book, abbreviation");
  if (error) throw error;
  const abbr = new Map<string, string>();
  const full = new Map<string, string>();
  for (const row of (data ?? []) as any[]) {
    const book = (row.book ?? "").toString().trim();
    const ab = (row.abbreviation ?? "").toString().trim();
    if (book) full.set(normRefKey(book), book);
    if (ab) abbr.set(normRefKey(ab), book);
  }
  return { abbr, full };
}

export function useBookAbbreviations() {
  return useQuery({
    queryKey: ["bible_book_abbreviations"],
    queryFn: fetchBookAbbreviations,
    staleTime: Infinity,
  });
}

export type ParsedRef = {
  book: string;
  chapter: number;
  verse?: number;
  verseEnd?: number;
  raw: string;
};

/**
 * Parse a scripture reference like:
 *   "تك 1:1", "تكوين 1:1-3", "1صم 17:45", "يو 3 : 16"
 * Returns null if the book token doesn't match the abbreviations table.
 */
export function parseScriptureRef(raw: string, maps: BookAbbrevMaps): ParsedRef | null {
  if (!raw) return null;
  const s = raw.trim();
  // Capture: book token (Arabic letters, optionally prefixed by digit), then chapter[:verse[-verse]].
  const m = s.match(
    /^\s*(\d?\s*[\u0600-\u06FF]+)\s*(\d+)\s*[:؛،\u061B]?\s*(\d+)?\s*(?:[-–]\s*(\d+))?/,
  );
  if (!m) return null;
  const bookRaw = m[1].replace(/\s+/g, "");
  const chapter = Number(m[2]);
  if (!chapter || Number.isNaN(chapter)) return null;
  const verse = m[3] ? Number(m[3]) : undefined;
  const verseEnd = m[4] ? Number(m[4]) : undefined;
  const key = normRefKey(bookRaw);
  const book = maps.abbr.get(key) ?? maps.full.get(key);
  if (!book) return null;
  return { book, chapter, verse, verseEnd, raw: s };
}

export async function fetchVerseText(
  book: string,
  chapter: number,
  verse: number,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("bible_verses")
    .select("verse_text")
    .eq("book_name", book)
    .eq("chapter_number", chapter)
    .eq("verse_number", verse)
    .limit(1);
  if (error) return null;
  return ((data ?? [])[0] as any)?.verse_text ?? null;
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
