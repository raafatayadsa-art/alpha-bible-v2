import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  Bus,
  CalendarDays,
  CandlestickChart,
  CheckCircle2,
  Church,
  Clock,
  Flame,
  Gift,
  HandHeart,
  Heart,
  MapPin,
  MessageCircle,
  Newspaper,
  PartyPopper,
  Phone,
  Ticket,
  Users,
} from "lucide-react";
import heroChurch from "@/assets/home/hero-church-premium.jpg";
import newsMass from "@/assets/home/news-mass.jpg";
import newsYouth from "@/assets/home/news-youth.jpg";
import artFeast from "@/assets/home/art-feast.jpg";
import dailyPrayer from "@/assets/home/daily-prayer.jpg";
import cardMeditation from "@/assets/home/card-meditation.jpg";
import newsCandle from "@/assets/home/news-candle.jpg";

export const Route = createFileRoute("/church-feed-lab")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Church Feed Lab" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ChurchFeedLabPage,
});

/* ── mock data (lab only) ── */

type LabDemoKind =
  | "news"
  | "meeting"
  | "trip"
  | "prayer"
  | "congrats"
  | "condolence";

type LabMember = { name: string; hue: string };
type LabComment = { id: string; author: string; text: string };

type LabDemoPost = {
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
  meeting?: { date: string; time: string; location: string; attendees: number };
  trip?: { date: string; price: string; total: number; booked: number; available: number };
  prayer?: { prayedCount: number; commentsCount: number; comments: LabComment[] };
  congrats?: { congratulationsCount: number };
  condolence?: { condolencesCount: number; date: string; place: string };
  news?: { date: string; place: string };
};

