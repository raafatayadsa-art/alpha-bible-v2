import { displayName } from "@/lib/bible-books";
import {
  BIBLE_BOOK_ICON_BY_ID,
  UNKNOWN_BIBLE_BOOK_ICON,
  buildIconFallbackSources,
  resolveBibleBookIconById,
  type BibleBookId,
} from "./BibleBookIcons";
import type { ResolvedBibleBookIcon } from "./types";

function normArabic(s: string): string {
  return displayName(s)
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Arabic / slug aliases → canonical `bookId` */
const ARABIC_ALIAS_TO_ID: Record<string, BibleBookId> = {
  "التكوين": "Genesis",
  "تكوين": "Genesis",
  "الخروج": "Exodus",
  "خروج": "Exodus",
  "اللاويين": "Leviticus",
  "لاويين": "Leviticus",
  "العدد": "Numbers",
  "عدد": "Numbers",
  "التثنية": "Deuteronomy",
  "تثنية": "Deuteronomy",
  "يشوع": "Joshua",
  "القضاة": "Judges",
  "قضاة": "Judges",
  "راعوث": "Ruth",
  "صموئيل الاول": "1Samuel",
  "صموئيل الأول": "1Samuel",
  "1 صموئيل": "1Samuel",
  "صموئيل الثاني": "2Samuel",
  "2 صموئيل": "2Samuel",
  "الملوك الاول": "1Kings",
  "الملوك الأول": "1Kings",
  "1 ملوك": "1Kings",
  "الملوك الثاني": "2Kings",
  "2 ملوك": "2Kings",
  "اخبار الايام الاول": "1Chronicles",
  "أخبار الأيام الأول": "1Chronicles",
  "1 اخبار": "1Chronicles",
  "اخبار الايام الثاني": "2Chronicles",
  "أخبار الأيام الثاني": "2Chronicles",
  "2 اخبار": "2Chronicles",
  "عزرا": "Ezra",
  "نحميا": "Nehemiah",
  "طوبيا": "Tobit",
  "سفر طوبيا": "Tobit",
  "يهوديت": "Judith",
  "سفر يهوديت": "Judith",
  "أستير": "Esther",
  "استير": "Esther",
  "المكابيين الاول": "1Maccabees",
  "المكابيين الأول": "1Maccabees",
  "مكابيين الاول": "1Maccabees",
  "المكابيين الثاني": "2Maccabees",
  "مكابيين الثاني": "2Maccabees",
  "أيوب": "Job",
  "ايوب": "Job",
  "المزامير": "Psalms",
  "مزامير": "Psalms",
  "مزمور": "Psalms",
  "الأمثال": "Proverbs",
  "امثال": "Proverbs",
  "الجامعة": "Ecclesiastes",
  "جامعة": "Ecclesiastes",
  "نشيد الانشاد": "SongOfSolomon",
  "نشيد الأنشاد": "SongOfSolomon",
  "الحكمة": "Wisdom",
  "سفر الحكمة": "Wisdom",
  "يشوع بن سيراخ": "Sirach",
  "سفر يشوع بن سيراخ": "Sirach",
  "سيراخ": "Sirach",
  "إشعياء": "Isaiah",
  "اشعياء": "Isaiah",
  "إرميا": "Jeremiah",
  "ارميا": "Jeremiah",
  "مراثي ارميا": "Lamentations",
  "مراثي إرميا": "Lamentations",
  "باروخ": "Baruch",
  "سفر باروخ": "Baruch",
  "حزقيال": "Ezekiel",
  "دانيال": "Daniel",
  "هوشع": "Hosea",
  "يوئيل": "Joel",
  "عاموس": "Amos",
  "عوبديا": "Obadiah",
  "يونان": "Jonah",
  "ميخا": "Micah",
  "ناحوم": "Nahum",
  "حبقوق": "Habakkuk",
  "صفنيا": "Zephaniah",
  "حجي": "Haggai",
  "زكريا": "Zechariah",
  "ملاخي": "Malachi",
  "متى": "Matthew",
  "انجيل متى": "Matthew",
  "إنجيل متى": "Matthew",
  "مرقس": "Mark",
  "انجيل مرقس": "Mark",
  "لوقا": "Luke",
  "انجيل لوقا": "Luke",
  "يوحنا": "John",
  "انجيل يوحنا": "John",
  "إنجيل يوحنا": "John",
  "اعمال الرسل": "Acts",
  "أعمال الرسل": "Acts",
  "اعمال": "Acts",
  "رومية": "Romans",
  "رسالة رومية": "Romans",
  "كورنثوس الاولى": "1Corinthians",
  "1 كورنثوس": "1Corinthians",
  "كورنثوس الثانية": "2Corinthians",
  "2 كورنثوس": "2Corinthians",
  "غلاطية": "Galatians",
  "أفسس": "Ephesians",
  "افسس": "Ephesians",
  "فيلبي": "Philippians",
  "كولوسي": "Colossians",
  "تسالونيكي الاولى": "1Thessalonians",
  "1 تسالونيكي": "1Thessalonians",
  "تسالونيكي الثانية": "2Thessalonians",
  "2 تسالونيكي": "2Thessalonians",
  "تيموثاوس الاولى": "1Timothy",
  "1 تيموثاوس": "1Timothy",
  "تيموثاوس الثانية": "2Timothy",
  "2 تيموثاوس": "2Timothy",
  "تيطس": "Titus",
  "فليمون": "Philemon",
  "العبرانيين": "Hebrews",
  "عبرانيين": "Hebrews",
  "يعقوب": "James",
  "بطرس الاولى": "1Peter",
  "1 بطرس": "1Peter",
  "بطرس الثانية": "2Peter",
  "2 بطرس": "2Peter",
  "يوحنا الاولى": "1John",
  "1 يوحنا": "1John",
  "يوحنا الثانية": "2John",
  "2 يوحنا": "2John",
  "يوحنا الثالثة": "3John",
  "3 يوحنا": "3John",
  "يهوذا": "Jude",
  "رؤيا": "Revelation",
  "رؤيا يوحنا": "Revelation",
  "رؤيا يوحنا اللاهوتي": "Revelation",
  "سفر الرؤيا": "Revelation",
};

function lookupArabicAlias(raw: string): BibleBookId | undefined {
  const n = normArabic(raw);
  if (ARABIC_ALIAS_TO_ID[n]) return ARABIC_ALIAS_TO_ID[n];
  // Longer aliases first — avoid "يشوع" matching "يشوع بن سيراخ"
  const entries = Object.entries(ARABIC_ALIAS_TO_ID).sort((a, b) => b[0].length - a[0].length);
  for (const [alias, id] of entries) {
    const na = normArabic(alias);
    if (n.includes(na) || na.includes(n)) return id;
  }
  for (const row of BIBLE_BOOK_ICON_BY_ID.values()) {
    const bn = normArabic(row.bookName);
    if (n === bn || n.includes(bn) || bn.includes(n)) return row.bookId;
  }
  return undefined;
}

export function resolveBookId(input: string): BibleBookId | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  if (BIBLE_BOOK_ICON_BY_ID.has(trimmed as BibleBookId)) return trimmed as BibleBookId;
  const byAlias = lookupArabicAlias(trimmed);
  if (byAlias) return byAlias;
  const slug = trimmed.replace(/^\/+/, "");
  return lookupArabicAlias(slug);
}

/**
 * Resolve icon metadata from `bookId`, Arabic DB name, route slug, or English id.
 */
export function resolveBibleBookIcon(
  input: string,
  ext = "webp",
): ResolvedBibleBookIcon {
  const bookId = resolveBookId(input);
  if (bookId) {
    const resolved = resolveBibleBookIconById(bookId, ext);
    if (resolved) return resolved;
  }
  const aliasId = lookupArabicAlias(input);
  if (aliasId) {
    const row = BIBLE_BOOK_ICON_BY_ID.get(aliasId)!;
    return { ...row, fallbackSources: buildIconFallbackSources(row, ext) };
  }
  return {
    ...UNKNOWN_BIBLE_BOOK_ICON,
    bookName: displayName(input) || UNKNOWN_BIBLE_BOOK_ICON.bookName,
    fallbackSources: UNKNOWN_BIBLE_BOOK_ICON.fallbackSources.map((p) =>
      p.replace(/\.webp$/, `.${ext}`),
    ),
  };
}

export function resolveBibleBookIconFromBookId(
  bookId: BibleBookId,
  ext = "webp",
): ResolvedBibleBookIcon {
  return resolveBibleBookIconById(bookId, ext) ?? UNKNOWN_BIBLE_BOOK_ICON;
}
