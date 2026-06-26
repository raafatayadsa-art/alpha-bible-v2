import {
  bibleBookIconPath,
  bibleCategoryIconPath,
  bibleDefaultIconPath,
} from "./paths";
import type { BibleBookIconEntry, ResolvedBibleBookIcon } from "./types";

/** Category folders under `public/bible-icons/categories/` */
export type BibleIconCategory =
  | "gospels"
  | "acts"
  | "epistles"
  | "wisdom"
  | "prophets"
  | "psalms"
  | "deuterocanonical";

export type BibleTestamentCategory = "old-testament" | "new-testament";

export type BibleBookId =
  | "Genesis"
  | "Exodus"
  | "Leviticus"
  | "Numbers"
  | "Deuteronomy"
  | "Joshua"
  | "Judges"
  | "Ruth"
  | "1Samuel"
  | "2Samuel"
  | "1Kings"
  | "2Kings"
  | "1Chronicles"
  | "2Chronicles"
  | "Ezra"
  | "Nehemiah"
  | "Tobit"
  | "Judith"
  | "Esther"
  | "1Maccabees"
  | "2Maccabees"
  | "Job"
  | "Psalms"
  | "Proverbs"
  | "Ecclesiastes"
  | "SongOfSolomon"
  | "Wisdom"
  | "Sirach"
  | "Isaiah"
  | "Jeremiah"
  | "Lamentations"
  | "Baruch"
  | "Ezekiel"
  | "Daniel"
  | "Hosea"
  | "Joel"
  | "Amos"
  | "Obadiah"
  | "Jonah"
  | "Micah"
  | "Nahum"
  | "Habakkuk"
  | "Zephaniah"
  | "Haggai"
  | "Zechariah"
  | "Malachi"
  | "Matthew"
  | "Mark"
  | "Luke"
  | "John"
  | "Acts"
  | "Romans"
  | "1Corinthians"
  | "2Corinthians"
  | "Galatians"
  | "Ephesians"
  | "Philippians"
  | "Colossians"
  | "1Thessalonians"
  | "2Thessalonians"
  | "1Timothy"
  | "2Timothy"
  | "Titus"
  | "Philemon"
  | "Hebrews"
  | "James"
  | "1Peter"
  | "2Peter"
  | "1John"
  | "2John"
  | "3John"
  | "Jude"
  | "Revelation";

function entry(
  bookId: BibleBookId,
  bookName: string,
  category: BibleIconCategory | null,
  testament: BibleTestamentCategory,
  ext = "webp",
): BibleBookIconEntry {
  return {
    bookId,
    bookName,
    bookNameEn: bookId,
    iconPath: bibleBookIconPath(bookId, ext),
    category,
    testament,
  };
}

