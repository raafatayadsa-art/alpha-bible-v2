export type PublisherType =
  | "church"
  | "monastery"
  | "hymn_team"
  | "choir"
  | "priest"
  | "bishop"
  | "church_service"
  | "publishing_house"
  | "institution";

export type PublisherStatus =
  | "under_review"
  | "draft"
  | "pending_publication"
  | "published"
  | "suspended";

export type PublisherContentKind =
  | "album"
  | "hymn"
  | "book"
  | "lecture"
  | "video"
  | "cover"
  | "logo"
  | "playlist"
  | "article"
  | "pdf";

export type PublisherContentVisibility =
  | "public"
  | "verified_users"
  | "church_members"
  | "followers"
  | "private";

export type PublisherContentStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "needs_changes"
  | "under_investigation";

/** Types allowed via self-service application (churches/monasteries use ALPHA-107 claim). */
export const APPLY_PUBLISHER_TYPES: PublisherType[] = [
  "hymn_team",
  "choir",
  "church_service",
  "publishing_house",
  "institution",
];

export const PUBLISHER_TYPE_LABELS: Record<PublisherType, string> = {
  church: "كنيسة",
  monastery: "دير",
  hymn_team: "فريق ترانيم",
  choir: "كورال",
  priest: "كاهن",
  bishop: "أسقف",
  church_service: "خدمة كنسية",
  publishing_house: "دار نشر",
  institution: "مؤسسة كنسية",
};

export const PUBLISHER_STATUS_LABELS: Record<PublisherStatus, string> = {
  under_review: "تحت مراجعة الهوية",
  draft: "مسودة — تجهيز المحتوى",
  pending_publication: "بانتظار النشر العام",
  published: "منشور",
  suspended: "موقوف",
};

export const PUBLISHER_CONTENT_KIND_LABELS: Record<PublisherContentKind, string> = {
  album: "ألبوم",
  hymn: "ترنيمة",
  book: "كتاب",
  lecture: "محاضرة",
  video: "فيديو",
  cover: "غلاف",
  logo: "شعار",
  playlist: "قائمة تشغيل",
  article: "مقال",
  pdf: "PDF",
};

export const PUBLISHER_CONTENT_VISIBILITY_LABELS: Record<PublisherContentVisibility, string> = {
  public: "عام",
  verified_users: "مستخدمون موثّقون",
  church_members: "أعضاء الكنيسة",
  followers: "المتابعون",
  private: "خاص",
};

export const PUBLISHER_CONTENT_STATUS_LABELS: Record<PublisherContentStatus, string> = {
  draft: "مسودة",
  pending_review: "قيد المراجعة",
  approved: "معتمد",
  rejected: "مرفوض",
  needs_changes: "مطلوب تعديل",
  under_investigation: "قيد التحقيق",
};

export type PublisherRecord = {
  id: string;
  publisherType: PublisherType;
  name: string;
  englishName: string | null;
  bio: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  phone: string | null;
  email: string | null;
  websiteUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  status: PublisherStatus;
  isTrusted: boolean;
  isPublic: boolean;
  ownerUserId: string | null;
  churchId: string | null;
  monasteryId: string | null;
  followerCount: number;
  contentCount: number;
  likesCount: number;
  listenCount: number;
  readinessScore: number;
  submittedForReviewAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Ordered content IDs for the public hero carousel */
  heroContentIds?: string[];
  /** owner = أنشأ الصفحة · assistant = مساعد مدعو */
  accessRole?: "owner" | "assistant";
};

export type PublisherTeamPermissions = {
  role: "owner" | "assistant";
  canEditProfile: boolean;
  canManageContent: boolean;
  canSubmitPublication: boolean;
  canManageTeam: boolean;
};

export type PublisherTeamMember = {
  id: string;
  userId: string;
  displayName: string;
  canEditProfile: boolean;
  canManageContent: boolean;
  canSubmitPublication: boolean;
  canManageTeam: boolean;
  createdAt: string;
};

export const PUBLISHER_TEAM_PERMISSION_LABELS: Record<
  keyof Omit<PublisherTeamPermissions, "role">,
  string
> = {
  canEditProfile: "تعديل بيانات الصفحة",
  canManageContent: "إضافة وإدارة المحتوى",
  canSubmitPublication: "إرسال الصفحة للنشر",
  canManageTeam: "إدارة المساعدين",
};

