import type { BibleVerse } from "@/integrations/supabase/client";
import { fetchVerses } from "@/lib/bible";

/** Katameros numeric book id → Alpha Bible `book_name` in Supabase. */
export const KATAMEROS_BOOK_ID_TO_ALPHA: Record<number, string> = {
  1: "سفر التكوين",
  2: "سفر الخروج",
  3: "سفر اللاويين",
  4: "سفر العدد",
  5: "سفر التثنية",
  6: "سفر يشوع",
  7: "سفر القضاة",
  8: "سفر راعوث",
  9: "سفر صموئيل الأول",
  10: "سفر صموئيل الثاني",
  11: "سفر الملوك الأول",
  12: "سفر الملوك الثاني",
  13: "سفر أخبار الأيام الأول",
  14: "سفر أخبار الأيام الثاني",
  15: "سفر عزرا",
  16: "سفر نحميا",
  17: "سفر أستير",
  18: "سفر أيوب",
  19: "سفر المزامير",
  20: "سفر الأمثال",
  21: "سفر الجامعة",
  22: "سفر نشيد الأنشاد",
  23: "سفر إشعياء",
  24: "سفر إرميا",
  25: "مراثي إرميا",
  26: "سفر حزقيال",
  27: "سفر دانيال",
  28: "سفر هوشع",
  29: "سفر يوئيل",
  30: "سفر عاموس",
  31: "سفر عوبديا",
  32: "سفر يونان",
  33: "سفر ميخا",
  34: "سفر ناحوم",
  35: "سفر حبقوق",
  36: "سفر صفنيا",
  37: "سفر حجي",
  38: "سفر زكريا",
  39: "سفر ملاخي",
  40: "إنجيل متى",
  41: "إنجيل مرقس",
  42: "إنجيل لوقا",
  43: "إنجيل يوحنا",
  44: "سفر أعمال الرسل",
  45: "رسالة بولس الرسول إلى أهل رومية",
  46: "رسالة بولس الرسول الأولى إلى أهل كورنثوس",
  47: "رسالة بولس الرسول الثانية إلى أهل كورنثوس",
  48: "رسالة بولس الرسول إلى أهل غلاطية",
  49: "رسالة بولس الرسول إلى أهل أفسس",
  50: "رسالة بولس الرسول إلى أهل فيلبي",
  51: "رسالة بولس الرسول إلى أهل كولوسي",
  52: "رسالة بولس الرسول الأولى إلى أهل تسالونيكي",
  53: "رسالة بولس الرسول الثانية إلى أهل تسالونيكي",
  54: "رسالة بولس الرسول الأولى إلى تيموثاوس",
  55: "رسالة بولس الرسول الثانية إلى تيموثاوس",
  56: "رسالة بولس الرسول إلى تيطس",
  57: "رسالة بولس الرسول إلى فليمون",
  58: "رسالة بولس الرسول إلى العبرانيين",
  59: "رسالة يعقوب",
  60: "رسالة بطرس الرسول الأولى",
  61: "رسالة بطرس الرسول الثانية",
  62: "رسالة يوحنا الرسول الأولى",
  63: "رسالة يوحنا الرسول الثانية",
  64: "رسالة يوحنا الرسول الثالثة",
  65: "رسالة يهوذا",
  66: "رؤيا يوحنا اللاهوتي",
  67: "سفر طوبيا",
  68: "سفر باروخ",
  69: "سفر يهوديت",
  70: "سفر المكابيين الأول",
  71: "سفر المكابيين الثاني",
  72: "سفر الحكمة",
  73: "سفر يشوع بن سيراخ",
};

export type KatamerosResolveErrorCode =
  | "INVALID_REFERENCE"
  | "BOOK_NOT_FOUND"
  | "CHAPTER_NOT_FOUND"
  | "VERSE_NOT_FOUND"
  | "VERSE_COUNT_MISMATCH";

export class KatamerosResolveError extends Error {
  readonly code: KatamerosResolveErrorCode;
  readonly bookId?: number;
  readonly chapter?: number;
  readonly verse?: number;
  readonly alphaBookName?: string;

