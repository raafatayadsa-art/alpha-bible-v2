import type { CommunityFriend } from "./community-friends-store";
import type { CommunityComment, CommunityMoment } from "./community-types";
import avatarMina from "@/assets/avatar-mina.jpg";
import avatarPriest from "@/assets/avatar-priest.jpg";

const pravatar = (seed: string) => `https://i.pravatar.cc/96?u=${encodeURIComponent(seed)}`;

/** Demo friends — preview strip + activity feed under مجتمعي */
export const DEMO_COMMUNITY_FRIENDS: Omit<CommunityFriend, "id" | "addedAt">[] = [
  {
    linkedUserId: "demo-friend-mina",
    name: "مينا رفعت",
    avatarUrl: avatarMina,
    alphaId: "A-DEMOF1",
    role: "خدمة الشباب",
  },
  {
    linkedUserId: "demo-friend-marina",
    name: "مارينا فادي",
    avatarUrl: pravatar("marina-fadi"),
    alphaId: "A-DEMOF2",
    role: "التسبحة",
  },
  {
    linkedUserId: "demo-friend-ahmed",
    name: "أحمد نبيل",
    avatarUrl: pravatar("ahmed-nabil"),
    alphaId: "A-DEMOF3",
    role: "مدرسة الأحد",
  },
  {
    linkedUserId: "demo-friend-sara",
    name: "سارة عادد",
    avatarUrl: pravatar("sara-adel"),
    alphaId: "A-DEMOF4",
    role: "المدائح",
  },
  {
    linkedUserId: "demo-friend-george",
    name: "جورج ميلاد",
    avatarUrl: pravatar("george-milad"),
    alphaId: "A-DEMOF5",
    role: "الشماسة",
  },
  {
    linkedUserId: "demo-friend-nardin",
    name: "ناردين كامل",
    avatarUrl: pravatar("nardin-kamel"),
    alphaId: "A-DEMOF6",
    role: "مدرسة الأحد",
  },
  {
    linkedUserId: "demo-friend-peter",
    name: "بيتر أمين",
    avatarUrl: avatarPriest,
    alphaId: "A-DEMOF7",
    role: "الكورال",
  },
  {
    linkedUserId: "demo-friend-kermina",
    name: "كيرمينا أيوب",
    avatarUrl: pravatar("kermina-ayoub"),
    alphaId: "A-DEMOF8",
    role: "خدمة الشباب",
  },
];

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

export const DEMO_COMMUNITY_MOMENTS: CommunityMoment[] = [
  {
    id: "demo-moment-reading-luke",
    kind: "reading",
    userId: "demo-friend-mina",
    userName: "مينا رفعت",
    userAvatarUrl: avatarMina,
    churchName: "كنيسة القديس مارمرقس",
    payload: {
      reading: {
        reference: "إنجيل لوقا ١:٣٧",
        text: "لأن كل فعل حسن يفعله أحد ينسبونه إلى أبيه الذي في السموات.",
        bookRoute: "luke",
        chapter: 1,
        verse: 37,
        activitySummary: "أتم قراءة إنجيل لوقا",
      },
    },
    createdAt: hoursAgo(2),
    source: "auto_chapter",
  },
  {
    id: "demo-moment-prayer-health",
    kind: "prayer",
    userId: "demo-friend-marina",
    userName: "مارينا فادي",
    userAvatarUrl: pravatar("marina-fadi"),
    churchName: "كنيسة القديس مارمرقس",
    payload: {
      prayer: {
        title: "طلب صلاة للشفاء",
        body: "صلّوا من أجل والدتي — ربنا يبارككم ويشفي كل مريض.",
        category: "صحة",
      },
    },
    createdAt: hoursAgo(5),
    source: "manual",
  },
  {
    id: "demo-moment-agpeya-vespers",
    kind: "agpeya",
    userId: "demo-friend-ahmed",
    userName: "أحمد نبيل",
    userAvatarUrl: pravatar("ahmed-nabil"),
    churchName: "كنيسة القديس مارمرقس",
    payload: {
      agpeya: {
        prayerId: "vespers",
        title: "صلوات عشية",
        excerpt: "أتم صلوات عشية اليوم من الأجبية المقدسة.",
        auto: true,
      },
    },
    createdAt: hoursAgo(8),
    source: "auto_agpeya",
  },
  {
    id: "demo-moment-reading-psalm",
    kind: "reading",
    userId: "demo-friend-sara",
    userName: "سارة عادد",
    userAvatarUrl: pravatar("sara-adel"),
    churchName: "كنيسة القديس مارمرقس",
    payload: {
      reading: {
        reference: "مزمور ٢٣:١",
        text: "الرب راعيّ فلا يعوزني شيء.",
        bookRoute: "psalms",
        chapter: 23,
        verse: 1,
      },
    },
    createdAt: hoursAgo(14),
    source: "manual",
  },
  {
    id: "demo-moment-prayer-exams",
    kind: "prayer",
    userId: "demo-friend-george",
    userName: "جورج ميلاد",
    userAvatarUrl: pravatar("george-milad"),
    churchName: "كنيسة القديس مارمرقس",
    payload: {
      prayer: {
        title: "صلّوا من أجل امتحاناتي",
        body: "الرب يهديني ويفتح ذهني — شكراً لكل من يحملني في صلاته.",
        category: "دراسة",
      },
    },
    createdAt: hoursAgo(26),
    source: "manual",
  },
];