export type PublisherContentItem = {
  id: string;
  publisherId: string;
  contentKind: PublisherContentKind;
  title: string;
  description: string | null;
  coverUrl: string | null;
  mediaUrl: string | null;
  visibility: PublisherContentVisibility;
  allowDownload: boolean;
  likesCount: number;
  durationSeconds: number | null;
  status: PublisherContentStatus;
  sortOrder: number;
  payload: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type PublisherReadinessCheck = {
  key: string;
  label: string;
  done: boolean;
  weight: number;
};

export function buildReadinessChecks(publisher: PublisherRecord, hasContent: boolean): PublisherReadinessCheck[] {
  return [
    {
      key: "cover",
      label: "صورة الغلاف",
      done: Boolean(publisher.coverUrl?.trim()),
      weight: 20,
    },
    {
      key: "logo",
      label: "الشعار",
      done: Boolean(publisher.logoUrl?.trim()),
      weight: 20,
    },
    {
      key: "bio",
      label: "نبذة تعريفية (40+ حرف)",
      done: (publisher.bio?.trim().length ?? 0) >= 40,
      weight: 20,
    },
    {
      key: "contact",
      label: "بيانات التواصل",
      done: Boolean(publisher.phone?.trim() || publisher.email?.trim()),
      weight: 20,
    },
    {
      key: "content",
      label: "أول ألبوم / كتاب / ترنيمة",
      done: hasContent,
      weight: 20,
    },
  ];
}

export function computeReadinessScore(checks: PublisherReadinessCheck[]): number {
  return checks.filter((c) => c.done).reduce((sum, c) => sum + c.weight, 0);
}

export function publisherDraftBannerMessage(status: PublisherStatus): string | null {
  switch (status) {
    case "under_review":
      return "هذه الصفحة تحت المراجعة. يمكنك تجهيز المحتوى بالكامل قبل النشر.";
    case "draft":
      return "صفحتك خاصة — جهّز المحتوى ثم أرسلها للمراجعة النهائية.";
    case "pending_publication":
      return "تم إرسال الصفحة للمراجعة النهائية من Alpha.";
    case "published":
      return "صفحتك منشورة للجميع — يمكنك متابعة التحديث من هذه المساحة.";
    case "suspended":
      return "تم إيقاف هذه الصفحة إداريًا.";
    default:
      return null;
  }
}

export function canEditPublisherWorkspace(status: PublisherStatus): boolean {
  return status === "under_review" || status === "draft" || status === "pending_publication";
}

export function canManagePublisherProfile(
  status: PublisherStatus,
  access: Pick<PublisherTeamPermissions, "canEditProfile">,
): boolean {
  return status !== "suspended" && access.canEditProfile;
}

export function canManagePublisherContent(
  status: PublisherStatus,
  access: Pick<PublisherTeamPermissions, "canManageContent">,
): boolean {
  return status !== "suspended" && access.canManageContent;
}

export function canSubmitForPublication(status: PublisherStatus, readinessScore: number): boolean {
  return (status === "under_review" || status === "draft") && readinessScore >= 100;
}

export type PublisherContentMediaSpec = {
  assetKind: "audio" | "video" | "pdf";
  label: string;
  hint: string;
};

/** Primary media file required when adding publisher content. */
export function publisherContentMediaSpec(kind: PublisherContentKind): PublisherContentMediaSpec | null {
  switch (kind) {
    case "album":
      return {
        assetKind: "audio",
        label: "ملف الألبوم / الترانيم",
        hint: "ارفع ملف صوتي (MP3, M4A, OGG…) — حتى 50 ميجابايت",
      };
    case "hymn":
      return {
        assetKind: "audio",
        label: "ملف الترنيمة",
        hint: "ارفع ملف الصوت — حتى 50 ميجابايت",
      };
    case "lecture":
      return {
        assetKind: "audio",
        label: "ملف المحاضرة",
        hint: "ارفع تسجيل المحاضرة — حتى 50 ميجابايت",
      };
    case "playlist":
      return {
        assetKind: "audio",
        label: "ملف قائمة التشغيل",
        hint: "ارفع ملف الصوت أو الألبوم — حتى 50 ميجابايت",
      };
    case "book":
      return {
        assetKind: "pdf",
        label: "ملف الكتاب (PDF)",
        hint: "ارفع ملف PDF — حتى 25 ميجابايت",
      };
    case "video":
      return {
        assetKind: "video",
        label: "ملف الفيديو",
        hint: "ارفع MP4 أو MOV — حتى 100 ميجابايت",
      };
    default:
      return null;
  }
}
