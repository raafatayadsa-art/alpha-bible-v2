/** Structured spiritual share — no free-form user posts. */
export type CommunityMomentKind = "reading" | "prayer" | "agpeya";

export type CommunityReadingPayload = {
  reference: string;
  text: string;
  bookRoute?: string;
  chapter?: number;
  verse?: number;
  /** Auto-generated from reading journey — not manual share */
  auto?: boolean;
  activitySummary?: string;
};

export type CommunityPrayerPayload = {
  title: string;
  body: string;
  category?: string;
  sourcePrayerId?: string;
  activitySummary?: string;
};

export type CommunityAgpeyaPayload = {
  prayerId: string;
  title: string;
  excerpt?: string;
  /** Auto-generated when prayer reading completes */
  auto?: boolean;
  activitySummary?: string;
};

export type CommunityMomentPayload = {
  reading?: CommunityReadingPayload;
  prayer?: CommunityPrayerPayload;
  agpeya?: CommunityAgpeyaPayload;
};

export type CommunityMoment = {
  id: string;
  kind: CommunityMomentKind;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  churchId?: string;
  churchName?: string;
  payload: CommunityMomentPayload;
  createdAt: string;
  /** Optional link to official church post when re-shared from church feed */
  churchPostId?: string;
  /** manual | auto_chapter | auto_book | auto_agpeya */
  source?: "manual" | "auto_chapter" | "auto_book" | "auto_agpeya";
};

export type CommunityReactionKind = "amen" | "prayed_for";

export type CommunityComment = {
  id: string;
  momentId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
};

export type ShareReadingInput = {
  kind: "reading";
  reading: CommunityReadingPayload;
};

export type SharePrayerInput = {
  kind: "prayer";
  prayer: CommunityPrayerPayload;
};

export type ShareAgpeyaInput = {
  kind: "agpeya";
  agpeya: CommunityAgpeyaPayload;
};

export type ShareToCommunityInput = ShareReadingInput | SharePrayerInput | ShareAgpeyaInput;

export const COMMUNITY_KIND_META: Record<
  CommunityMomentKind,
  { label: string; badge: string; accent: string; primaryLabel: string; primarySub: string; reaction: CommunityReactionKind }
> = {
  reading: {
    label: "قراءة",
    badge: "قراءة",
    accent: "#8a6ec1",
    primaryLabel: "آمين",
    primarySub: "بارك القراءة",
    reaction: "amen",
  },
  agpeya: {
    label: "أجبية",
    badge: "أجبية",
    accent: "#c98a3c",
    primaryLabel: "آمين",
    primarySub: "بارك الصلاة",
    reaction: "amen",
  },
  prayer: {
    label: "طلب صلاة",
    badge: "صلاة",
    accent: "#1f8a5a",
    primaryLabel: "صليت لأجلك",
    primarySub: "حمل الطلبة",
    reaction: "prayed_for",
  },
};