export const DEMO_COMMUNITY_COMMENTS: Record<string, CommunityComment[]> = {
  "demo-moment-reading-luke": [
    {
      id: "demo-c1",
      momentId: "demo-moment-reading-luke",
      userId: "demo-friend-marina",
      userName: "مارينا فادي",
      userAvatarUrl: pravatar("marina-fadi"),
      text: "آمين — آية جميلة جداً 🙏",
      createdAt: hoursAgo(1.5),
    },
    {
      id: "demo-c2",
      momentId: "demo-moment-reading-luke",
      userId: "demo-friend-ahmed",
      userName: "أحمد نبيل",
      userAvatarUrl: pravatar("ahmed-nabil"),
      text: "بارك الله قراءتك يا مينا",
      createdAt: hoursAgo(1.2),
    },
    {
      id: "demo-c3",
      momentId: "demo-moment-reading-luke",
      userId: "demo-friend-sara",
      userName: "سارة عادد",
      userAvatarUrl: pravatar("sara-adel"),
      text: "ربنا يباركك",
      createdAt: hoursAgo(1),
    },
  ],
  "demo-moment-prayer-health": [
    {
      id: "demo-c4",
      momentId: "demo-moment-prayer-health",
      userId: "demo-friend-mina",
      userName: "مينا رفعت",
      userAvatarUrl: avatarMina,
      text: "صليت لأجلك — الشفاء من عند الرب",
      createdAt: hoursAgo(4),
    },
    {
      id: "demo-c5",
      momentId: "demo-moment-prayer-health",
      userId: "demo-friend-nardin",
      userName: "ناردين كامل",
      userAvatarUrl: pravatar("nardin-kamel"),
      text: "الرب يشفيها ويعطيكِ سلاماً",
      createdAt: hoursAgo(3.5),
    },
  ],
};

export const DEMO_COMMUNITY_REACTIONS: Record<
  string,
  Record<"amen" | "prayed_for", { count: number; mine: boolean }>
> = {
  "demo-moment-reading-luke": { amen: { count: 12, mine: false }, prayed_for: { count: 0, mine: false } },
  "demo-moment-prayer-health": { amen: { count: 0, mine: false }, prayed_for: { count: 15, mine: false } },
  "demo-moment-agpeya-vespers": { amen: { count: 8, mine: false }, prayed_for: { count: 0, mine: false } },
  "demo-moment-reading-psalm": { amen: { count: 6, mine: false }, prayed_for: { count: 0, mine: false } },
  "demo-moment-prayer-exams": { amen: { count: 0, mine: false }, prayed_for: { count: 9, mine: false } },
};
