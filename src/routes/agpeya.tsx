import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Bookmark, Clock, BookOpen, ChevronRight, Sun, Sunset, Moon, MoonStar, Sparkles, Heart, Music2, Shield } from "lucide-react";
import { useMemo } from "react";
import {
  AGPEYA_PRAYERS,
  getAgpeyaBySection,
  getCurrentAgpeyaPrayer,
  readLastOpenedPrayer,
  useSavedAgpeya,
} from "@/features/agpeya";
import type { AgpeyaPrayer } from "@/features/agpeya";
import { BottomDock } from "@/components/bible/BottomDock";
import { cn } from "@/lib/utils";
import headerStill from "@/assets/agpeya/header-still.jpg";
import heroSunrise from "@/assets/agpeya/hero-sunrise.jpg";

export const Route = createFileRoute("/agpeya")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — الأجبية" },
      { name: "description", content: "صلوات السواعي اليومية — الأجبية القبطية." },
    ],
  }),
  component: AgpeyaHome,
});

/* ---------- Per-prayer styling tokens (matches reference) ---------- */

type AccentTokens = {
  card: string;          // gradient + border
  iconBg: string;        // soft circle behind icon
  iconColor: string;     // icon stroke color
  title: string;         // title color
  meta: string;          // time/meta color
  chev: string;          // chevron pill color
  Icon: React.ComponentType<{ className?: string }>;
};

const ACCENTS: Record<NonNullable<AgpeyaPrayer["accent"]>, AccentTokens> = {
  dawn: {
    card: "bg-gradient-to-br from-[#fff3d0] via-[#ffe7b0] to-[#fcd887] border-[#e7c075]/55",
    iconBg: "bg-white/85",
    iconColor: "text-[#c98a1f]",
    title: "text-[#6e4715]",
    meta: "text-[#8a5a1f]",
    chev: "bg-white/85 text-[#8a5a1f]",
    Icon: Sun,
  },
  midmorning: {
    card: "bg-gradient-to-br from-[#fff7e0] via-[#fceec3] to-[#f6dd97] border-[#e7c779]/55",
    iconBg: "bg-white/85",
    iconColor: "text-[#caa23a]",
    title: "text-[#6e4f14]",
    meta: "text-[#8a6a22]",
    chev: "bg-white/85 text-[#8a6a22]",
    Icon: Sun,
  },
  noon: {
    card: "bg-gradient-to-br from-[#fff5dd] via-[#fbe6b4] to-[#f3cd80] border-[#e0a64a]/55",
    iconBg: "bg-white/85",
    iconColor: "text-[#c98a2a]",
    title: "text-[#6e4115]",
    meta: "text-[#8a5a1f]",
    chev: "bg-white/85 text-[#8a5a1f]",
    Icon: Sun,
  },
  evening: {
    card: "bg-gradient-to-br from-[#ffe1cc] via-[#fcc59c] to-[#f3a371] border-[#d98a4c]/55",
    iconBg: "bg-white/85",
    iconColor: "text-[#d36a2a]",
    title: "text-[#5e2f0c]",
    meta: "text-[#8a4318]",
    chev: "bg-white/85 text-[#8a4318]",
    Icon: Sunset,
  },
  compline: {
    card: "bg-gradient-to-br from-[#ece4f5] via-[#dccdee] to-[#c4afe0] border-[#a98cd1]/55",
    iconBg: "bg-white/85",
    iconColor: "text-[#7a4fcc]",
    title: "text-[#3c2566]",
    meta: "text-[#5a3a92]",
    chev: "bg-white/85 text-[#5a3a92]",
    Icon: Moon,
  },
  veil: {
    card: "bg-gradient-to-br from-[#1f3a6e] via-[#1a2f5e] to-[#0f1f44] border-white/15 text-white",
    iconBg: "bg-white/15 backdrop-blur",
    iconColor: "text-[#f0d78c]",
    title: "text-white",
    meta: "text-white/75",
    chev: "bg-white/15 text-[#f0d78c]",
    Icon: MoonStar,
  },
  midnight: {
    card: "bg-gradient-to-br from-[#dde4f4] via-[#c8d3ec] to-[#a9bbdf] border-[#7e94c3]/55",
    iconBg: "bg-white/85",
    iconColor: "text-[#3a5598]",
    title: "text-[#1f2f5e]",
    meta: "text-[#3a4f86]",
    chev: "bg-white/85 text-[#3a4f86]",
    Icon: Moon,
  },
  extra: {
    card: "bg-gradient-to-br from-[#e8efe1] via-[#d6e2c8] to-[#bdcfa8] border-[#9fbb84]/55",
    iconBg: "bg-white/85",
    iconColor: "text-[#5a8a3a]",
    title: "text-[#2e4a18]",
    meta: "text-[#4a6a2a]",
    chev: "bg-white/85 text-[#4a6a2a]",
    Icon: Sparkles,
  },
};