  constructor(
    code: KatamerosResolveErrorCode,
    message: string,
    meta: { bookId?: number; chapter?: number; verse?: number; alphaBookName?: string } = {},
  ) {
    super(message);
    this.name = "KatamerosResolveError";
    this.code = code;
    this.bookId = meta.bookId;
    this.chapter = meta.chapter;
    this.verse = meta.verse;
    this.alphaBookName = meta.alphaBookName;
  }
}

export type KatamerosResolvedVerse = {
  bookId: number;
  alphaBookName: string;
  chapter: number;
  verse: number;
  text: string;
};

export type KatamerosResolvedReference = {
  reference: string;
  verses: KatamerosResolvedVerse[];
  verseCount: number;
  startVerse: number;
  endVerse: number;
  firstVerseText: string;
  lastVerseText: string;
};

const MACHINE_REF = /^\d+\.\d+:/;

/** Known Katameros JSON typos — same reading appears elsewhere with the correct verse. */
const KATAMEROS_REFERENCE_ALIASES: Record<string, string> = {
  "60.3:25-4:6": "60.3:15-4:6",
};

export function normalizeKatamerosReference(reference: string): string {
  const trimmed = reference.trim();
  return KATAMEROS_REFERENCE_ALIASES[trimmed] ?? trimmed;
}

/**
 * Daniel deuterocanon: Katameros uses `27.1:1-42` for Bel & the Dragon.
 * Alpha stores that text as Daniel chapter 14 (42 verses); chapter 1 has only 21.
 */
export function adjustDanielAlphaChapter(
  bookId: number,
  chapter: number,
  verseSpec: string,
  maxVerseInChapter: number,
): { chapter: number; verseSpec: string } {
  if (bookId !== 27 || chapter !== 1) {
    return { chapter, verseSpec };
  }

  const range = verseSpec.match(/^1-(\d+)$/);
  if (!range) {
    return { chapter, verseSpec };
  }

  const endVerse = Number(range[1]);
  if (endVerse > maxVerseInChapter && endVerse === 42) {
    return { chapter: 14, verseSpec: `1-${endVerse}` };
  }

  return { chapter, verseSpec };
}

export function isKatamerosMachineReference(reference: string): boolean {
  return MACHINE_REF.test(reference.trim());
}

/** Hide Katameros machine refs (`19.32:11*@+…`) from UI; keep human-readable refs if any. */
export function katamerosReadingDisplayReference(reference: string): string {
  const trimmed = reference.trim();
  if (!trimmed || isKatamerosMachineReference(trimmed)) return "";
  return trimmed;
}

export function katamerosBookIdToAlphaName(bookId: number): string | null {
  return KATAMEROS_BOOK_ID_TO_ALPHA[bookId] ?? null;
}

/** Split composite Katameros refs (`*@+`, `@`, cross-chapter ranges). */
export function splitKatamerosRefs(refsStr: string): string[] {
  const refs = refsStr.split(/\*@\+|@/g);
  const res: string[] = [];

  for (const refe of refs) {
    if (refe.indexOf(":") !== refe.lastIndexOf(":")) {
      const p = refe.split(/-|:/g);
      const book = p[0].split(".")[0];
      const chapterBegin1 = p[0].split(".")[1];
      const verseBegin1 = p[1];
      const chapterBegin2 = p[2];
      let verseBegin2 = "1";
      let verseEnd2 = p[3];
      if (p.length > 4) {
        verseBegin2 = p[3];
        verseEnd2 = p[4];
      }

      res.push(`${book}.${chapterBegin1}:${verseBegin1}-end`);
      let chap1 = +chapterBegin1;
      const chap2 = +chapterBegin2;
      while (chap2 > chap1 + 1) {
        chap1++;
        res.push(`${book}.${chap1}:1-end`);
      }
      res.push(`${book}.${chapterBegin2}:${verseBegin2}-${verseEnd2}`);
    } else {
      res.push(refe);
    }
  }

  return res;
}

export function parseKatamerosRef(
  ref: string,
): { bookId: number; chapter: number; verseSpec: string } | null {
  const match = ref.trim().match(/^(\d+)\.(\d+):(.+)$/);
  if (!match) return null;
  return { bookId: Number(match[1]), chapter: Number(match[2]), verseSpec: match[3] };
}

