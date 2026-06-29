import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Bookmark, Clock, BookOpen, ChevronRight, Sun, Sunset, Moon, MoonStar, Sparkles, Music2, Shield, X } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import {
  AGPEYA_PRAYERS,
  clearLastOpenedPrayer,
  getAgpeyaBySection,
  getCurrentAgpeyaPrayer,
  readLastOpenedPrayer,
  useSavedAgpeya,
} from "@/features/agpeya";
import type { AgpeyaPrayer } from "@/features/agpeya";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";
import { cn } from "@/lib/utils";
import headerStill from "@/assets/agpeya/header-still.jpg";
import heroSunrise from "@/assets/agpeya/hero-sunrise.jpg";

export const Route = createFileRoute("/agpeya/")({
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
    iconColor: "text-alpha-gold-deep",
    title: "text-alpha-gold-deep",
    meta: "text-alpha-gold-deep/85",
    chev: "bg-white/85 text-alpha-gold-deep",
    Icon: Sun,
  },
  midmorning: {
    card: "bg-gradient-to-br from-[#fff7e0] via-[#fceec3] to-[#f6dd97] border-[#e7c779]/55",
    iconBg: "bg-white/85",
    iconColor: "text-alpha-gold-bright",
    title: "text-alpha-gold-deep",
    meta: "text-alpha-gold-deep/85",
    chev: "bg-white/85 text-alpha-gold-deep",
    Icon: Sun,
  },
  noon: {
    card: "bg-gradient-to-br from-[#fff5dd] via-[#fbe6b4] to-[#f3cd80] border-[#e0a64a]/55",
    iconBg: "bg-white/85",
    iconColor: "text-alpha-gold",
    title: "text-alpha-gold-deep",
    meta: "text-alpha-gold-deep/85",
    chev: "bg-white/85 text-alpha-gold-deep",
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
    iconColor: "text-[var(--alpha-purple)]",
    title: "text-[var(--alpha-purple)]",
    meta: "text-[color-mix(in_srgb,var(--alpha-purple)_75%,var(--alpha-text-muted))]",
    chev: "bg-white/85 text-[var(--alpha-purple)]",
    Icon: Moon,
  },
  veil: {
    card: "bg-gradient-to-br from-[#1f3a6e] via-[#1a2f5e] to-[#0f1f44] border-white/15 text-white",
    iconBg: "bg-white/15 backdrop-blur",
    iconColor: "text-alpha-gold-bright",
    title: "text-white",
    meta: "text-white/75",
    chev: "bg-white/15 text-alpha-gold-bright",
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
        "group relative block rounded-[var(--alpha-radius-card)] border p-5 pt-6 min-h-[168px]",
        "shadow-[var(--alpha-shadow-featured),inset_0_1px_0_rgba(255,255,255,0.6)]",
        "alpha-motion-spring active:scale-[0.97]",
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
    <div className="mt-6 mb-3 flex items-center gap-2 px-1" aria-hidden={false}>
      <span className="text-alpha-gold-deep/65 alpha-type-body font-bold leading-none" aria-hidden>Ⲁ</span>
      <h2 className="alpha-type-h2 font-arabic-serif text-alpha-heading">{title}</h2>
      <span className="h-px flex-1 bg-alpha-border" aria-hidden />
      <span className="text-alpha-gold-deep/65 alpha-type-body font-bold leading-none" aria-hidden>Ⲱ</span>
    </div>
  );
}

/* ---------- Screen ---------- */

