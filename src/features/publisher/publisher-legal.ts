/** ALPHA-PUBLISHER-LEGAL-001 — publisher copyright & terms */

export const PUBLISHER_LEGAL_POLICY_VERSION = "1.0";

/** @deprecated Use PUBLISHER_LEGAL_ACK_ITEMS — kept for exports */
export const PUBLISHER_COPYRIGHT_ATTESTATION =
  "أؤكد أنني أملك المحتوى أو أمتلك الإذن القانوني اللازم لنشره، وأتحمل المسؤولية الكاملة عن جميع المواد التي أرفعها.";

/** @deprecated Use PUBLISHER_LEGAL_ACK_ITEMS */
export const PUBLISHER_APPLICATION_ATTESTATION = PUBLISHER_COPYRIGHT_ATTESTATION;

export const PUBLISHER_PROHIBITED_SUMMARY = [
  "الكتب المحمية بحقوق النشر بدون إذن",
  "التسجيلات غير المصرح بها",
  "المواد المنسوخة أو المسروقة",
  "الشعارات والعلامات دون تصريح",
  "محتوى مخالف لتعاليم الكنيسة أو سياسات Alpha",
];
export const PUBLISHER_COPYRIGHT_REPORT_KIND_LABELS = {
  ownership_claim: "مطالبة ملكية",
  copyright_violation: "انتهاك حقوق نشر",
  removal_request: "طلب إزالة",
} as const;

export type PublisherCopyrightReportKind = keyof typeof PUBLISHER_COPYRIGHT_REPORT_KIND_LABELS;

export const PUBLISHER_COPYRIGHT_REPORT_STATUS_LABELS = {
  pending: "بانتظار المراجعة",
  under_investigation: "قيد التحقيق",
  resolved_removed: "تمت الإزالة",
  resolved_kept: "تم الإبقاء",
  dismissed: "مرفوض",
} as const;

export type PublisherCopyrightReportStatus = keyof typeof PUBLISHER_COPYRIGHT_REPORT_STATUS_LABELS;

/** Public page content tabs */
export const PUBLISHER_PUBLIC_TABS = [
  { key: "audio", label: "صوت", kinds: ["hymn", "playlist"] as const },
  { key: "albums", label: "ألبومات", kinds: ["album"] as const },
  { key: "books", label: "كتب", kinds: ["book", "pdf"] as const },
  { key: "lectures", label: "محاضرات", kinds: ["lecture"] as const },
  { key: "videos", label: "فيديو", kinds: ["video"] as const },
  { key: "articles", label: "مقالات", kinds: ["article"] as const },
  { key: "about", label: "حول", kinds: [] as const },
] as const;

export type PublisherPublicTabKey = (typeof PUBLISHER_PUBLIC_TABS)[number]["key"];