export function verseNumbersFromSpec(verseSpec: string, chapterVerseNumbers: number[]): number[] {
  const maxVerse = chapterVerseNumbers.length ? Math.max(...chapterVerseNumbers) : 0;

  if (verseSpec.includes("-")) {
    const [fromStr, toStr] = verseSpec.split("-");
    const from = Number(fromStr);
    const to = toStr === "end" ? maxVerse : Number(toStr);
    const nums: number[] = [];
    for (let i = from; i <= to; i++) nums.push(i);
    return nums;
  }
  if (verseSpec.includes(",")) {
    return verseSpec.split(",").map((s) => Number(s.trim()));
  }
  return [Number(verseSpec)];
}

function chapterVerseMap(verses: BibleVerse[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const v of verses) map.set(v.verse_number, v.verse_text ?? "");
  return map;
}

/**
 * Resolve a Katameros machine reference against Alpha Bible (Supabase `bible_verses`).
 * Katameros books JSON is not used.
 */
export async function resolveKatamerosReference(
  reference: string,
): Promise<KatamerosResolvedReference> {
  const trimmed = normalizeKatamerosReference(reference.trim());
  if (!trimmed) {
    throw new KatamerosResolveError("INVALID_REFERENCE", "Empty reference");
  }

  const parts = splitKatamerosRefs(trimmed);
  const resolved: KatamerosResolvedVerse[] = [];
  const chapterCache = new Map<string, Map<number, string>>();

  for (const part of parts) {
    const parsed = parseKatamerosRef(part);
    if (!parsed) {
      throw new KatamerosResolveError("INVALID_REFERENCE", `Cannot parse: ${part}`);
    }

    let { bookId, chapter, verseSpec } = parsed;
    const alphaBookName = katamerosBookIdToAlphaName(bookId);
    if (!alphaBookName) {
      throw new KatamerosResolveError("BOOK_NOT_FOUND", `Unmapped Katameros book id ${bookId}`, {
        bookId,
      });
    }

    async function loadChapter(ch: number): Promise<Map<number, string>> {
      const cacheKey = `${alphaBookName}:${ch}`;
      const cached = chapterCache.get(cacheKey);
      if (cached) return cached;

      const chapterVerses = await fetchVerses(alphaBookName, ch);
      if (!chapterVerses.length) {
        throw new KatamerosResolveError(
          "CHAPTER_NOT_FOUND",
          `Chapter ${bookId}.${ch} not found in Alpha Bible (${alphaBookName})`,
          { bookId, chapter: ch, alphaBookName },
        );
      }
      const map = chapterVerseMap(chapterVerses);
      chapterCache.set(cacheKey, map);
      return map;
    }

    let verseMap = await loadChapter(chapter);
    const maxVerse = Math.max(...verseMap.keys());
    const adjusted = adjustDanielAlphaChapter(bookId, chapter, verseSpec, maxVerse);
    if (adjusted.chapter !== chapter || adjusted.verseSpec !== verseSpec) {
      chapter = adjusted.chapter;
      verseSpec = adjusted.verseSpec;
      verseMap = await loadChapter(chapter);
    }

    const wanted = verseNumbersFromSpec(verseSpec, [...verseMap.keys()]);
    if (!wanted.length) {
      throw new KatamerosResolveError("VERSE_NOT_FOUND", `No verses resolved for ${part}`, {
        bookId,
        chapter,
        alphaBookName,
      });
    }

    for (const verse of wanted) {
      const text = verseMap.get(verse);
      if (text === undefined || !String(text).trim()) {
        throw new KatamerosResolveError(
          "VERSE_NOT_FOUND",
          `Verse ${bookId}.${chapter}:${verse} not found in Alpha Bible`,
          { bookId, chapter, verse, alphaBookName },
        );
      }
      resolved.push({ bookId, alphaBookName, chapter, verse, text });
    }
  }

  if (!resolved.length) {
    throw new KatamerosResolveError("VERSE_NOT_FOUND", "No verses resolved from reference");
  }

  return {
    reference: trimmed,
    verses: resolved,
    verseCount: resolved.length,
    startVerse: resolved[0].verse,
    endVerse: resolved[resolved.length - 1].verse,
    firstVerseText: resolved[0].text,
    lastVerseText: resolved[resolved.length - 1].text,
  };
}

/** Join resolved verses for reading display (paragraph breaks between verses). */
export function formatKatamerosVersesBody(verses: KatamerosResolvedVerse[]): string {
  return verses.map((v) => v.text.trim()).filter(Boolean).join("\n\n");
}
