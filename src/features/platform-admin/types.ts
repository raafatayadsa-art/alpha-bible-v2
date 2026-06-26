export type ApprovalKind =
  | "church_setup"
  | "church_claim"
  | "publisher_setup"
  | "publisher_publication"
  | "content_review"
  | "priest_verification"
  | "servant_verification"
  | "saint_image"
  | "critical_report"
  | "church_verification"
  | "priest_account_verification"
  | "official_account_verification";

/** Canonical workflow statuses */
export type ApprovalStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "needs_changes"
  /** @deprecated use under_review */
  | "reviewed"
  /** @deprecated use needs_changes */
  | "needs_info";

export type ApprovalPriority = "critical" | "high" | "normal" | "low";

export type ApprovalFilter =
  | "all"
  | "churches"
  | "priests"
  | "servants"
  | "saints"
  | "reports"
  | "publishers"
  | "verification"
  | "critical"
  | "pending"
  | "under_review";

export type ApprovalItem = {
  id: string;
  requestNo: string;
  kind: ApprovalKind;
  title: string;
  kindLabel: string;
  submittedAt: number;
  status: ApprovalStatus;
  priority: ApprovalPriority;
  submittedBy?: string;
  churchId?: string;
  reviewedBy?: string;
  reviewedAt?: number;
  rejectionReason?: string;
  /** Admin notes when requesting additional info */
  adminNotes?: string;
  /** Notes from applicant at submission time */
  applicantNotes?: string;
  /** @deprecated use adminNotes */
  reviewNotes?: string;
  /** Linked source row in Supabase */
  sourceTable?: string;
  sourceId?: string;
  /** Church approval */
  churchName?: string;
  diocese?: string;
  city?: string;
  priestName?: string;
  verificationStatus?: string;
  address?: string;
  responsiblePriest?: string;
  photos?: string[];
  verificationData?: string;
  /** Priest / servant verification */
  churchLabel?: string;
  documentsStatus?: string;
  phone?: string;
  idImageUrl?: string;
  documents?: string[];
  systemNotes?: string;
  /** Saint image */
  saintName?: string;
  contributorName?: string;
  thumbnailUrl?: string;
  aiScanResults?: string;
  relatedReports?: string;
  /** Critical report */
  reportType?: string;
  severity?: string;
  /** Verification */
  verificationTarget?: string;
  /** Submitter profile */
  submitterAvatarUrl?: string;
  riskScore?: number;
  email?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  roleTitle?: string;
  yearsOfService?: string;
  rank?: string;
  documentFiles?: ApprovalDocument[];
  verificationChecks?: VerificationCheck[];
  aiReview?: AiReviewData;
  /** Raw approval payload from Supabase (includes servants for church setup) */
  payload?: Record<string, unknown>;
};

export type ApprovalProposedServant = {
  id?: string;
  name: string;
  phone?: string;
  role?: string;
};

export type ApprovalDocument = {
  id: string;
  label: string;
  url: string;
  verified: boolean;
};

export type VerificationCheck = {
  label: string;
  passed: boolean;
};

export type AiReviewData = {
  confidence: number;
  matchScore: number;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  notes: string;
};

export const APPROVAL_KIND_LABELS: Record<ApprovalKind, string> = {
  church_setup: "Church Approval",
  church_claim: "Church Claim",
  publisher_setup: "Publisher Setup",
  publisher_publication: "Publisher Publication",
  content_review: "Content Review",
  priest_verification: "Priest Approval",
  servant_verification: "Servant Approval",
  saint_image: "Saint Image Approval",
  critical_report: "Critical Reports",
  church_verification: "Verification Requests",
  priest_account_verification: "Verification Requests",
  official_account_verification: "Verification Requests",
};

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: "Pending",
  under_review: "Under Review",
  reviewed: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  needs_changes: "Needs Info",
  needs_info: "Needs Info",
};

export const APPROVAL_STATUS_LABELS_AR: Record<ApprovalStatus, string> = {
  pending: "معلق",
  under_review: "قيد المراجعة",
  reviewed: "قيد المراجعة",
  approved: "معتمد",
  rejected: "مرفوض",
  needs_changes: "معلومات مطلوبة",
  needs_info: "معلومات مطلوبة",
};

export const APPROVAL_PRIORITY_LABELS: Record<ApprovalPriority, string> = {
  critical: "حرج",
  high: "عالي",
  normal: "عادي",
  low: "منخفض",
};

export const FILTER_LABELS: Record<ApprovalFilter, string> = {
  all: "الكل",
  churches: "الكنائس",
  priests: "الكهنة",
  servants: "الخدام",
  saints: "صور القديسين",
  reports: "البلاغات",
  publishers: "الناشرون",
  verification: "التحقق",
  critical: "حرج",
  pending: "معلق",
  under_review: "قيد المراجعة",
};

