import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronLeft, Users, HandHeart, BookOpen, Music2, Heart, HeartHandshake,
  Megaphone, GraduationCap, UsersRound, UserCog, Calendar, MapPin, Clock,
  ArrowRight, Plus, CalendarPlus, Megaphone as MegaphoneIcon, Sparkles, ShieldCheck,
} from "lucide-react";
import { useChurchRole, setRole, type ChurchRole } from "@/features/church/post-store";
import {
  useUserServices, useUserActivities, REPEAT_LABELS,
  type UserService, type UserActivity,
} from "@/features/church/service-store";
import { ServiceBuilder } from "@/features/church/ServiceBuilder";
import cardChildren from "@/assets/home/card-children.jpg";
import newsYouth from "@/assets/home/news-youth.jpg";
import cardChurch from "@/assets/home/card-church.jpg";
import cardAgpeya from "@/assets/home/card-agpeya.jpg";
import newsMass from "@/assets/home/news-mass.jpg";
import newsCandle from "@/assets/home/news-candle.jpg";
import cardKatameros from "@/assets/home/card-katameros.jpg";
import heavenlyChurch from "@/assets/home/heavenly-church.png";

export const Route = createFileRoute("/church/service")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — الخدمة" },
      { name: "description", content: "خدمات الكنيسة والاجتماعات والأنشطة." },
    ],
  }),
  component: ServiceHub,
});

/* ------------------------------- Categories -------------------------------- */
type Category = {
  key: string;
  label: string;
  icon: any;
  tone: string;
  members: number;
  servants: number;
  img: string;
};

const CATEGORIES: Category[] = [
  { key: "sunday",   label: "مدارس الأحد",  icon: GraduationCap, tone: "#c98a3c", members: 420, servants: 38, img: cardChildren },
  { key: "youth",    label: "الشباب",       icon: Users,         tone: "#5b8fd1", members: 286, servants: 22, img: newsYouth },
  { key: "girls",    label: "الشابات",      icon: UsersRound,    tone: "#d97a8a", members: 198, servants: 18, img: cardAgpeya },
  { key: "women",    label: "السيدات",      icon: Heart,         tone: "#a8669a", members: 312, servants: 14, img: heavenlyChurch },
  { key: "men",      label: "الرجال",       icon: UserCog,       tone: "#3a6db0", members: 245, servants: 12, img: cardChurch },
  { key: "deacons",  label: "الشمامسة",     icon: BookOpen,      tone: "#7a4a26", members: 86,  servants: 9,  img: newsMass },
  { key: "choir",    label: "الكورال",      icon: Music2,        tone: "#8a6ec1", members: 64,  servants: 7,  img: cardKatameros },
  { key: "sick",     label: "خدمة المرضى",  icon: HeartHandshake,tone: "#1f8a5a", members: 52,  servants: 11, img: cardAgpeya },
  { key: "visit",    label: "الافتقاد",     icon: HandHeart,     tone: "#b8893a", members: 74,  servants: 16, img: newsCandle },
  { key: "media",    label: "الإعلام",      icon: Megaphone,     tone: "#c44569", members: 28,  servants: 10, img: newsCandle },
];

/* ------------------------------- Activities -------------------------------- */
type Activity = {
  id: string;
  kind: "اجتماع" | "مؤتمر" | "رحلة" | "يوم روحي";
  title: string;
  day: string;
  month: string;
  time: string;
  place: string;
  tone: string;
};

const ACTIVITIES: Activity[] = [
  { id: "a1", kind: "مؤتمر",    title: "مؤتمر الخدام السنوي",   day: "18", month: "سبتمبر", time: "8:00 صباحاً", place: "دير الأنبا بيشوي",   tone: "#7a4a26" },
  { id: "a2", kind: "يوم روحي", title: "يوم روحي لخدمة المرضى", day: "21", month: "سبتمبر", time: "9:00 صباحاً", place: "كنيسة مار جرجس",     tone: "#1f8a5a" },
  { id: "a3", kind: "رحلة",     title: "رحلة الشباب الروحية",   day: "25", month: "سبتمبر", time: "7:00 صباحاً", place: "وادي النطرون",        tone: "#b8893a" },
];

