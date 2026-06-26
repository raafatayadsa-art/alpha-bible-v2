/** ALPHA LEGAL PUBLISHING TERMS — Version 1.0 (full text) */

export const PUBLISHER_LEGAL_TERMS_TITLE = "شروط النشر وحقوق الملكية الفكرية للناشرين داخل Alpha";

export const PUBLISHER_LEGAL_TERMS_TITLE_EN = "ALPHA LEGAL PUBLISHING TERMS";

export type PublisherLegalSection = {
  id: string;
  title: string;
  intro?: string;
  bullets?: string[];
  bulletsPositive?: string[];
  bulletsNegative?: string[];
  paragraphs?: string[];
};

export const PUBLISHER_LEGAL_TERMS_SECTIONS: PublisherLegalSection[] = [
  {
    id: "responsibility",
    title: "المسؤولية عن المحتوى",
    intro:
      "يتحمل الناشر كامل المسؤولية القانونية والأدبية عن جميع المواد التي يقوم برفعها أو نشرها داخل منصة Alpha.",
    bullets: [
      "الكتب",
      "المقالات",
      "الترانيم",
      "الألبومات",
      "المحاضرات",
      "التسجيلات الصوتية",
      "الفيديوهات",
      "الصور",
      "الشعارات",
      "الملفات المرفقة",
    ],
  },
  {
    id: "ownership",
    title: "الإقرار بالملكية أو الإذن",
    intro: "عند رفع أي محتوى، يقر الناشر بأنه:",
    bulletsPositive: [
      "المالك الأصلي للمحتوى",
      "يمتلك تصريحاً أو إذناً قانونياً يسمح له بنشر المحتوى",
      "أن المحتوى متاح للنشر وإعادة التوزيع بشكل قانوني",
    ],
  },
  {
    id: "prohibited",
    title: "المحتوى الممنوع",
    intro: "يمنع رفع أو نشر:",
    bulletsNegative: [
      "الكتب المحمية بحقوق النشر بدون إذن",
      "التسجيلات الصوتية أو المرئية غير المصرح بها",
      "المواد المسروقة أو المنسوخة بشكل غير قانوني",
      "الشعارات والعلامات التجارية المملوكة للغير دون تصريح",
      "أي محتوى ينتهك حقوق الملكية الفكرية",
      "أي محتوى مخالف لتعاليم الكنيسة الأرثوذكسية أو سياسات Alpha",
    ],
  },
  {
    id: "review",
    title: "مراجعة المحتوى",
    intro: "جميع المواد المرفوعة تمر عبر نظام مراجعة Alpha قبل النشر العام. تحتفظ Alpha بالحق في:",
    bullets: [
      "قبول المحتوى",
      "رفض المحتوى",
      "طلب تعديلات",
      "إخفاء المحتوى مؤقتاً",
      "إزالة المحتوى نهائياً",
    ],
    paragraphs: ["دون الحاجة إلى تقديم أسباب تفصيلية."],
  },
  {
    id: "reports",
    title: "بلاغات حقوق الملكية",
    intro: "يمكن لأي جهة أو شخص تقديم بلاغ في حالة:",
    bullets: [
      "انتهاك حقوق النشر",
      "انتحال ملكية المحتوى",
      "استخدام محتوى دون تصريح",
      "استخدام علامة تجارية دون إذن",
    ],
    paragraphs: ["تقوم Alpha بمراجعة البلاغ واتخاذ الإجراءات المناسبة."],
  },
  {
    id: "removal",
    title: "إزالة المحتوى",
    intro: "تحتفظ Alpha بحق:",
    bullets: [
      "إيقاف المحتوى",
      "حذف المحتوى",
      "إيقاف صفحة الناشر",
      "تعليق الحساب",
    ],
    paragraphs: ["في حال ثبوت وجود مخالفة قانونية أو حقوقية."],
  },
  {
    id: "alpha_role",
    title: "مسؤولية Alpha",
    paragraphs: [
      "Alpha منصة نشر وخدمة رقمية.",
      "لا تدعي ملكية المحتوى الذي يقوم الناشرون برفعه.",
      "تبقى الملكية الفكرية للمحتوى مملوكة لأصحابها الأصليين.",
    ],
  },
  {
    id: "license",
    title: "منح الترخيص للعرض",
    paragraphs: [
      "بمجرد رفع المحتوى، يمنح الناشر Alpha ترخيصاً غير حصري لعرض المحتوى داخل التطبيق والموقع الإلكتروني والخدمات المرتبطة به بغرض تقديم الخدمة للمستخدمين.",
      "لا تنتقل ملكية المحتوى إلى Alpha.",
    ],
  },
  {
    id: "verification",
    title: "التوثيق والتحقق",
    intro: "يجوز لـ Alpha طلب:",
    bullets: [
      "مستندات إضافية",
      "إثبات ملكية",
      "خطابات رسمية",
      "بيانات تحقق",
    ],
    paragraphs: ["في أي وقت للتحقق من أهلية الناشر أو ملكية المحتوى."],
  },
  {
    id: "trusted",
    title: "الناشر الموثق",
    intro: "الحصول على شارة التوثيق لا يعني:",
    bulletsNegative: [
      "ملكية Alpha للمحتوى",
      "ضمان صحة جميع المواد المنشورة",
    ],
    paragraphs: ["بل يعني أن الجهة اجتازت إجراءات التحقق الخاصة بالمنصة."],
  },
  {
    id: "acceptance",
    title: "قبول الشروط",
    intro: "عند إنشاء صفحة ناشر أو رفع أي محتوى داخل Alpha فإن الناشر يقر بأنه:",
    bulletsPositive: [
      "قرأ هذه الشروط بالكامل",
      "يوافق على الالتزام بها",
      "يتحمل المسؤولية القانونية الكاملة عن المحتوى المنشور",
      "يوافق على مراجعة Alpha للمحتوى قبل نشره",
      "يوافق على إزالة المحتوى عند ثبوت وجود مخالفة أو انتهاك حقوق ملكية فكرية",
    ],
  },
];

/** Final publisher acknowledgement checkboxes (إقرار الناشر) */
export const PUBLISHER_LEGAL_ACK_ITEMS = [
  {
    id: "ownership",
    label: "أؤكد أنني أملك المحتوى أو أمتلك الإذن القانوني اللازم لنشره.",
  },
  {
    id: "responsibility",
    label: "أتحمل المسؤولية الكاملة عن جميع المواد التي أقوم برفعها.",
  },
  {
    id: "terms",
    label: "أوافق على شروط النشر وحقوق الملكية الخاصة بمنصة Alpha.",
  },
] as const;

export type PublisherLegalAckId = (typeof PUBLISHER_LEGAL_ACK_ITEMS)[number]["id"];

export type PublisherLegalAckState = Record<PublisherLegalAckId, boolean>;

export const EMPTY_PUBLISHER_LEGAL_ACK: PublisherLegalAckState = {
  ownership: false,
  responsibility: false,
  terms: false,
};

export function isPublisherLegalAckComplete(state: PublisherLegalAckState): boolean {
  return PUBLISHER_LEGAL_ACK_ITEMS.every((item) => state[item.id]);
}