function AgpeyaHome() {
  const router = useRouter();
  const current = useMemo(() => getCurrentAgpeyaPrayer(), []);
  const [last, setLast] = useState(() => readLastOpenedPrayer());
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setLast(readLastOpenedPrayer()); setHydrated(true); }, []);
  const { saved } = useSavedAgpeya();

  const goBack = () => {
    const idx =
      typeof window !== "undefined"
        ? (((window.history.state as Record<string, unknown>)?.idx as number) ?? 0)
        : 0;
    if (idx > 0) { router.history.back(); return; }
    void router.navigate({ to: "/home" });
  };
  const day = getAgpeyaBySection("day");
  const night = getAgpeyaBySection("night");
  const extra = getAgpeyaBySection("extra");

  const metaLine = current.metaLine
    ?? [current.psalmsCount ? `${current.psalmsCount} مزمور` : null,
        current.gospelCount ? `${current.gospelCount} قطع` : null,
        current.durationMin ? `${current.durationMin} دقيقة` : null]
       .filter(Boolean).join(" — ");

  return (
    <div dir="rtl" className="relative min-h-dvh bg-alpha-base text-alpha pb-32">
      <CopticWatermark />
      {/* ===== Premium Header ===== */}
      <header className="relative">
        <div className="relative h-[230px] overflow-hidden">
          <img
            src={headerStill}
            alt=""
            className="absolute inset-0 h-full w-full object-cover alpha-media-polish"
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
          <div className="relative z-10 mx-auto flex max-w-[var(--alpha-content-max-width)] items-start justify-between px-4 pt-[max(env(safe-area-inset-top),12px)]">
            <button
              type="button"
              onClick={goBack}
              aria-label="رجوع"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/85 backdrop-blur-md border border-white/70 text-alpha-heading shadow-[var(--alpha-shadow-mini)] active:scale-95 alpha-motion-spring"
            >
              <ChevronLeft className="h-[18px] w-[18px] -scale-x-100" />
            </button>
            <div className="pt-1 text-center">
              <h1 className="font-arabic-serif text-[26px] font-extrabold leading-tight text-alpha-heading drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]">
                الأجبية
              </h1>
              <p className="alpha-type-desc mt-0.5 font-medium text-alpha-gold-deep">صلوات السواعي اليومية</p>
            </div>
            <Link
              to="/agpeya/saved"
              aria-label="المحفوظات"
              className="relative grid h-10 w-10 place-items-center rounded-full bg-white/85 backdrop-blur-md border border-white/70 text-alpha-heading shadow-[var(--alpha-shadow-mini)] active:scale-95"
            >
              <Bookmark className="h-[18px] w-[18px]" />
              {saved.length > 0 && (
                <span className="absolute -top-1 -left-1 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-alpha-gold-deep alpha-type-caption font-bold text-white">
                  {saved.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[var(--alpha-content-max-width)] px-4 -mt-10">
        {/* ===== Hero — current prayer ===== */}
        <section className="alpha-card-featured relative overflow-hidden !p-0 border border-white/70 bg-[color-mix(in_srgb,var(--alpha-bg-elevated)_95%,#fff7e7)]">
          <div className="grid grid-cols-[42%_1fr] items-stretch">
            <div className="relative">
              <img
                src={heroSunrise}
                alt=""
                className="absolute inset-0 h-full w-full object-cover alpha-media-polish"
                width={1024} height={768}
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: "linear-gradient(270deg, rgba(255,247,231,0.85) 0%, rgba(255,247,231,0) 55%)" }}
              />
              <span className="alpha-tag absolute top-3 right-3 inline-flex items-center gap-1.5 backdrop-blur-md border border-white/70 bg-white/90 !text-alpha-gold-deep shadow">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3eb482]" />
                الصلاة الحالية
              </span>
            </div>
            <div className="relative p-4 pl-5 pr-3 flex flex-col justify-center">
              <h2 className="alpha-type-h1 font-arabic-serif leading-tight text-alpha-gold-deep">
                {current.title}
              </h2>
              {current.description && (
                <p className="alpha-type-desc mt-1.5 leading-snug text-alpha-muted">{current.description}</p>
              )}
              {metaLine && (
                <div className="alpha-type-desc mt-2 flex items-center gap-1.5 font-semibold text-alpha-gold-deep">
                  <Clock className="h-3 w-3" />
                  <span className="truncate">{metaLine}</span>
                </div>
              )}
              <Link
                to="/agpeya/$prayerId"
                params={{ prayerId: current.id }}
                className="alpha-btn-primary mt-3 inline-flex items-center justify-center gap-2 !min-h-0 px-4 py-2.5 alpha-type-body active:scale-[0.97] alpha-motion-spring"
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
        {hydrated && last && last.prayerId !== current.id && (
          <div className="mt-3 flex items-stretch gap-2">
            <Link
              to="/agpeya/$prayerId"
              params={{ prayerId: last.prayerId }}
              className="flex flex-1 items-center justify-between rounded-[var(--alpha-radius-dock-tab)] bg-white/75 backdrop-blur-md border border-alpha-gold-deep/35 px-4 py-3 text-alpha-heading shadow-[var(--alpha-shadow-mini)] active:scale-[0.98] alpha-motion-spring"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <BookOpen className="h-4 w-4 text-alpha-gold-deep shrink-0" />
                <div className="min-w-0">
                  <div className="alpha-type-desc text-alpha-gold-deep/80">متابعة القراءة</div>
                  <div className="alpha-type-h2 font-arabic-serif leading-tight truncate">
                    {AGPEYA_PRAYERS.find((p) => p.id === last.prayerId)?.title ?? "آخر صلاة"}
                  </div>
                </div>
              </div>
              <span className="alpha-type-desc font-semibold text-alpha-gold-deep shrink-0">
                {Math.round((last.scrollPercent || 0) * 100)}%
              </span>
            </Link>
            <button
              type="button"
              aria-label="إخفاء متابعة القراءة"
              onClick={() => { clearLastOpenedPrayer(); setLast(null); }}
              className="grid w-9 place-items-center rounded-[var(--alpha-radius-dock-tab)] border border-alpha-gold-deep/35 bg-white/60 text-alpha-gold-deep active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
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

    </div>
  );
}
