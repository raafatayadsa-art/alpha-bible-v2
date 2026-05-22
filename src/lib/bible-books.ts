// Arabic Bible book classification, ordering, and display cleanup.

function norm(s: string): string {
  return s
    .replace(/\uFFFD/g, "") // replacement char
    .replace(/[\u064B-\u065F\u0670]/g, "") // diacritics
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

// Strip display-only corruption (e.g. "��") without changing DB value.
export function displayName(book: string): string {
  return book.replace(/\uFFFD+/g, "").replace(/\s+/g, " ").trim();
}

const PREFIXES = ["سفر", "كتاب", "إنجيل", "رسالة"];
function stripPrefix(name: string): string {
  const n = norm(name);
  for (const p of PREFIXES) {
    const pn = norm(p) + " ";
    if (n.startsWith(pn)) return n.slice(pn.length);
  }
  return n;
}

// Canonical Arabic Bible order (user-provided).
const OLD_TESTAMENT_ORDER = [
  "التكوين", "الخروج", "اللاويين", "العدد", "التثنية",
  "يشوع", "القضاة", "راعوث",
  "صموئيل الأول", "صموئيل الثاني",
  "الملوك الأول", "الملوك الثاني",
  "أخبار الأيام الأول", "أخبار الأيام الثاني",
  "عزرا", "نحميا", "أستير", "أيوب",
  "المزامير", "الأمثال", "الجامعة", "نشيد الأنشاد",
  "إشعياء", "إرميا", "مراثي إرميا", "حزقيال", "دانيال",
  "هوشع", "يوئيل", "عاموس", "عوبديا", "يونان",
  "ميخا", "ناحوم", "حبقوق", "صفنيا", "حجي", "زكريا", "ملاخي",
];

const NEW_TESTAMENT_ORDER = [
  "متى", "مرقس", "لوقا", "يوحنا", "أعمال الرسل",
  "رومية", "كورنثوس الأولى", "كورنثوس الثانية",
  "غلاطية", "أفسس", "فيلبي", "كولوسي",
  "تسالونيكي الأولى", "تسالونيكي الثانية",
  "تيموثاوس الأولى", "تيموثاوس الثانية",
  "تيطس", "فليمون", "العبرانيين", "يعقوب",
  "بطرس الأولى", "بطرس الثانية",
  "يوحنا الأولى", "يوحنا الثانية", "يوحنا الثالثة",
  "يهوذا", "رؤيا يوحنا اللاهوتي",
];

const OT_IDX = new Map(OLD_TESTAMENT_ORDER.map((n, i) => [norm(n), i]));
const NT_IDX = new Map(NEW_TESTAMENT_ORDER.map((n, i) => [norm(n), i]));

function lookupIndex(idx: Map<string, number>, book: string): number | undefined {
  const suffix = stripPrefix(book);
  if (idx.has(suffix)) return idx.get(suffix);
  // Partial match: canonical name appears inside the DB name (e.g. "رؤيا يوحنا" inside "رؤيا يوحنا اللاهوتي").
  for (const [key, i] of idx) {
    if (suffix.includes(key) || key.includes(suffix)) return i;
  }
  return undefined;
}

function classify(book: string): "ot" | "nt" {
  const n = norm(book);
  if (n.startsWith(norm("إنجيل") + " ")) return "nt";
  if (n.startsWith(norm("رسالة") + " ")) return "nt";
  if (lookupIndex(NT_IDX, book) !== undefined) return "nt";
  return "ot";
}

export function groupBooks(books: string[]): {
  old: string[];
  neu: string[];
  other: string[];
} {
  const old: string[] = [];
  const neu: string[] = [];
  for (const b of books) {
    if (classify(b) === "nt") neu.push(b);
    else old.push(b);
  }
  const orderBy = (idx: Map<string, number>) => (a: string, b: string) => {
    const ai = lookupIndex(idx, a) ?? 999;
    const bi = lookupIndex(idx, b) ?? 999;
    return ai - bi;
  };
  old.sort(orderBy(OT_IDX));
  neu.sort(orderBy(NT_IDX));
  return { old, neu, other: [] };
}
