import newsMass from "@/assets/home/news-mass.jpg";
import newsYouth from "@/assets/home/news-youth.jpg";
import artFeast from "@/assets/home/art-feast.jpg";
import dailyPrayer from "@/assets/home/daily-prayer.jpg";
import cardMeditation from "@/assets/home/card-meditation.jpg";
import newsCandle from "@/assets/home/news-candle.jpg";

export type LabDemoKind =
  | "news"
  | "meeting"
  | "trip"
  | "prayer"
  | "congrats"
  | "condolence";

export type LabMember = {
  name: string;
  hue: string;
};

export type LabComment = {
  id: string;
  author: string;
  text: string;
};

export type LabDemoPost = {
  id: string;
  kind: LabDemoKind;
  label: string;
  title: string;
  excerpt: string;
  image: string;
  action: string;
  tone: string;
  softTone: string;
  timeAgo: string;
  participants: LabMember[];
  extraParticipants: number;
  meeting?: {
    date: string;
    time: string;
    location: string;
    attendees: number;
  };
  trip?: {
    date: string;
    price: string;
    total: number;
    booked: number;
    available: number;
  };
  prayer?: {
    prayedCount: number;
    commentsCount: number;
    comments: LabComment[];
  };
  congrats?: {
    congratulationsCount: number;
  };
  condolence?: {
    condolencesCount: number;
    date: string;
    place: string;
  };
  news?: {
    date: string;
    place: string;
  };
};

export const LAB_DEMO_POSTS: LabDemoPost[] = [
  {
    id: "demo-news",
    kind: "news",
    label: "خبر",
    title: "افتتاح فصل جديد لمدرسة الأحد",
    excerpt: "يسعدنا الإعلان عن بدء التسجيل في فصل مدرسة الأحد الجديد لجميع المراحل.",
    image: newsMass,
    action: "اقرأ المزيد",
    tone: "#3a6db0",
    softTone: "#e8f0fa",
    timeAgo: "منذ يومين",
    participants: [
      { name: "بولا", hue: "#5b8fd1" },
      { name: "مارينا", hue: "#8a6ec1" },
      { name: "أندرو", hue: "#1f8a5a" },
    ],
    extraParticipants: 11,
    news: { date: "يبدأ ١٥ يونيو", place: "قاعة التعليم" },
  },
  {
    id: "demo-meeting",
    kind: "meeting",
    label: "اجتماع",
    title: "اجتماع خدمة الشباب",
    excerpt: "لقاء أسبوعي للتخطيط للأنشطة والخدمات القادمة.",
    image: newsYouth,
    action: "سأحضر",
    tone: "#4a7fd4",
    softTone: "#e8f1fc",
    timeAgo: "منذ ساعتين",
    participants: [
      { name: "كيرلس", hue: "#4a7fd4" },
      { name: "مارينا", hue: "#8a6ec1" },
      { name: "أندرو", hue: "#c98a3c" },
    ],
    extraParticipants: 32,
    meeting: {
      date: "الجمعة ١٢ يونيو",
      time: "٧:٠٠ مساءً",
      location: "قاعة الكنيسة الرئيسية",
      attendees: 35,
    },
  },
  {
    id: "demo-trip",
    kind: "trip",
    label: "رحلة",
    title: "رحلة دير الأنبا بيشوي",
    excerpt: "رحلة روحية ليوم كامل مع زيارة الدير والقداس والتأمل.",
    image: artFeast,
    action: "احجز الآن",
    tone: "#2f9d62",
    softTone: "#e6f6ee",
    timeAgo: "منذ ٤ ساعات",
    participants: [
      { name: "يوسف", hue: "#2f9d62" },
      { name: "مريم", hue: "#8a6ec1" },
      { name: "بولا", hue: "#3a6db0" },
    ],
    extraParticipants: 25,
    trip: {
      date: "السبت ٢٠ يونيو",
      price: "١٥٠ جنيه",
      total: 68,
      booked: 28,
      available: 40,
    },
  },
  {
    id: "demo-prayer",
    kind: "prayer",
    label: "طلب صلاة",
    title: "من أجل الأنبا تاوفيلس",
    excerpt: "نطلب صلواتكم من أجل نيافته بعد إجراء عملية جراحية. ليرحمنا الرب ويشفيه.",
    image: dailyPrayer,
    action: "صليت من أجله",
    tone: "#7b5fc9",
    softTone: "#f0ebfa",
    timeAgo: "منذ ٦ ساعات",
    participants: [
      { name: "مريم", hue: "#7b5fc9" },
      { name: "كيرلس", hue: "#4a7fd4" },
      { name: "مارينا", hue: "#c98a3c" },
    ],
    extraParticipants: 42,
    prayer: {
      prayedCount: 45,
      commentsCount: 12,
      comments: [
        {
          id: "c1",
          author: "مريم",
          text: "صليت من أجله، ربنا يشفيه ويعطيه القوة.",
        },
        {
          id: "c2",
          author: "كيرلس",
          text: "الرب يساند نيافته ويرفع عنه كل ضعف.",
        },
      ],
    },
  },
  {
    id: "demo-congrats",
    kind: "congrats",
    label: "تهنئة",
    title: "تهنئة بعيد ميلاد الخادم يوسف",
    excerpt: "كل سنة وأنت طيب يا أخونا المحبوب. نسأل الرب أن يملأ حياتك بركته وفرحه.",
    image: cardMeditation,
    action: "هنّئ",
    tone: "#c7932e",
    softTone: "#faf3e4",
    timeAgo: "منذ ٨ ساعات",
    participants: [
      { name: "مارينا", hue: "#c7932e" },
      { name: "أندرو", hue: "#4a7fd4" },
      { name: "بولا", hue: "#2f9d62" },
    ],
    extraParticipants: 18,
    congrats: { congratulationsCount: 18 },
  },
  {
    id: "demo-condolence",
    kind: "condolence",
    label: "تعزية",
    title: "تعزية في نياحة الحاج عادل صليب",
    excerpt: "انتقل إلى راحته الحاج عادل صليب. الصلاة غدًا الساعة ١٠ صباحًا.",
    image: newsCandle,
    action: "قدّم التعزية",
    tone: "#5c4a38",
    softTone: "#f2ede6",
    timeAgo: "منذ يوم",
    participants: [
      { name: "مريم", hue: "#5c4a38" },
      { name: "يوسف", hue: "#6a543a" },
      { name: "كيرلس", hue: "#4a7fd4" },
    ],
    extraParticipants: 56,
    condolence: {
      condolencesCount: 56,
      date: "الاثنين ٩ يونيو",
      place: "كنيسة العذراء مريم",
    },
  },
];