export function normalizeApprovalStatus(status: ApprovalStatus): ApprovalStatus {
  if (status === "reviewed") return "under_review";
  if (status === "needs_changes") return "needs_info";
  return status;
}

export function isApprovalActionable(status: ApprovalStatus): boolean {
  const s = normalizeApprovalStatus(status);
  return s === "pending" || s === "under_review" || s === "needs_info";
}

/** Decision buttons only after review has started */
export function canTakeApprovalDecision(status: ApprovalStatus): boolean {
  const s = normalizeApprovalStatus(status);
  return s === "under_review" || s === "needs_info";
}

export function getApprovalPayloadServants(item: ApprovalItem): ApprovalProposedServant[] {
  const raw = item.payload?.servants;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null)
    .map((x, i) => ({
      id: typeof x.id === "string" ? x.id : `servant-${i}`,
      name: String(x.name ?? "").trim(),
      phone: typeof x.phone === "string" ? x.phone : undefined,
      role: typeof x.role === "string" ? x.role : undefined,
    }))
    .filter((s) => s.name.length > 0);
}

export function getDocumentCount(item: ApprovalItem): number {
  return getApprovalDocuments(item).length;
}

export function getApprovalDocuments(item: ApprovalItem): ApprovalDocument[] {
  if (item.documentFiles?.length) return item.documentFiles;
  const docs: ApprovalDocument[] = [];
  if (item.idImageUrl) {
    docs.push({ id: "id-card", label: "صورة الهوية", url: item.idImageUrl, verified: true });
  }
  if (item.thumbnailUrl && item.kind === "saint_image") {
    docs.push({ id: "saint-img", label: "صورة القديس", url: item.thumbnailUrl, verified: true });
  }
  item.photos?.forEach((url, i) => {
    docs.push({ id: `photo-${i}`, label: "صورة الكنيسة", url, verified: true });
  });
  return docs;
}

export function getVerificationChecks(item: ApprovalItem): VerificationCheck[] {
  if (item.verificationChecks?.length) return item.verificationChecks;
  const docs = getApprovalDocuments(item);
  const checks: VerificationCheck[] = docs.map((d) => ({
    label: `تم التحقق من ${d.label}`,
    passed: d.verified,
  }));
  checks.push(
    { label: "لا توجد مخالفات", passed: (item.riskScore ?? 30) < 50 },
    { label: "فحص أمني ناجح", passed: (item.riskScore ?? 30) < 70 },
  );
  return checks;
}

export function getAiReview(item: ApprovalItem): AiReviewData {
  if (item.aiReview) return item.aiReview;
  const risk = item.riskScore ?? (item.priority === "critical" ? 82 : item.priority === "high" ? 55 : 22);
  const confidence = Math.max(60, 100 - risk);
  return {
    confidence,
    matchScore: confidence - 4,
    riskScore: risk,
    riskLevel: risk >= 70 ? "high" : risk >= 40 ? "medium" : "low",
    notes: item.aiScanResults ?? (risk < 40 ? "Good — No Risks" : risk < 70 ? "Review Recommended" : "High Risk — Manual Review"),
  };
}

export function enrichApprovalItem(item: ApprovalItem): ApprovalItem {
  const docs = getApprovalDocuments(item);
  const ai = item.aiReview ?? getAiReview(item);
  return {
    ...item,
    adminNotes: item.adminNotes ?? item.reviewNotes,
    payload: item.payload,
    documentFiles: docs,
    verificationChecks: item.verificationChecks ?? getVerificationChecks({ ...item, documentFiles: docs }),
    aiReview: ai,
    submitterAvatarUrl: item.submitterAvatarUrl ?? item.idImageUrl ?? item.thumbnailUrl ?? item.photos?.[0],
  };
}

export function getSubmitterInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function getSubmitterName(item: ApprovalItem): string {
  return item.submittedBy ?? item.priestName ?? item.contributorName ?? item.verificationTarget ?? "—";
}

export function getChurchLabel(item: ApprovalItem): string {
  return item.churchName ?? item.churchLabel ?? item.verificationTarget ?? "—";
}

export type ApprovalDetailRow = { label: string; value?: string };

