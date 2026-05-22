// Arabic Bible book classification.
// DB uses prefixes like "سفر ...", "إنجيل ...", "رسالة ..." and includes
// deuterocanonical books. Strategy:
//   - "إنجيل ..." or "رسالة ..." → New Testament
//   - bare-name NT books (acts, revelation, etc.) → New Testament
//   - everything else → Old Testament (includes deuterocanonical)

function norm(s: string): string {
  return s
    .replace(/[\u064B-\u065F\u0670]/g, "") // diacritics
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

const PREFIXES = ["سفر", "كتاب"]; // strip for canonical-name matching
function stripPrefix(name: string): string {
  const n = norm(name);
  for (const p of PREFIXES) {
    const pn = norm(p) + " ";
    if (n.startsWith(pn)) return n.slice(pn.length);
  }
  return n;
}

// NT bare-name set (normalized) for non-prefixed forms.
const NT_BARE = new Set(
  [
    "متي", "مرقس", "لوقا", "يوحنا",
    "اعمال الرسل", "الرؤيا", "رؤيا يوحنا", "الرويا",
  ].map(norm),
);

// Canonical ordering for OT and NT (normalized → index).
const OT_ORDER = [
  "التكوين", "الخروج", "اللاويين", "العدد", "التثنية",
  "يشوع", "القضاة", "راعوث",
  "صموئيل الاول", "صموئيل الثاني",
  "الملوك الاول", "الملوك الثاني",
  "اخبار الايام الاول", "اخبار الايام الثاني",
  "عزرا", "نحميا", "طوبيا", "يهوديت", "استير",
  "المكابيين الاول", "المكابيين الثاني",
  "ايوب", "المزامير", "الامثال", "الجامعه", "نشيد الانشاد",
  "الحكمه", "يشوع بن سيراخ",
  "اشعياء", "ارميا", "مراثي ارميا", "باروخ",
  "حزقيال", "دانيال",
  "هوشع", "يوئيل", "عاموس", "عوبديا", "يونان", "ميخا",
  "ناحوم", "حبقوق", "صفنيا", "حجي", "زكريا", "ملاخي",
];
const NT_ORDER = [
  "متي", "مرقس", "لوقا", "يوحنا", "اعمال الرسل",
  "روميه", "كورنثوس الاولي", "كورنثوس الثانيه",
  "غلاطيه", "افسس", "فيلبي", "كولوسي",
  "تسالونيكي الاولي", "تسالونيكي الثانيه",
  "تيموثاوس الاولي", "تيموثاوس الثانيه",
  "تيطس", "فليمون", "العبرانيين", "يعقوب",
  "بطرس الاولي", "بطرس الثانيه",
  "يوحنا الاولي", "يوحنا الثانيه", "يوحنا الثالثه",
  "يهوذا", "الرؤيا", "رؤيا يوحنا",
];
const OT_IDX = new Map(OT_ORDER.map((n, i) => [norm(n), i]));
const NT_IDX = new Map(NT_ORDER.map((n, i) => [norm(n), i]));

function classify(book: string): "ot" | "nt" {
  const n = norm(book);
  if (n.startsWith(norm("إنجيل") + " ")) return "nt";
  if (n.startsWith(norm("رسالة") + " ")) return "nt";
  const suffix = stripPrefix(book);
  if (NT_BARE.has(suffix)) return "nt";
  if (NT_IDX.has(suffix)) return "nt";
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
  const orderBy = (idx: Map<string, number>) => (a: string, b: string) =>
    (idx.get(stripPrefix(a)) ?? 999) - (idx.get(stripPrefix(b)) ?? 999);
  old.sort(orderBy(OT_IDX));
  neu.sort(orderBy(NT_IDX));
  return { old, neu, other: [] };
}