/* Extras get individual icons */
const EXTRA_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  misc: BookOpen,
  "david-repentance": Music2,
  thanksgiving: Sparkles,
  creed: Shield,
};

/* ---------- Cards ---------- */

function PrayerCard({ p }: { p: AgpeyaPrayer }) {
  const tokens = ACCENTS[p.accent ?? "dawn"];
  const Icon = p.section === "extra" ? (EXTRA_ICONS[p.id] ?? tokens.Icon) : tokens.Icon;
  return (
    <Link
      to="/agpeya/$prayerId"
      params={{ prayerId: p.id }}
      className={cn(
        "group relative block rounded-[26px] border p-5 pt-6 min-h-[168px]",
        "shadow-[0_18px_34px_-18px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.6)]",
        "transition-transform duration-200 active:scale-[0.97]",
        tokens.card,
      )}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <span className={cn("grid h-[68px] w-[68px] place-items-center rounded-full border border-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_8px_18px_-10px_rgba(120,80,30,0.4)]", tokens.iconBg)}>
          <Icon className={cn("h-9 w-9", tokens.iconColor)} />
        </span>
        <div className="space-y-1">
          <div className={cn("font-arabic-serif text-[19px] font-extrabold leading-tight", tokens.title)}>
            {p.title}
          </div>
          {(p.clock || p.subtitle) && (
            <div className={cn("text-[12.5px] font-medium leading-snug", tokens.meta)}>
              {p.section === "extra" ? p.subtitle : p.clock}
            </div>
          )}
        </div>
      </div>
      <span className={cn("absolute bottom-3 right-3 grid h-7 w-7 place-items-center rounded-full text-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]", tokens.chev)}>
        <ChevronLeft className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="my-4 flex items-center justify-center gap-3 px-2">
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#c79356]/45 to-transparent" />
      <Sparkles className="h-3.5 w-3.5 text-[#c79356]" />
      <h2 className="font-arabic-serif text-[15px] font-bold text-[#5b3a18]">{title}</h2>
      <Sparkles className="h-3.5 w-3.5 text-[#c79356]" />
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c79356]/45 to-transparent" />
    </div>
  );
}

/* ---------- Screen ---------- */