/** Master registry — add or update rows here when new book art arrives. */
export const BIBLE_BOOK_ICONS: BibleBookIconEntry[] = [
  // Old Testament — Law
  entry("Genesis", "التكوين", null, "old-testament"),
  entry("Exodus", "الخروج", null, "old-testament"),
  entry("Leviticus", "اللاويين", null, "old-testament"),
  entry("Numbers", "العدد", null, "old-testament"),
  entry("Deuteronomy", "التثنية", null, "old-testament"),
  // History
  entry("Joshua", "يشوع", null, "old-testament"),
  entry("Judges", "القضاة", null, "old-testament"),
  entry("Ruth", "راعوث", null, "old-testament"),
  entry("1Samuel", "صموئيل الأول", null, "old-testament"),
  entry("2Samuel", "صموئيل الثاني", null, "old-testament"),
  entry("1Kings", "الملوك الأول", null, "old-testament"),
  entry("2Kings", "الملوك الثاني", null, "old-testament"),
  entry("1Chronicles", "أخبار الأيام الأول", null, "old-testament"),
  entry("2Chronicles", "أخبار الأيام الثاني", null, "old-testament"),
  entry("Ezra", "عزرا", null, "old-testament"),
  entry("Nehemiah", "نحميا", null, "old-testament"),
  entry("Tobit", "طوبيا", "deuterocanonical", "old-testament"),
  entry("Judith", "يهوديت", "deuterocanonical", "old-testament"),
  entry("Esther", "أستير", null, "old-testament"),
  entry("1Maccabees", "المكابيين الأول", "deuterocanonical", "old-testament"),
  entry("2Maccabees", "المكابيين الثاني", "deuterocanonical", "old-testament"),
  // Wisdom
  entry("Job", "أيوب", "wisdom", "old-testament"),
  entry("Psalms", "المزامير", "psalms", "old-testament"),
  entry("Proverbs", "الأمثال", "wisdom", "old-testament"),
  entry("Ecclesiastes", "الجامعة", "wisdom", "old-testament"),
  entry("SongOfSolomon", "نشيد الأنشاد", "wisdom", "old-testament"),
  entry("Wisdom", "الحكمة", "deuterocanonical", "old-testament"),
  entry("Sirach", "يشوع بن سيراخ", "deuterocanonical", "old-testament"),
  // Major & minor prophets
  entry("Isaiah", "إشعياء", "prophets", "old-testament"),
  entry("Jeremiah", "إرميا", "prophets", "old-testament"),
  entry("Lamentations", "مراثي إرميا", "prophets", "old-testament"),
  entry("Baruch", "باروخ", "deuterocanonical", "old-testament"),
  entry("Ezekiel", "حزقيال", "prophets", "old-testament"),
  entry("Daniel", "دانيال", "prophets", "old-testament"),
  entry("Hosea", "هوشع", "prophets", "old-testament"),
  entry("Joel", "يوئيل", "prophets", "old-testament"),
  entry("Amos", "عاموس", "prophets", "old-testament"),
  entry("Obadiah", "عوبديا", "prophets", "old-testament"),
  entry("Jonah", "يونان", "prophets", "old-testament"),
  entry("Micah", "ميخا", "prophets", "old-testament"),
  entry("Nahum", "ناحوم", "prophets", "old-testament"),
  entry("Habakkuk", "حبقوق", "prophets", "old-testament"),
  entry("Zephaniah", "صفنيا", "prophets", "old-testament"),
  entry("Haggai", "حجي", "prophets", "old-testament"),
  entry("Zechariah", "زكريا", "prophets", "old-testament"),
  entry("Malachi", "ملاخي", "prophets", "old-testament"),
  // New Testament
  entry("Matthew", "متى", "gospels", "new-testament"),
  entry("Mark", "مرقس", "gospels", "new-testament"),
  entry("Luke", "لوقا", "gospels", "new-testament"),
  entry("John", "يوحنا", "gospels", "new-testament"),
  entry("Acts", "أعمال الرسل", "acts", "new-testament"),
  entry("Romans", "رومية", "epistles", "new-testament"),
  entry("1Corinthians", "كورنثوس الأولى", "epistles", "new-testament"),
  entry("2Corinthians", "كورنثوس الثانية", "epistles", "new-testament"),
  entry("Galatians", "غلاطية", "epistles", "new-testament"),
  entry("Ephesians", "أفسس", "epistles", "new-testament"),
  entry("Philippians", "فيلبي", "epistles", "new-testament"),
  entry("Colossians", "كولوسي", "epistles", "new-testament"),
  entry("1Thessalonians", "تسالونيكي الأولى", "epistles", "new-testament"),
  entry("2Thessalonians", "تسالونيكي الثانية", "epistles", "new-testament"),
  entry("1Timothy", "تيموثاوس الأولى", "epistles", "new-testament"),
  entry("2Timothy", "تيموثاوس الثانية", "epistles", "new-testament"),
  entry("Titus", "تيطس", "epistles", "new-testament"),
  entry("Philemon", "فليمون", "epistles", "new-testament"),
  entry("Hebrews", "العبرانيين", "epistles", "new-testament"),
  entry("James", "يعقوب", "epistles", "new-testament"),
  entry("1Peter", "بطرس الأولى", "epistles", "new-testament"),
  entry("2Peter", "بطرس الثانية", "epistles", "new-testament"),
  entry("1John", "يوحنا الأولى", "epistles", "new-testament"),
  entry("2John", "يوحنا الثانية", "epistles", "new-testament"),
  entry("3John", "يوحنا الثالثة", "epistles", "new-testament"),
  entry("Jude", "يهوذا", "epistles", "new-testament"),
  entry("Revelation", "رؤيا يوحنا اللاهوتي", "epistles", "new-testament"),
];

export const BIBLE_BOOK_ICON_BY_ID = new Map<BibleBookId, BibleBookIconEntry>(
  BIBLE_BOOK_ICONS.map((row) => [row.bookId, row]),
);

export function getBibleBookIconEntry(bookId: BibleBookId): BibleBookIconEntry | undefined {
  return BIBLE_BOOK_ICON_BY_ID.get(bookId);
}

export function buildIconFallbackSources(
  row: BibleBookIconEntry,
  ext = "webp",
): string[] {
  const sources = [bibleBookIconPath(row.bookId, ext)];
  if (row.category) sources.push(bibleCategoryIconPath(row.category, ext));
  sources.push(bibleCategoryIconPath(row.testament, ext));
  sources.push(bibleDefaultIconPath(ext));
  return [...new Set(sources)];
}

export function resolveBibleBookIconById(
  bookId: BibleBookId,
  ext = "webp",
): ResolvedBibleBookIcon | undefined {
  const row = getBibleBookIconEntry(bookId);
  if (!row) return undefined;
  return { ...row, fallbackSources: buildIconFallbackSources(row, ext) };
}

/** Default entry when lookup fails entirely */
export const UNKNOWN_BIBLE_BOOK_ICON: ResolvedBibleBookIcon = {
  bookId: "Genesis",
  bookName: "الكتاب المقدس",
  bookNameEn: "Holy Bible",
  iconPath: bibleDefaultIconPath(),
  category: null,
  testament: "old-testament",
  fallbackSources: [
    bibleDefaultIconPath(),
    bibleCategoryIconPath("old-testament"),
  ],
};