const LAB_DEMO_POSTS: LabDemoPost[] = [
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
        { id: "c1", author: "مريم", text: "صليت من أجله، ربنا يشفيه ويعطيه القوة." },
        { id: "c2", author: "كيرلس", text: "الرب يساند نيافته ويرفع عنه كل ضعف." },
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

const CTA_CLASS =
  "flex h-10 w-full min-w-[96px] shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold text-white whitespace-nowrap shadow-[0_8px_20px_-10px_rgba(0,0,0,0.28)] transition active:scale-[0.98]";

const LAB_HERO = {
  name: "كنيسة العذراء مريم",
  subtitle: "بطريركية الأقباط الأرثوذكس",
  priestName: "القس يوأنس ميخائيل",
  greeting: "أهلاً بك يا مريم",
  image: heroChurch,
};

const LAB_QUICK_ACCESS = [
  {
    id: "urgent",
    label: "عاجل",
    icon: Bell,
    gradFrom: "#f26b6b",
    gradTo: "#c44545",
    shadow: "rgba(196,69,69,0.5)",
    glow: true,
  },
  {
    id: "congrats",
    label: "تهنئة",
    icon: Gift,
    gradFrom: "#e8c06a",
    gradTo: "#c7932e",
    shadow: "rgba(199,147,46,0.45)",
    glow: false,
  },
  {
    id: "meetings",
    label: "اجتماعات",
    icon: Users,
    gradFrom: "#6ba3e8",
    gradTo: "#4a7fd4",
    shadow: "rgba(74,127,212,0.45)",
    glow: false,
  },
  {
    id: "trips",
    label: "رحلات",
    icon: Bus,
    gradFrom: "#4dbf82",
    gradTo: "#2f9d62",
    shadow: "rgba(47,157,98,0.45)",
    glow: false,
  },
  {
    id: "prayer",
    label: "طلبات صلاة",
    icon: HandHeart,
    gradFrom: "#9b7ee0",
    gradTo: "#7b5fc9",
    shadow: "rgba(123,95,201,0.45)",
    glow: false,
  },
  {
    id: "condolence",
    label: "تعزية",
    icon: CandlestickChart,
    gradFrom: "#8a7460",
    gradTo: "#6a543a",
    shadow: "rgba(106,84,58,0.42)",
    glow: false,
  },
  {
    id: "meditations",
    label: "تأملات",
    icon: BookOpen,
    gradFrom: "#7a5fc9",
    gradTo: "#5a3d8a",
    shadow: "rgba(90,61,138,0.45)",
    glow: false,
  },
  {
    id: "directory",
    label: "دليل الكنائس",
    icon: Church,
    gradFrom: "#d4a84a",
    gradTo: "#5b8fd1",
    shadow: "rgba(91,143,209,0.42)",
    glow: false,
  },
] as const;

function LabQuickIcon3D({ item }: { item: (typeof LAB_QUICK_ACCESS)[number] }) {
  const Icon = item.icon;
  return (
    <div className="flex w-[76px] shrink-0 flex-col items-center gap-1.5">
      <button
        type="button"
        aria-label={item.label}
        className="relative grid h-[60px] w-[60px] place-items-center rounded-[22px] border border-white/40 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.94]"
        style={{
          background: `linear-gradient(145deg, ${item.gradFrom} 0%, ${item.gradTo} 100%)`,
          boxShadow: [
            "inset 0 1px 0 rgba(255,255,255,0.55)",
            "inset 0 -8px 16px -10px rgba(0,0,0,0.2)",
            `0 14px 26px -12px ${item.shadow}`,
            "0 6px 14px -8px rgba(70,55,30,0.22)",
            item.glow ? `0 0 20px -4px ${item.shadow}` : "",
          ]
            .filter(Boolean)
            .join(", "),
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-2.5 top-1.5 h-[42%] rounded-[14px] bg-gradient-to-b from-white/55 via-white/20 to-transparent"
        />
        <Icon
          className="relative z-10 h-[26px] w-[26px] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
          strokeWidth={2.4}
        />
      </button>
      <span className="max-w-[76px] truncate whitespace-nowrap text-center text-[10.5px] font-semibold leading-tight text-stone-700">
        {item.label}
      </span>
    </div>
  );
}

const LAB_HERO_ACTIONS = [
  { id: "phone", icon: Phone, label: "اتصال" },
  { id: "messages", icon: MessageCircle, label: "رسائل" },
  { id: "location", icon: MapPin, label: "موقع" },
] as const;

function LabHeroActionRail() {
  return (
    <div className="absolute left-2.5 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2.5">
      {LAB_HERO_ACTIONS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          type="button"
          aria-label={label}
          className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-white/85 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-[0.96]"
          style={{
            background: "rgba(255,255,255,0.75)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          }}
        >
          <Icon className="h-[18px] w-[18px] text-[#4a3a28]" strokeWidth={2.4} />
        </button>
      ))}
    </div>
  );
}

function LabHeroCard() {
  return (
    <section className="relative mx-auto w-full max-w-[var(--alpha-content-narrow-width)] px-1">
      <div className="relative h-[205px] overflow-hidden rounded-[30px] border border-white/70 shadow-[0_1px_0_rgba(255,255,255,0.85)_inset,0_20px_44px_-24px_rgba(120,80,30,0.38)]">
        {/* Left-half church image */}
        <div className="absolute inset-y-0 left-0 w-[45%]">
          <img
            src={LAB_HERO.image}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(30,20,8,0.12) 0%, rgba(251,243,225,0.15) 45%, rgba(251,243,225,0.98) 88%, rgba(251,243,225,1) 100%)",
            }}
          />
          <LabHeroActionRail />
        </div>

        {/* Right-half warm ivory surface */}
        <div
          className="absolute inset-y-0 right-0 w-[58%]"
          style={{
            background:
              "linear-gradient(180deg, rgba(252,246,232,0.98) 0%, rgba(245,234,216,0.96) 100%)",
          }}
        />

        {/* Right-side identity block */}
        <div
          className="absolute inset-y-0 right-0 z-10 flex w-[56%] flex-col items-end justify-center px-3 py-4 text-right"
          dir="rtl"
        >
          <h1 className="text-[19px] font-extrabold leading-[1.15] text-[#3d2e1c]">
            {LAB_HERO.name}
          </h1>
          <p className="mt-1 text-[11px] leading-snug text-[#7a6548]">{LAB_HERO.subtitle}</p>

          <div className="mt-2.5 inline-flex items-center gap-2">
            <span className="text-[11.5px] font-bold text-[#4a3a28]">{LAB_HERO.priestName}</span>
            <span
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e8dff5] to-[#9b87c4] text-[10px] font-bold text-white ring-2 ring-[#fbf3e1]"
              aria-hidden
            >
              ي
            </span>
          </div>

          <p className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] text-[#8a7355]">
            <Heart className="h-3 w-3 fill-[#7b5fc9]/30 text-[#7b5fc9]" strokeWidth={2.4} />
            {LAB_HERO.greeting}
          </p>
        </div>
      </div>
    </section>
  );
}