/* --------------------------------- Header ---------------------------------- */
function Header() {
  return (
    <header
      className="sticky top-0 z-30 px-4 pb-2 pt-[max(env(safe-area-inset-top),14px)]"
      style={{
        background:
          "linear-gradient(180deg, rgba(244,234,216,0.95) 0%, rgba(244,234,216,0.6) 70%, rgba(244,234,216,0) 100%)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/church"
          aria-label="رجوع"
          className="inline-grid h-10 w-10 place-items-center rounded-full bg-white/80 border border-[#efe2c4] text-[#3a2a18] active:scale-90 transition-transform shadow-[0_8px_20px_-14px_rgba(120,80,30,0.45)]"
        >
          <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
        </Link>
        <h1 className="text-[15px] font-extrabold text-[#3a2a18]">الخدمة</h1>
        <span className="w-10" />
      </div>
    </header>
  );
}

/* --------------------------------- Hero ----------------------------------- */
function Hero() {
  const totalMembers = CATEGORIES.reduce((s, c) => s + c.members, 0);
  const totalServants = CATEGORIES.reduce((s, c) => s + c.servants, 0);

  return (
    <section className="relative">
      <div className="relative overflow-hidden rounded-[32px] border border-white/70 shadow-[0_30px_60px_-30px_rgba(60,40,16,0.55),inset_0_1px_0_rgba(255,255,255,0.7)]">
        <div className="relative h-[200px] w-full">
          <img src={cardChurch} alt="الخدمة" className="absolute inset-0 h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(120,80,180,0.18) 0%, rgba(15,10,4,0.45) 60%, rgba(15,10,4,0.92) 100%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 mix-blend-screen opacity-60"
            style={{
              background:
                "radial-gradient(60% 50% at 75% 25%, rgba(231,201,122,0.45), transparent 60%)",
            }}
          />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#e7c97a]/80 to-transparent" />

          {/* Title block */}
          <div className="absolute bottom-3 right-4 left-4 text-right text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 px-2.5 py-1 text-[10px] font-extrabold mb-2">
              <HandHeart className="h-3 w-3" strokeWidth={2.6} />
              مركز الخدمة الكنسية
            </span>
            <h2 className="font-arabic-serif text-[24px] font-extrabold leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
              الخدمة
            </h2>
            <p className="mt-1 text-[11.5px] text-white/90 leading-snug">
              خدمات الكنيسة والاجتماعات والأنشطة
            </p>
          </div>
        </div>

        {/* Glass stats footer */}
        <div
          className="relative px-4 py-3 grid grid-cols-3 gap-2"
          style={{
            background:
              "linear-gradient(180deg, rgba(251,243,225,0.95) 0%, rgba(243,228,250,0.92) 100%)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="absolute top-0 inset-x-4 h-px bg-gradient-to-r from-transparent via-[#c79356]/40 to-transparent" />
          <HeroStat icon={Users} value={totalMembers.toLocaleString("ar-EG")} label="مخدوم" tone="#5b8fd1" />
          <HeroStat icon={HandHeart} value={totalServants.toLocaleString("ar-EG")} label="خادم" tone="#1f8a5a" />
          <HeroStat icon={Calendar} value={CATEGORIES.length.toLocaleString("ar-EG")} label="فريق" tone="#8a6ec1" />
        </div>
      </div>
    </section>
  );
}

function HeroStat({ icon: Icon, value, label, tone }: { icon: any; value: string; label: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-white/80 border border-white/80 px-2 py-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_18px_-12px_rgba(120,80,30,0.45)]">
      <div
        className="mx-auto grid h-7 w-7 place-items-center rounded-lg border border-white/70"
        style={{ background: `linear-gradient(160deg, ${tone}22, ${tone}55)`, color: tone }}
      >
        <Icon className="h-4 w-4" strokeWidth={2.2} />
      </div>
      <p className="mt-1 text-[13px] font-extrabold text-[#3a2a18] leading-none tabular-nums">{value}</p>
      <p className="mt-0.5 text-[9px] font-bold text-[#6a543a] leading-none">{label}</p>
    </div>
  );
}

/* ------------------------------- Section title ------------------------------ */
function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-end justify-between gap-3 px-1">
      <h3 className="text-[15px] font-extrabold text-[#3a2a18] leading-none">{title}</h3>
      {action}
    </div>
  );
}

/* ----------------------------- Category card ------------------------------- */
function CategoryCard({ c }: { c: Category }) {
  return (
    <Link
      to="/church/service"
      className="group relative block overflow-hidden rounded-3xl border border-white/70 active:scale-[0.97] transition-transform shadow-[0_18px_36px_-22px_rgba(120,80,30,0.55),inset_0_1px_0_rgba(255,255,255,0.85)]"
    >
      {/* Image background */}
      <div className="relative h-[170px]">
        <img src={c.img} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${c.tone}1f 0%, rgba(15,10,4,0.2) 45%, rgba(15,10,4,0.88) 100%)`,
          }}
        />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#e7c97a]/70 to-transparent" />

        {/* 3D-style icon badge */}
        <div
          className="absolute top-2.5 right-2.5 grid h-11 w-11 place-items-center rounded-2xl border border-white/60 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_18px_-10px_rgba(0,0,0,0.5)]"
          style={{
            background: `linear-gradient(160deg, ${c.tone}ee, ${c.tone}99)`,
            color: "#fff",
          }}
        >
          <c.icon className="h-5 w-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" strokeWidth={2.3} />
        </div>

        {/* Title */}
        <div className="absolute bottom-2.5 right-2.5 left-2.5 text-right text-white">
          <p className="font-arabic-serif text-[13.5px] font-extrabold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            {c.label}
          </p>
        </div>
      </div>

      {/* Stats footer */}
      <div className="flex items-center justify-between gap-1.5 px-2.5 py-2 bg-[#fbf3e1]/95 backdrop-blur-md">
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#3a6db0]">
          <Users className="h-3 w-3" strokeWidth={2.6} />
          {c.members.toLocaleString("ar-EG")}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#1f8a5a]">
          <HandHeart className="h-3 w-3" strokeWidth={2.6} />
          {c.servants.toLocaleString("ar-EG")}
        </span>
      </div>
    </Link>
  );
}

function CategoriesGrid({ extra }: { extra: Category[] }) {
  const all = [...extra, ...CATEGORIES];
  return (
    <section>
      <SectionTitle
        title="فرق الخدمة"
        action={<span className="text-[11px] font-bold text-[#b8893a]">{all.length} فريق</span>}
      />
      <div className="grid grid-cols-2 gap-3">
        {all.map((c) => (
          <CategoryCard key={c.key} c={c} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ Activity card ------------------------------ */
function ActivityCard({ a }: { a: Activity }) {
  return (
    <div className="relative flex items-stretch gap-0 overflow-hidden rounded-[24px] border border-white/70 bg-[#fbf3e1]/85 backdrop-blur-xl shadow-[0_16px_40px_-22px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] active:scale-[0.98] transition-transform">
      {/* Large date block */}
      <div
        className="flex w-[82px] shrink-0 flex-col items-center justify-center gap-0.5 border-l border-white/60"
        style={{ background: `linear-gradient(180deg, ${a.tone}22, ${a.tone}0a)` }}
      >
        <span className="font-arabic-serif text-[28px] font-extrabold text-[#3a2a18] leading-none tabular-nums">{a.day}</span>
        <span className="text-[10px] font-bold text-[#b8893a] leading-none">{a.month}</span>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 text-right">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-extrabold text-white border border-white/30"
          style={{ background: `linear-gradient(180deg, ${a.tone}, ${a.tone}cc)` }}
        >
          {a.kind}
        </span>
        <h4 className="mt-1.5 text-[13.5px] font-extrabold text-[#3a2a18] leading-tight">{a.title}</h4>
        <div className="mt-1.5 flex flex-col gap-1">
          <p className="inline-flex items-center justify-end gap-1.5 text-[10.5px] text-[#6a543a]">
            <Clock className="h-3 w-3 text-[#b8893a]" strokeWidth={2} />
            {a.time}
          </p>
          <p className="inline-flex items-center justify-end gap-1.5 text-[10.5px] text-[#6a543a]">
            <MapPin className="h-3 w-3 text-[#b8893a]" strokeWidth={2} />
            {a.place}
          </p>
        </div>
      </div>

      {/* Chevron */}
      <div className="flex items-center px-3">
        <ChevronLeft className="h-4 w-4 text-[#c79356]" />
      </div>
    </div>
  );
}

function UpcomingActivities({ extra }: { extra: Activity[] }) {
  const all = [...extra, ...ACTIVITIES];
  return (
    <section>
      <SectionTitle
        title="الأنشطة القادمة"
        action={
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b8893a]">
            عرض الكل <ArrowRight className="h-3 w-3 -scale-x-100" />
          </span>
        }
      />
      <div className="flex flex-col gap-3">
        {all.map((a) => (
          <ActivityCard key={a.id} a={a} />
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- Management toolbar -------------------------- */
type ActionKey = "new-service" | "new-activity" | "new-meeting" | "new-announcement";
type Action = { key: ActionKey; label: string; icon: any; tone: string };

const PRIEST_ACTIONS: Action[] = [
  { key: "new-service",  label: "خدمة جديدة",   icon: Plus,         tone: "#7a4a26" },
  { key: "new-activity", label: "نشاط جديد",    icon: Sparkles,     tone: "#b8893a" },
];
const LEADER_ACTIONS: Action[] = [
  { key: "new-meeting",      label: "اجتماع جديد", icon: CalendarPlus,  tone: "#5b8fd1" },
  { key: "new-announcement", label: "إعلان جديد",  icon: MegaphoneIcon, tone: "#a8669a" },
];

function ActionButton({ a, onClick }: { a: Action; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/85 px-3 py-2 text-[12px] font-extrabold text-[#3a2a18] backdrop-blur-md shadow-[0_10px_24px_-14px_rgba(120,80,30,0.5),inset_0_1px_0_rgba(255,255,255,0.9)] active:scale-95 transition-transform"
    >
      <span
        className="grid h-6 w-6 place-items-center rounded-full text-white"
        style={{ background: `linear-gradient(160deg, ${a.tone}, ${a.tone}bb)` }}
      >
        <a.icon className="h-3.5 w-3.5" strokeWidth={2.5} />
      </span>
      {a.label}
    </button>
  );
}

const ROLE_LABEL: Record<ChurchRole, string> = {
  priest: "كاهن",
  leader: "أمين خدمة",
  servant: "خادم",
  admin: "مشرف",
  member: "مخدوم",
};

function RoleSwitcher({ role }: { role: ChurchRole }) {
  const roles: ChurchRole[] = ["priest", "leader", "servant", "member"];
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/70 border border-white/70 px-2 py-1 text-[10px] font-extrabold text-[#6a543a]">
        <ShieldCheck className="h-3 w-3 text-[#b8893a]" strokeWidth={2.6} />
        دوري
      </span>
      {roles.map((r) => {
        const active = r === role;
        return (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-extrabold border transition-colors ${
              active
                ? "bg-[#3a2a18] text-[#f4ead8] border-[#3a2a18]"
                : "bg-white/70 text-[#3a2a18] border-white/70"
            }`}
          >
            {ROLE_LABEL[r]}
          </button>
        );
      })}
    </div>
  );
}

