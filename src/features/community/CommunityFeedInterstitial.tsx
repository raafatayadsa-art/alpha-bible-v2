import { Link } from "@tanstack/react-router";
import { Bell, BookOpen, Church, Flame, HandHeart, Sparkles } from "lucide-react";
import type { CommunityInterstitialVariant } from "./community-feed-layout";
import { COMMUNITY_GLASS_CARD } from "./community-glass-chrome";

const CONFIG: Record<
  CommunityInterstitialVariant,
  {
    title: string;
    sub: string;
    cta: string;
    to: string;
    icon: typeof HandHeart;
    accent: string;
    bg: string;
  }
> = {
  "prayer-counter": {
    title: "15 يصلّون الآن",
    sub: "انضم لحمل طلبات إخوتك في الصلاة",
    cta: "طلبات الصلاة",
    to: "/prayer-requests",
    icon: HandHeart,
    accent: "#1f8a5a",
    bg: "linear-gradient(135deg, rgba(31,138,90,0.22), rgba(18,48,36,0.12))",
  },
  "prayer-alarm": {
    title: "منبّه الصلاة",
    sub: "فعّل تذكيراً لموعد الصلاة القادم",
    cta: "اضبط المنبّه",
    to: "/agpeya",
    icon: Bell,
    accent: "#5b8fd1",
    bg: "linear-gradient(135deg, rgba(91,143,209,0.22), rgba(30,58,95,0.12))",
  },
  "reading-nudge": {
    title: "تابع قراءتك اليوم",
    sub: "خطوة صغيرة كل يوم — رحلة ثابتة مع الكتاب",
    cta: "افتح الكتاب",
    to: "/bible",
    icon: BookOpen,
    accent: "#8a6ec1",
    bg: "linear-gradient(135deg, rgba(138,110,193,0.22), rgba(42,31,69,0.12))",
  },
  "agpeya-nudge": {
    title: "وقت الأجبية",
    sub: "صلِّ من الأجبية المقدسة الآن",
    cta: "افتح الأجبية",
    to: "/agpeya",
    icon: Church,
    accent: "#c98a3c",
    bg: "linear-gradient(135deg, rgba(201,138,60,0.22), rgba(58,38,18,0.12))",
  },
  streak: {
    title: "سلسلتك الروحية",
    sub: "تابع قراءة · صلاة · أجبية — لا تكسر السلسلة",
    cta: "السجل الروحي",
    to: "/community/spiritual-record",
    icon: Flame,
    accent: "#c44569",
    bg: "linear-gradient(135deg, rgba(196,69,105,0.2), rgba(58,18,28,0.12))",
  },
};

type Props = {
  variant: CommunityInterstitialVariant;
};

export function CommunityFeedInterstitial({ variant }: Props) {
  const cfg = CONFIG[variant];
  const Icon = cfg.icon;

  return (
    <Link
      to={cfg.to}
      className={`block overflow-hidden ${COMMUNITY_GLASS_CARD} active:scale-[0.99] transition-transform`}
      style={{ background: cfg.bg }}
    >
      <div className="flex items-center gap-3 px-4 py-4">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] border border-white/40"
          style={{ background: `${cfg.accent}18`, color: cfg.accent }}
        >
          <Icon className="h-6 w-6" strokeWidth={2.1} />
        </span>
        <div className="min-w-0 flex-1 text-right">
          <p className="flex items-center justify-end gap-1 text-[13px] font-extrabold text-[#3a2a18]">
            <Sparkles className="h-3.5 w-3.5" style={{ color: cfg.accent }} />
            {cfg.title}
          </p>
          <p className="mt-0.5 text-[11px] font-medium leading-snug text-[#6a543a]">{cfg.sub}</p>
          <span
            className="mt-2 inline-flex rounded-lg px-2.5 py-1 text-[10px] font-extrabold"
            style={{ background: `${cfg.accent}14`, color: cfg.accent, border: `1px solid ${cfg.accent}33` }}
          >
            {cfg.cta} ←
          </span>
        </div>
      </div>
    </Link>
  );
}