function LabQuickAccessRow() {
  return (
    <section className="mx-auto mt-3 w-full max-w-[var(--alpha-content-narrow-width)] px-1">
      <div className="relative overflow-hidden rounded-[28px] border border-white/50 bg-white/30 px-3 py-3 shadow-[0_14px_36px_rgba(120,90,40,0.1)] backdrop-blur-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[28px] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
        />
        <div className="relative flex justify-start gap-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {LAB_QUICK_ACCESS.map((item) => (
            <LabQuickIcon3D key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function cardBg(post: LabDemoPost) {
  if (post.kind === "prayer") return "bg-[linear-gradient(155deg,#f7f3fc_0%,#ffffff_62%)]";
  if (post.kind === "congrats") return "bg-[linear-gradient(155deg,#fdf8ee_0%,#ffffff_62%)]";
  if (post.kind === "condolence") return "bg-[linear-gradient(155deg,#f5f2ee_0%,#ffffff_62%)]";
  return "bg-white";
}

function initial(name: string) {
  return [...name.trim()][0] ?? "α";
}

function LabMemberAvatar({ member }: { member: LabMember }) {
  return (
    <span
      className="inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white"
      style={{ background: `linear-gradient(135deg, ${member.hue}dd, ${member.hue})` }}
      aria-hidden
    >
      {initial(member.name)}
    </span>
  );
}

function LabMemberStack({
  members,
  extra,
  tone,
}: {
  members: LabMember[];
  extra: number;
  tone: string;
}) {
  return (
    <div className="flex min-w-0 items-center">
      <div className="flex -space-x-2 space-x-reverse">
        {members.slice(0, 3).map((m) => (
          <LabMemberAvatar key={m.name} member={m} />
        ))}
      </div>
      {extra > 0 ? (
        <span className="mr-1 text-[10px] font-bold" style={{ color: tone }}>
          +{extra}
        </span>
      ) : null}
    </div>
  );
}

function TypeBadge({ post }: { post: LabDemoPost }) {
  const icons = {
    news: Newspaper,
    meeting: Users,
    trip: Bus,
    prayer: HandHeart,
    congrats: Gift,
    condolence: Flame,
  } as const;
  const Icon = icons[post.kind];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
      style={{ backgroundColor: post.softTone, color: post.tone }}
    >
      <Icon className="h-3 w-3 shrink-0" strokeWidth={2.4} />
      {post.label}
    </span>
  );
}

function LabCommentPreview({ comment }: { comment: LabComment }) {
  return (
    <div className="rounded-xl border border-[#ede0c8]/80 bg-[#faf5eb]/90 px-2 py-1 text-right">
      <p className="line-clamp-1 text-[9.5px] leading-snug text-[#5a4630]">
        <span className="font-bold text-[#4a3a28]">{comment.author}: </span>
        {comment.text}
      </p>
    </div>
  );
}

function SeatStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg bg-[#f4f7f4] px-1 py-1 text-center">
      <p className="text-[11px] font-extrabold leading-none" style={{ color }}>
        {value}
      </p>
      <p className="mt-0.5 text-[8px] font-semibold text-[#8a7355]">{label}</p>
    </div>
  );
}