function ManagementBar({ role, onAction }: { role: ChurchRole; onAction: (k: ActionKey) => void }) {
  const isPriest = role === "priest" || role === "admin";
  const isLeader = role === "leader" || isPriest;
  const actions: Action[] = [
    ...(isPriest ? PRIEST_ACTIONS : []),
    ...(isLeader ? LEADER_ACTIONS : []),
  ];
  if (actions.length === 0) return null;
  return (
    <section
      className="rounded-3xl border border-white/70 p-3 shadow-[0_18px_36px_-24px_rgba(120,80,30,0.5),inset_0_1px_0_rgba(255,255,255,0.85)]"
      style={{
        background:
          "linear-gradient(180deg, rgba(251,243,225,0.95) 0%, rgba(243,228,250,0.92) 100%)",
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[13px] font-extrabold text-[#3a2a18]">إدارة الخدمة</h3>
        <span className="text-[10.5px] font-bold text-[#b8893a]">{ROLE_LABEL[role]}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => <ActionButton key={a.key} a={a} onClick={() => onAction(a.key)} />)}
      </div>
    </section>
  );
}

/* --------------------------- adapters: user -> view ------------------------ */
const AR_MONTHS = [
  "يناير","فبراير","مارس","أبريل","مايو","يونيو",
  "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر",
];
const KIND_TONES: Record<string, string> = {
  "اجتماع": "#5b8fd1", "مؤتمر": "#7a4a26", "رحلة": "#b8893a",
  "يوم روحي": "#1f8a5a", "خلوة": "#8a6ec1", "تدريب خدام": "#a8669a",
};
function userActivityToCard(u: UserActivity): Activity {
  const d = u.date ? new Date(u.date) : new Date();
  const repeatTag = u.repeat && u.repeat !== "none" ? ` · ${REPEAT_LABELS[u.repeat]}` : "";
  return {
    id: u.id,
    kind: u.kind as any,
    title: u.title,
    day: String(d.getDate()).padStart(2, "0"),
    month: AR_MONTHS[d.getMonth()] ?? "",
    time: (u.time ?? "—") + repeatTag,
    place: u.location ?? "—",
    tone: KIND_TONES[u.kind] ?? "#8a6ec1",
  };
}
const TYPE_PRESET: Record<string, Category | undefined> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
);
function userServiceToCard(s: UserService): Category {
  const preset = TYPE_PRESET[s.type];
  const servantCount = s.servants ? s.servants.split(/[،,]/).filter(Boolean).length : 0;
  return {
    key: s.id,
    label: s.name,
    icon: preset?.icon ?? Users,
    tone: preset?.tone ?? "#8a6ec1",
    members: 0,
    servants: servantCount,
    img: s.image || preset?.img || cardChurch,
  };
}

/* --------------------------------- Screen ---------------------------------- */
function ServiceHub() {
  const role = useChurchRole();
  const userServices = useUserServices();
  const userActivities = useUserActivities();
  const [builder, setBuilder] = useState<null | "service" | "activity">(null);

  const onAction = (k: ActionKey) => {
    if (k === "new-service") setBuilder("service");
    else if (k === "new-activity" || k === "new-meeting") setBuilder("activity");
    // "new-announcement" left as no-op here (handled by Posts system)
  };

  const extraCategories = userServices.map(userServiceToCard);
  const extraActivities = userActivities.map(userActivityToCard);

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4ead8]">
      <Header />
      <main className="px-4 pb-[max(env(safe-area-inset-bottom),16px)] space-y-5">
        <Hero />
        <RoleSwitcher role={role} />
        <ManagementBar role={role} onAction={onAction} />
        <CategoriesGrid extra={extraCategories} />
        <UpcomingActivities extra={extraActivities} />
      </main>
      {builder && (
        <ServiceBuilder mode={builder} onClose={() => setBuilder(null)} />
      )}
    </div>
  );
}