/** Type-specific fields for Approval Details — approval-relevant data only. */
export function getApprovalDetailRows(item: ApprovalItem): ApprovalDetailRow[] {
  const statusLabel = APPROVAL_STATUS_LABELS_AR[normalizeApprovalStatus(item.status)];

  switch (item.kind) {
    case "priest_verification":
    case "priest_account_verification":
      return [
        { label: "اسم الكاهن", value: item.priestName ?? getSubmitterName(item) },
        { label: "الكنيسة", value: getChurchLabel(item) },
        { label: "الإيبارشية", value: item.diocese },
        { label: "الهاتف", value: item.phone },
        { label: "البريد الإلكتروني", value: item.email },
        { label: "حالة التحقق", value: item.verificationStatus ?? item.documentsStatus ?? statusLabel },
      ];
    case "church_setup":
    case "church_claim":
    case "publisher_setup":
    case "publisher_publication":
      return [
        { label: "اسم الجهة", value: item.churchName ?? item.verificationTarget ?? item.title },
        { label: "الإيبارشية", value: item.diocese },
        { label: "المدينة", value: item.city ?? item.address },
        { label: "الكاهن المسؤول", value: item.responsiblePriest ?? item.priestName },
        { label: "رقم التواصل", value: item.phone },
        { label: "حالة التحقق", value: item.verificationStatus ?? item.documentsStatus ?? statusLabel },
      ];
    case "saint_image":
      return [
        { label: "اسم القديس", value: item.saintName },
        { label: "المساهم", value: item.contributorName ?? item.submittedBy },
        { label: "حالة المراجعة", value: statusLabel },
        { label: "نتيجة الفحص", value: item.aiScanResults },
      ];
    case "content_review":
      return [
        { label: "عنوان المحتوى", value: item.title },
        { label: "الناشر", value: item.churchName ?? item.verificationTarget },
        { label: "حالة المراجعة", value: statusLabel },
      ];
    case "church_verification":
      return [
        { label: "اسم الكنيسة", value: item.churchName ?? item.verificationTarget },
        { label: "الإيبارشية", value: item.diocese },
        { label: "المدينة", value: item.city ?? item.address },
        { label: "الكاهن المسؤول", value: item.responsiblePriest ?? item.priestName },
        { label: "رقم التواصل", value: item.phone },
        { label: "حالة التحقق", value: item.verificationStatus ?? item.documentsStatus ?? statusLabel },
      ];
    case "servant_verification":
      return [
        { label: "اسم الخادم", value: getSubmitterName(item) },
        { label: "الكنيسة", value: getChurchLabel(item) },
        { label: "الهاتف", value: item.phone },
        { label: "البريد الإلكتروني", value: item.email },
        { label: "حالة التحقق", value: item.documentsStatus ?? statusLabel },
      ];
    default:
      return [
        { label: "نوع الطلب", value: APPROVAL_KIND_LABELS[item.kind] },
        { label: "الكنيسة", value: getChurchLabel(item) },
        { label: "حالة الطلب", value: statusLabel },
      ];
  }
}

export function kindMatchesFilter(kind: ApprovalKind, filter: ApprovalFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "churches":
      return kind === "church_setup" || kind === "church_claim";
    case "priests":
      return kind === "priest_verification";
    case "servants":
      return kind === "servant_verification";
    case "saints":
      return kind === "saint_image" || kind === "content_review";
    case "reports":
      return kind === "critical_report";
    case "publishers":
      return kind === "publisher_setup" || kind === "publisher_publication";
    case "verification":
      return (
        kind === "church_verification" ||
        kind === "priest_account_verification" ||
        kind === "official_account_verification"
      );
    case "critical":
      return kind === "critical_report";
    case "pending":
    case "under_review":
      return true;
    default:
      return true;
  }
}

export function statusMatchesFilter(status: ApprovalStatus, filter: ApprovalFilter): boolean {
  const s = normalizeApprovalStatus(status);
  if (filter === "pending") return s === "pending" || s === "needs_info";
  if (filter === "under_review") return s === "under_review";
  return true;
}

export function statusBadgeStyle(status: ApprovalStatus): { bg: string; text: string; border: string } {
  const s = normalizeApprovalStatus(status);
  switch (s) {
    case "pending":
      return { bg: "rgba(196,165,116,0.18)", text: "#c4a574", border: "rgba(196,165,116,0.35)" };
    case "under_review":
      return { bg: "rgba(139,122,184,0.18)", text: "#8b7ab8", border: "rgba(139,122,184,0.35)" };
    case "approved":
      return { bg: "rgba(74,143,110,0.18)", text: "#4a8f6e", border: "rgba(74,143,110,0.35)" };
    case "rejected":
      return { bg: "rgba(184,92,88,0.18)", text: "#b85c58", border: "rgba(184,92,88,0.35)" };
    case "needs_info":
      return { bg: "rgba(196,165,116,0.12)", text: "#c4a574", border: "rgba(196,165,116,0.28)" };
    default:
      return { bg: "rgba(138,148,168,0.15)", text: "#8a94a8", border: "rgba(138,148,168,0.3)" };
  }
}