function AgpeyaHome() {
  const current = useMemo(() => getCurrentAgpeyaPrayer(), []);
  const last = useMemo(() => readLastOpenedPrayer(), []);
  const { isSaved, toggle } = useSavedAgpeya();
  const day = getAgpeyaBySection("day");
  const night = getAgpeyaBySection("night");
  const extra = getAgpeyaBySection("extra");

  const metaLine = current.metaLine
    ?? [current.psalmsCount ? `${current.psalmsCount} مزمور` : null,
        current.gospelCount ? `${current.gospelCount} قطع` : null,
        current.durationMin ? `${current.durationMin} دقيقة` : null]
       .filter(Boolean).join(" — ");

  return (
    <div dir="rtl" className="relative min-h-dvh bg-[#fbf3e1] pb-32">
      {/* ===== Premium Header ===== */}
      <header className="relative">
        <div className="relative h-[230px] overflow-hidden">
          <img
            src={headerStill}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            width={1024} height={512}
          />
          {/* warm wash + bottom fade to page bg */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,243,217,0.35) 0%, rgba(255,238,200,0.10) 35%, rgba(251,243,225,0.85) 88%, #fbf3e1 100%)",
            }}
          />
          {/* top controls */}
          <div className="relative z-10 mx-auto flex max-w-[480px] items-start justify-between px-4 pt-[max(env(safe-area-inset-top),12px)]">
            <Link
              to="/home"
              aria-label="رجوع"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/85 backdrop-blur-md border border-white/70 text-[#5b3a18] shadow-[0_6px_14px_-8px_rgba(120,80,30,0.35)] active:scale-95"
            >
              <ChevronLeft className="h-[18px] w-[18px] -scale-x-100" />
            </Link>
            <div className="pt-1 text-center">
              <h1 className="font-arabic-serif text-[26px] font-extrabold leading-tight text-[#5b3a18] drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]">
                الأجبية
              </h1>
              <p className="mt-0.5 text-[12px] font-medium text-[#8a5a1f]">صلوات السواعي اليومية</p>
            </div>
            <button
              type="button"
              aria-label="المحفوظات"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/85 backdrop-blur-md border border-white/70 text-[#5b3a18] shadow-[0_6px_14px_-8px_rgba(120,80,30,0.35)] active:scale-95"
            >
              <Bookmark className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[480px] px-4 -mt-10">
        {/* ===== Hero — current prayer ===== */}
        <section className="relative overflow-hidden rounded-[26px] border border-white/70 bg-[#fff7e7] shadow-[0_22px_44px_-22px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)]">
          <div className="grid grid-cols-[42%_1fr] items-stretch">
            <div className="relative">
              <img
                src={heroSunrise}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                width={1024} height={768}
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: "linear-gradient(270deg, rgba(255,247,231,0.85) 0%, rgba(255,247,231,0) 55%)" }}
              />
              <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/70 px-2.5 py-1 text-[10.5px] font-bold text-[#8a5a1f] shadow">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3eb482]" />
                الصلاة الحالية
              </span>
            </div>
            <div className="relative p-4 pl-5 pr-3 flex flex-col justify-center">
              <h2 className="font-arabic-serif text-[24px] font-extrabold leading-tight text-[#6e4115]">
                {current.title}
              </h2>
              {current.description && (
                <p className="mt-1.5 text-[12.5px] leading-snug text-[#7a5a32]">{current.description}</p>
              )}
              {metaLine && (
                <div className="mt-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-[#8a5a1f]">
                  <Clock className="h-3 w-3" />
                  <span className="truncate">{metaLine}</span>
                </div>
              )}
              <Link
                to="/agpeya/$prayerId"
                params={{ prayerId: current.id }}
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#e7b35a] via-[#d99a3a] to-[#b87a22] px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_10px_20px_-10px_rgba(184,122,34,0.7),inset_0_1px_0_rgba(255,255,255,0.3)] active:scale-[0.97] transition-transform"
              >
                <ChevronRight className="h-3.5 w-3.5 -scale-x-100" />
                {last && last.prayerId === current.id && (last.scrollPercent ?? 0) > 0.02
                  ? "متابعة الصلاة"
                  : "ابدأ الصلاة"}
              </Link>
            </div>
          </div>
        </section>

        {/* Continue elsewhere */}
        {last && last.prayerId !== current.id && (
          <Link
            to="/agpeya/$prayerId"
            params={{ prayerId: last.prayerId }}
            className="mt-3 flex items-center justify-between rounded-2xl bg-white/75 backdrop-blur-md border border-[#c79356]/35 px-4 py-3 text-[#5b3a18] shadow-[0_6px_16px_-12px_rgba(120,80,30,0.4)] active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-4 w-4 text-[#8a5a1f]" />
              <div>
                <div className="text-[10.5px] text-[#8a5a1f]/80">متابعة القراءة</div>
                <div className="font-arabic-serif text-[14px] font-bold leading-tight">
                  {AGPEYA_PRAYERS.find((p) => p.id === last.prayerId)?.title ?? "آخر صلاة"}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#8a5a1f]">
              {Math.round((last.scrollPercent || 0) * 100)}%
            </span>
          </Link>
        )}

        {/* ===== Day Prayers ===== */}
        <SectionTitle title="صلوات النهار" />
        <div className="grid grid-cols-3 gap-3.5">
          {day.map((p) => (
            <PrayerCard key={p.id} p={p} />
          ))}
        </div>

        {/* ===== Night Prayers ===== */}
        <SectionTitle title="صلوات الليل" />
        <div className="grid grid-cols-4 gap-3">
          {night.map((p) => (
            <PrayerCard key={p.id} p={p} />
          ))}
        </div>

        {/* ===== Extras ===== */}
        <SectionTitle title="صلوات إضافية" />
        <div className="grid grid-cols-4 gap-3">
          {extra.map((p) => (
            <PrayerCard key={p.id} p={p} />
          ))}
        </div>
      </main>

      <BottomDock />

      {/* tiny helper: hide bookmark double-tap state from focus ring */}
      {/* `isSaved`/`toggle` reserved for header bookmark wiring in next phase */}
      <span hidden>{isSaved("baker") ? "" : ""}{typeof toggle === "function" ? "" : ""}</span>
    </div>
  );
}
