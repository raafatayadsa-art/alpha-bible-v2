import { displayName } from "@/lib/bible-books";

function norm(s: string): string {
  return displayName(s)
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim();
}

const DESCRIPTIONS: Record<string, string> = {
  متى: "إنجيل ملكوت المسيح",
  مرقس: "إنجيل ابن الله",
  لوقا: "الطبيب المحبوب",
  يوحنا: "الإنجيل الذي يُحَبّ",
  "اعمال الرسل": "انتشار الإيمان المسيحي",
  رومية: "رسالة البرّ بالإيمان",
  "كورنثوس الاولى": "رسالة إلى كنيسة كورنثوس",
  "كورنثوس الثانية": "رسالة تثبيت وتعزية",
  غلاطية: "رسالة الحرية في المسيح",
  افسس: "رسالة الكنيسة المقدسة",
  فيلبي: "رسالة الفرح والمحبة",
  كولوسي: "رسالة علوّ المسيح",
  "تسالونيكي الاولى": "رسالة الرجاء والانتظار",
  "تسالونيكي الثانية": "رسالة يقظة وثبات",
  "تيموثاوس الاولى": "رسالة الراعي الأمين",
  "تيموثاوس الثانية": "رسالة الشهادة والثبات",
  تيطس: "رسالة تنظيم الكنيسة",
  فليمون: "رسالة المحبة والغفران",
  العبرانيين: "رسالة الكهنوت الأعلى",
  يعقوب: "رسالة الإيمان العامل",
  "بطرس الاولى": "رسالة الرجاء في الاضطهاد",
  "بطرس الثانية": "رسالة النمو الروحي",
  "يوحنا الاولى": "رسالة المحبة والنور",
  "يوحنا الثانية": "رسالة الحق والمحبة",
  "يوحنا الثالثة": "رسالة الضيافة والحق",
  يهوذا: "رسالة الإيمان المحفوظ",
  "رؤيا يوحنا اللاهوتي": "رؤيا الملكوت السماوي",
  التكوين: "بداية الخليقة والعهد",
  الخروج: "تحرير شعب الله",
  المزامير: "تسبيح وتأمل ودعاء",
  اشعياء: "نبوءة المسيح المخلّص",
  ارميا: "نبوءة البكاء والرجاء",
  دانيال: "شهادة في ممالك الأرض",
};

export function bookDescription(book: string): string {
  const n = norm(book);
  for (const [key, desc] of Object.entries(DESCRIPTIONS)) {
    if (n.includes(key) || key.includes(n)) return desc;
  }
  if (n.includes("مزمور") || n.includes("مزامير")) return "تسبيح وتأمل ودعاء";
  if (n.includes("انجيل")) return "بشارة يسوع المسيح";
  if (n.includes("رسالة")) return "تعليم وتثبيت للكنيسة";
  return "كلمة الله المحفوظة";
}

export type NtCategory = "all" | "gospels" | "letters" | "revelation";

export function matchesNtFilter(book: string, filter: NtCategory): boolean {
  if (filter === "all") return true;
  const n = norm(book);
  const isEpistle = n.includes("الاول") || n.includes("الثان") || n.includes("الثال") || n.includes("رسالة");
  if (filter === "gospels") {
    if (isEpistle) return false;
    return ["متى", "مرقس", "لوقا", "يوحنا"].some((g) => n.includes(g));
  }
  if (filter === "revelation") return n.includes("رؤيا");
  if (filter === "letters") {
    const isGospel = !isEpistle && ["متى", "مرقس", "لوقا", "يوحنا"].some((g) => n.includes(g));
    return !isGospel && !n.includes("اعمال") && !n.includes("رؤيا");
  }
  return true;
}

export type OtCategory = "all" | "law" | "history" | "wisdom" | "prophets";

export function matchesOtFilter(book: string, filter: OtCategory): boolean {
  if (filter === "all") return true;
  const n = norm(book);
  if (filter === "law") return ["تكوين", "خروج", "لاويين", "عدد", "تثنية"].some((x) => n.includes(x));
  if (filter === "history") return ["يشوع", "قضاة", "راعوث", "صموئيل", "ملوك", "اخبار", "عزرا", "نحميا", "استير"].some((x) => n.includes(x));
  if (filter === "wisdom") return ["ايوب", "مزامير", "امثال", "جامعة", "نشيد"].some((x) => n.includes(x));
  if (filter === "prophets") return ["اشعياء", "ارميا", "حزقيال", "دانيال", "هوشع", "يوئيل", "عاموس", "عوبديا", "يونان", "ميخا", "ناحوم", "حبقوق", "صفنيا", "حجي", "زكريا", "ملاخي"].some((x) => n.includes(x));
  return true;
}