function MetaBlock({ post }: { post: LabDemoPost }) {
  if (post.kind === "meeting" && post.meeting) {
    const m = post.meeting;
    return (
      <div className="space-y-0.5 text-[10px] text-[#5a4630]">
        <p className="flex items-center justify-end gap-1">
          <span>{m.date}</span>
          <CalendarDays className="h-3 w-3 shrink-0" style={{ color: post.tone }} strokeWidth={2.4} />
          <span className="opacity-40">·</span>
          <span>{m.time}</span>
          <Clock className="h-3 w-3 shrink-0" style={{ color: post.tone }} strokeWidth={2.4} />
        </p>
        <p className="flex items-center justify-end gap-1">
          <span className="line-clamp-1">{m.location}</span>
          <MapPin className="h-3 w-3 shrink-0" style={{ color: post.tone }} strokeWidth={2.4} />
        </p>
        <p className="font-bold" style={{ color: post.tone }}>
          {m.attendees} سيحضرون
        </p>
      </div>
    );
  }

  if (post.kind === "trip" && post.trip) {
    const t = post.trip;
    return (
      <div className="space-y-1">
        <p className="flex items-center justify-end gap-1 text-[10px] text-[#5a4630]">
          <span>{t.date}</span>
          <CalendarDays className="h-3 w-3 shrink-0" style={{ color: post.tone }} strokeWidth={2.4} />
          <span className="opacity-40">·</span>
          <span>{t.price}</span>
          <Ticket className="h-3 w-3 shrink-0" style={{ color: post.tone }} strokeWidth={2.4} />
        </p>
        <div className="grid grid-cols-3 gap-1">
          <SeatStat label="إجمالي" value={t.total} color="#8a7355" />
          <SeatStat label="متاح" value={t.available} color={post.tone} />
          <SeatStat label="حجز" value={t.booked} color="#3d2e1c" />
        </div>
      </div>
    );
  }

  if (post.kind === "prayer" && post.prayer) {
    const p = post.prayer;
    return (
      <div className="space-y-1">
        <div className="space-y-0.5">
          {p.comments.slice(0, 2).map((c) => (
            <LabCommentPreview key={c.id} comment={c} />
          ))}
        </div>
        <div className="flex items-center justify-end gap-3 text-[10px]">
          <span>
            <b style={{ color: post.tone }}>{p.prayedCount}</b>{" "}
            <span className="text-[#8a7355]">صلوا من أجله</span>
          </span>
          <span>
            <b className="text-[#4a3a28]">{p.commentsCount}</b>{" "}
            <span className="text-[#8a7355]">تعليق</span>
          </span>
        </div>
      </div>
    );
  }

  if (post.kind === "congrats" && post.congrats) {
    return (
      <p className="text-right text-[10px]">
        <b style={{ color: post.tone }}>{post.congrats.congratulationsCount}</b>{" "}
        <span className="text-[#8a7355]">تهنئة</span>
      </p>
    );
  }

  if (post.kind === "condolence" && post.condolence) {
    const c = post.condolence;
    return (
      <div className="space-y-0.5 text-[10px] text-[#5a4630]">
        <p className="flex items-center justify-end gap-1">
          <span>{c.date}</span>
          <CalendarDays className="h-3 w-3 shrink-0" style={{ color: post.tone }} strokeWidth={2.4} />
        </p>
        <p className="flex items-center justify-end gap-1">
          <span className="line-clamp-1">{c.place}</span>
          <MapPin className="h-3 w-3 shrink-0" style={{ color: post.tone }} strokeWidth={2.4} />
        </p>
        <p className="font-bold" style={{ color: post.tone }}>
          {c.condolencesCount} تعزية
        </p>
      </div>
    );
  }

  if (post.kind === "news" && post.news) {
    return (
      <p className="flex items-center justify-end gap-1 text-[10px] text-[#5a4630]">
        <span>{post.news.date}</span>
        <CalendarDays className="h-3 w-3 shrink-0" style={{ color: post.tone }} strokeWidth={2.4} />
        <span className="opacity-40">·</span>
        <span className="line-clamp-1">{post.news.place}</span>
        <MapPin className="h-3 w-3 shrink-0" style={{ color: post.tone }} strokeWidth={2.4} />
      </p>
    );
  }

  return null;
}

function CtaIcon({ kind }: { kind: LabDemoKind }) {
  switch (kind) {
    case "meeting":
      return <CheckCircle2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />;
    case "trip":
      return <Ticket className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />;
    case "congrats":
      return <PartyPopper className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />;
    case "prayer":
    case "condolence":
      return <HandHeart className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />;
    default:
      return null;
  }
}

function LabFeedCard({ post }: { post: LabDemoPost }) {
  const titleColor = post.kind === "news" ? post.tone : "#3d2e1c";

  return (
    <article
      className={
        "mx-auto w-full max-w-[var(--alpha-content-narrow-width)] min-h-[190px] overflow-hidden rounded-[28px] border border-[#ede0c8]/90 " +
        cardBg(post) +
        " shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_36px_-18px_rgba(80,50,20,0.28)]"
      }
    >
      <div className="grid min-h-[190px] grid-cols-[42%_58%]" dir="rtl">
        <div className="relative overflow-hidden">
          <img
            src={post.image}
            alt=""
            className="h-full min-h-[190px] w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="flex min-h-[190px] min-w-0 flex-col justify-between p-4">
          <div className="flex min-h-0 flex-1 flex-col gap-1.5">
            <div className="flex justify-end">
              <TypeBadge post={post} />
            </div>
            <h2
              className="line-clamp-2 text-right text-[14px] font-extrabold leading-snug"
              style={{ color: titleColor }}
            >
              {post.title}
            </h2>
            <p className="line-clamp-2 text-right text-[10.5px] leading-snug text-[#6a543a]">
              {post.excerpt}
            </p>
            <div className="min-h-0 flex-1">
              <MetaBlock post={post} />
            </div>
          </div>

          <div className="mt-2 shrink-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <LabMemberStack
                members={post.participants}
                extra={post.extraParticipants}
                tone={post.tone}
              />
              <span className="shrink-0 text-[9px] text-[#9a8468]">{post.timeAgo}</span>
            </div>
            <button
              type="button"
              className={CTA_CLASS}
              style={{ backgroundColor: post.tone }}
            >
              <span className="truncate">{post.action}</span>
              <CtaIcon kind={post.kind} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ChurchFeedLabPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#f4ead8] pb-10">
      <div className="mx-auto max-w-[var(--alpha-content-max-width)] px-2 pt-3">
        <LabHeroCard />
        <LabQuickAccessRow />

        <div className="mt-4 flex flex-col gap-3">
          {LAB_DEMO_POSTS.map((post) => (
            <LabFeedCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
