import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  ScrollText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AlphaDatePicker } from "@/components/controls";
import { BottomDock } from "@/components/bible/BottomDock";
import { AutoScrollControls } from "@/components/bible/AutoScrollControls";
import { GlassSurface } from "@/components/bible/primitives";
import { CopticCross, CopticTitle } from "@/components/coptic";
import { AlphaHeader } from "@/components/navigation/AlphaHeader";
import { NotificationsCenter, type NotificationItem } from "@/components/overlays/NotificationsCenter";
import { KatamerosDateStrip } from "@/features/katameros/components/KatamerosDateStrip";
import { KatamerosScreenBackground } from "@/features/katameros/components/KatamerosScreenBackground";
import { KatamerosPreviewHeaderShell } from "@/features/katameros/components/KatamerosPreviewHeaderShell";
import { useKatamerosCurvePreview } from "@/features/katameros/useKatamerosCurvePreview";
import type { KatamerosCurvePreviewVariant } from "@/features/katameros/katameros-curve-preview";
import katamerosHero from "@/assets/katameros-hero.png";
import katamerosCalendarIcon from "@/assets/katameros-calendar-icon.png";
import {
  KatamerosHeroProgressCard,
  KatamerosNextReadingCard,
  KatamerosReadingIcon,
  KatamerosStatusBadge,
  READING_TONE,
  ReadingProgressColumn,
} from "@/features/katameros/components/KatamerosProgressUI";
import {
  katamerosDayQueryOptionsForDate,
  todayIsoDate,
  useKatamerosProgress,
  type DailyReading,
  type KatamerosDay,
  type ReadingStatus,
} from "@/features/katameros";
import type { ContextualSearchContext } from "@/features/search/contextual-search";
import { cn } from "@/lib/utils";
import { useResolvedTheme } from "@/lib/alpha-theme";
import { useSettings } from "@/features/settings/settings-store";

export const Route = createFileRoute("/katameros/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — القطمارس" },
      { name: "description", content: "قراءات الكنيسة القبطية لليوم: المزمور والإنجيل والبولس والكاثوليكون والإبركسيس." },
    ],
  }),
  component: KatamerosHome,
});

const KATAMEROS_FONT_MIN = 13.5;
const KATAMEROS_FONT_MAX = 25;
const KATAMEROS_FONT_DEFAULT = 15;
const LINE_HEIGHT_STEPS = [1.7, 1.9, 2.05, 2.25] as const;

function KatamerosHeroDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative h-[34px] w-[34px] shrink-0 opacity-50">
      <img
        src={katamerosCalendarIcon}
        alt=""
        className="h-full w-full object-contain drop-shadow-md pointer-events-none"
      />
      <div className="absolute inset-0 overflow-hidden [&_button]:!text-[0px] [&_button_span]:!hidden [&_button_svg]:!hidden">
        <AlphaDatePicker
          value={value}
          onChange={onChange}
          title="اختر تاريخ القطمارس"
          minYear={2025}
          maxYear={2026}
          className="h-full w-full min-h-0 border-0 bg-transparent p-0 text-transparent shadow-none [&_svg]:hidden"
        />
      </div>
    </div>
  );
}

function KatamerosHome() {
  const [selectedIso, setSelectedIso] = useState(todayIsoDate);
  const curvePreview = useKatamerosCurvePreview();
  const { data: day, isPending, isError } = useQuery(katamerosDayQueryOptionsForDate(selectedIso));
  const dayId = day?.id ?? "today";
  const { statusOf, setStatus, lastInProgress } = useKatamerosProgress(dayId);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const readings = day?.readings ?? [];
  const progressPercent = readings.length
    ? Math.round((readings.filter((r) => statusOf(r.id) === "completed").length / readings.length) * 100)
    : 0;

  const handleDateChange = (iso: string) => {
    setSelectedIso(iso);
    setDetailId(null);
  };

  if (isPending) {
    return (
      <KatamerosPageShell searchContext={{ katamerosReadings: [] }} curvePreview={curvePreview}>
        <KatamerosStatusPanel title="جاري تحميل القطمارس..." />
      </KatamerosPageShell>
    );
  }

  if (isError || !day) {
    return (
      <KatamerosPageShell searchContext={{ katamerosReadings: [] }} curvePreview={curvePreview}>
        <KatamerosStatusPanel
          title="لا توجد بيانات قطمارس بعد"
          description="لم يُضَف يوم قطمارس في قاعدة البيانات. بعد إدخال البيانات في Supabase ستظهر قراءات اليوم هنا."
        />
      </KatamerosPageShell>
    );
  }

  const detailReading = detailId ? readings.find((r) => r.id === detailId) ?? null : null;
  const detailIndex = detailReading ? readings.findIndex((r) => r.id === detailReading.id) : -1;

  const continueId = lastInProgress();
  const continueReading = continueId ? readings.find((r) => r.id === continueId) : readings[0] ?? null;

  const notifications: NotificationItem[] =
    readings.length > 0
      ? [
          {
            id: "kat-today",
            title: "قراءات اليوم جاهزة",
            description: `${day.occasion} — ${readings.length} قراءات`,
            time: "اليوم",
            read: false,
            icon: <CopticCross size={14} />,
            onOpen: () => setNotifOpen(false),
          },
        ]
      : [];

  const openReading = (id: string) => {
    if (statusOf(id) === "not-started") setStatus(id, "in-progress");
    setDetailId(id);
  };

  const completeReading = (id: string) => {
    setStatus(id, "completed");
  };

  if (detailReading && detailIndex >= 0) {
    return (
      <KatamerosReadingDetail
        day={day}
        reading={detailReading}
        readings={readings}
        index={detailIndex}
        curvePreview={curvePreview}
        onBack={() => setDetailId(null)}
        onSelect={openReading}
        onComplete={() => {
          completeReading(detailReading.id);
          const next = readings[detailIndex + 1];
          if (next) setDetailId(next.id);
          else setDetailId(null);
        }}
      />
    );
  }

  return (
    <div dir="rtl" className="relative min-h-dvh bg-alpha-base text-alpha">
      <KatamerosScreenBackground previewVariant={curvePreview} />

      <KatamerosPreviewHeaderShell previewVariant={curvePreview}>
        <AlphaHeader
          variant="internal"
          title="القطمارس"
          subtitle="قراءات الكنيسة القبطية لليوم"
          searchScope="katameros"
          searchContext={{ katamerosReadings: readings }}
          center={
            <div className="flex flex-col items-center -mt-1">
              <CopticCross className="text-alpha-gold-deep" size={18} />
              <h1 className="font-arabic-serif text-[20px] font-extrabold text-alpha-heading leading-tight">
                القطمارس
              </h1>
              <p className="text-[10.5px] text-alpha-muted -mt-0.5">قراءات الكنيسة القبطية لليوم</p>
            </div>
          }
        />
      </KatamerosPreviewHeaderShell>

      <main
        className="relative z-10 mx-auto w-full max-w-[var(--alpha-content-narrow-width)] px-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 110px)" }}
      >
        {/* Hero card */}
        <div className="relative mt-3 overflow-hidden rounded-[var(--alpha-radius-card)] border border-white/40 shadow-[var(--alpha-shadow-hero)] min-h-[190px]">
          <div className="absolute inset-0">
            <img src={katamerosHero} alt="" className="h-full w-full object-cover alpha-media-polish" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#3a2a18]/70 via-[#3a2a18]/40 to-[#2a1a08]/80" />
            <div className="absolute inset-0 bg-alpha-gold-deep/10 mix-blend-overlay" />
          </div>

          <div className="relative flex min-h-[190px] flex-col">
            <div className="p-4 pb-3">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="min-w-0 flex-1 text-right">
                  <h2 className="alpha-type-h2 font-arabic-serif text-[#fdfbf7] leading-tight drop-shadow-md line-clamp-2">
                    {day.occasion}
                  </h2>
                  {day.liturgicalDay ? (
                    <p className="alpha-type-caption text-alpha-gold-bright/75 mt-1 drop-shadow-sm line-clamp-1">
                      {day.liturgicalDay}
                    </p>
                  ) : null}
                </div>
                <KatamerosHeroDatePicker value={selectedIso} onChange={handleDateChange} />
              </div>
            </div>

            {continueReading ? (
              <KatamerosHeroProgressCard
                reading={continueReading}
                progressPercent={progressPercent}
                inProgress={statusOf(continueReading.id) === "in-progress"}
                onOpen={() => openReading(continueReading.id)}
              />
            ) : null}
          </div>
        </div>

        {/* Readings list */}
        <CopticTitle>القراءات</CopticTitle>

        <div className="space-y-2.5">
          {readings.length === 0 ? (
            <div className="rounded-2xl bg-alpha-surface/65 backdrop-blur-md border border-alpha/65 p-6 text-center text-[12px] text-alpha-muted shadow-[0_10px_24px_-14px_rgba(120,80,30,0.35),inset_0_1px_0_rgba(255,255,255,0.7)]">
              لا توجد قراءات لهذا اليوم بعد.
            </div>
          ) : (
            readings.map((r) => (
              <ReadingProgressColumn
                key={r.id}
                reading={r}
                status={statusOf(r.id)}
                isActive={continueReading?.id === r.id}
                onOpen={() => openReading(r.id)}
                statusBadge={
                  <KatamerosStatusBadge status={statusOf(r.id)} tone={READING_TONE[r.type]} />
                }
              />
            ))
          )}
        </div>

        {/* Related content */}
        {day.related.length > 0 ? (
          <>
            <CopticTitle>محتوى مرتبط</CopticTitle>
            <div className="grid grid-cols-2 gap-2.5">
              {day.related.map((item) => {
                const tone =
                  item.kind === "synaxarium" ? "#6a4ab5" :
                  item.kind === "feast" ? "#b8423a" :
                  item.kind === "prayer" ? "#3e7a55" : "#3a6a9b";
                const Icon =
                  item.kind === "synaxarium" ? CopticCross :
                  item.kind === "feast" ? Sparkles :
                  item.kind === "prayer" ? BookOpen : ScrollText;
                const content = (
                  <GlassSurface className="p-3 !bg-alpha-surface/65 backdrop-blur-md !border-alpha/65 shadow-[0_10px_24px_-14px_rgba(120,80,30,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] h-full">
                    <div className="flex items-center gap-2">
                      <div
                        className="grid h-8 w-8 place-items-center rounded-lg text-white"
                        style={{ background: tone }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-arabic-serif text-[12.5px] font-extrabold text-alpha-heading leading-tight line-clamp-1">
                          {item.title}
                        </div>
                        {item.subtitle ? (
                          <div className="text-[10.5px] text-alpha-muted mt-0.5 line-clamp-1">{item.subtitle}</div>
                        ) : null}
                      </div>
                    </div>
                  </GlassSurface>
                );
                return item.to ? (
                  <Link key={item.id} to={item.to as any} className="block active:scale-[0.98] transition-transform">
                    {content}
                  </Link>
                ) : (
                  <div key={item.id} className="opacity-90">{content}</div>
                );
              })}
            </div>
          </>
        ) : null}

        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-alpha-gold-deep/70 font-bold tracking-widest">
          <span>Ⲁ</span>
          <span className="h-px w-10 bg-alpha-border" />
          <span>ALPHA · القطمارس</span>
          <span className="h-px w-10 bg-alpha-border" />
          <span>Ⲱ</span>
        </div>
      </main>

      <BottomDock />

      <NotificationsCenter
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        items={notifications}
      />
    </div>
  );
}

function KatamerosReadingDetail({
  day,
  reading,
  readings,
  index,
  curvePreview,
  onBack,
  onSelect,
  onComplete,
}: {
  day: KatamerosDay;
  reading: DailyReading;
  readings: DailyReading[];
  index: number;
  curvePreview?: KatamerosCurvePreviewVariant | null;
  onBack: () => void;
  onSelect: (id: string) => void;
  onComplete: () => void;
}) {
  const { patch } = useSettings();
  const spiritualMode = useResolvedTheme() === "dark";
  const [fontSize, setFontSize] = useState(KATAMEROS_FONT_DEFAULT);
  const [lineHeight, setLineHeight] = useState(LINE_HEIGHT_STEPS[1]);
  const [showNavBar, setShowNavBar] = useState(false);
  const tone = READING_TONE[reading.type];
  const prev = readings[index - 1];
  const next = readings[index + 1];

  useEffect(() => {
    const checkBottom = () => {
      const threshold = 56;
      const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - threshold;
      setShowNavBar(atBottom);
    };

    window.scrollTo(0, 0);
    setShowNavBar(false);

    window.addEventListener("scroll", checkBottom, { passive: true });
    window.addEventListener("resize", checkBottom);
    const raf = requestAnimationFrame(checkBottom);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", checkBottom);
      window.removeEventListener("resize", checkBottom);
    };
  }, [reading.id, reading.body, fontSize, next?.id]);

  return (
    <div dir="rtl" className="relative min-h-dvh bg-alpha-base text-alpha">
      <KatamerosScreenBackground previewVariant={curvePreview} />

      <header
        className={cn(
          "sticky top-0 z-20 border-0 shadow-none pt-[max(env(safe-area-inset-top),8px)] px-4 pb-2",
          curvePreview === "c" ? "bg-[color-mix(in_srgb,var(--alpha-bg-base)_97%,transparent)] backdrop-blur-md" : "bg-transparent",
        )}
      >
        <div className="mx-auto max-w-[var(--alpha-content-narrow-width)] rounded-2xl border border-alpha/65 bg-alpha-surface/80 backdrop-blur-md px-3 py-2.5 shadow-[0_8px_22px_-14px_rgba(120,80,30,0.32),inset_0_1px_0_rgba(255,255,255,0.7)]">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onBack}
              className="grid h-8 w-8 place-items-center rounded-xl border border-alpha/60 bg-alpha-surface/92 text-alpha-heading active:scale-95 transition-transform shadow-[0_2px_8px_-6px_rgba(120,80,30,0.22)]"
              aria-label="رجوع"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1 text-center px-1">
              <div className="font-arabic-serif text-[14px] font-extrabold text-alpha-heading leading-tight line-clamp-1">
                {day.occasion}
              </div>
              <KatamerosDateStrip
                copticDate={day.copticDate}
                gregorianDate={day.gregorianDate}
                variant="detail"
                className="mt-0.5"
              />
            </div>
            <div className="h-8 w-8 shrink-0" aria-hidden />
          </div>
        </div>
      </header>

      <main
        className="relative z-10 mx-auto w-full max-w-[var(--alpha-content-narrow-width)] px-4 pt-2 transition-[padding] duration-300"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 148px)",
        }}
      >
        <GlassSurface className="relative overflow-hidden p-5 !bg-alpha-surface/66 backdrop-blur-md !border-alpha/68 shadow-[0_16px_36px_-16px_rgba(120,80,30,0.42),inset_0_1px_0_rgba(255,255,255,0.75)]">
          <div className="text-center">
            <KatamerosReadingIcon type={reading.type} size="large" className="mb-3 mx-auto" />
            <h1 className="font-arabic-serif text-[20px] font-extrabold leading-tight" style={{ color: tone }}>
              {reading.title}
            </h1>
            <p className="text-[11px] text-alpha-muted mt-1">{reading.source}</p>
            <div className="mt-3 flex items-center gap-2 w-full max-w-[200px] mx-auto">
              <span className="h-px flex-1 bg-alpha-border/80" />
              <CopticCross className="text-alpha-gold-deep" size={12} />
              <span className="h-px flex-1 bg-alpha-border/80" />
            </div>
          </div>

          <p
            className="font-arabic-serif text-alpha-heading whitespace-pre-wrap text-right mt-5"
            style={{ fontSize: `${fontSize}px`, lineHeight }}
          >
            {reading.body || "جاري تحميل نص القراءة..."}
          </p>
        </GlassSurface>

        {next ? (
          <KatamerosNextReadingCard compact reading={next} onOpen={() => onSelect(next.id)} className="mb-3" />
        ) : null}
      </main>

      <AutoScrollControls
        spiritualMode={spiritualMode}
        onToggleSpiritual={() => patch("themeMode", spiritualMode ? "light" : "dark")}
        bottomClass="bottom-[88px]"
        barSize="comfort"
        showAutoscroll={false}
        fontSize={fontSize}
        setFontSize={(n) => setFontSize(Math.max(KATAMEROS_FONT_MIN, Math.min(KATAMEROS_FONT_MAX, n)))}
        fontMin={KATAMEROS_FONT_MIN}
        fontMax={KATAMEROS_FONT_MAX}
        fontStep={1}
        lineHeight={lineHeight}
        setLineHeight={setLineHeight}
        lineHeightSteps={[...LINE_HEIGHT_STEPS]}
      />

      <footer
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 bg-transparent border-0 shadow-none transition-all duration-300 ease-out",
          showNavBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none",
        )}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
      >
        <div className="mx-auto max-w-[var(--alpha-content-narrow-width)] px-4 py-2 pointer-events-auto">
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-alpha/65 bg-alpha-surface/80 backdrop-blur-md px-2.5 py-1.5 shadow-[0_8px_22px_-14px_rgba(120,80,30,0.32),inset_0_1px_0_rgba(255,255,255,0.7)]">
            <button
              type="button"
              disabled={!prev}
              onClick={() => prev && onSelect(prev.id)}
              className="inline-flex items-center gap-0.5 h-8 px-2.5 rounded-xl border border-alpha/60 bg-alpha-surface/92 text-[10.5px] font-bold text-alpha-heading shadow-[0_2px_8px_-6px_rgba(120,80,30,0.22)] disabled:opacity-35 active:scale-95 transition-transform"
            >
              <ChevronRight className="h-3.5 w-3.5" />
              السابق
            </button>
            <span className="text-[10px] font-bold text-alpha-muted px-2 py-1 rounded-lg border border-alpha/45 bg-alpha-surface/70 shrink-0 tabular-nums">
              {index + 1} / {readings.length}
            </span>
            {next ? (
              <button
                type="button"
                onClick={onComplete}
                className="inline-flex items-center gap-0.5 h-8 px-2.5 rounded-xl border border-alpha/60 bg-alpha-surface/92 text-[10.5px] font-bold text-alpha-gold shadow-[0_2px_8px_-6px_rgba(120,80,30,0.22)] active:scale-95 transition-transform"
              >
                التالي
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            ) : (
              <span className="h-8 w-[72px]" aria-hidden />
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function KatamerosPageShell({
  children,
  searchContext,
  curvePreview,
}: {
  children: React.ReactNode;
  searchContext?: ContextualSearchContext;
  curvePreview?: KatamerosCurvePreviewVariant | null;
}) {
  return (
    <div dir="rtl" className="relative min-h-dvh bg-alpha-base text-alpha">
      <KatamerosScreenBackground previewVariant={curvePreview} />
      <KatamerosPreviewHeaderShell previewVariant={curvePreview}>
        <AlphaHeader
          variant="internal"
          title="القطمارس"
          subtitle="قراءات الكنيسة القبطية لليوم"
          searchScope="katameros"
          searchContext={searchContext}
          center={
            <div className="flex flex-col items-center -mt-1">
              <CopticCross className="text-alpha-gold-deep" size={18} />
              <h1 className="font-arabic-serif text-[20px] font-extrabold text-alpha-heading leading-tight">
                القطمارس
              </h1>
              <p className="text-[10.5px] text-alpha-muted -mt-0.5">قراءات الكنيسة القبطية لليوم</p>
            </div>
          }
        />
      </KatamerosPreviewHeaderShell>
      <main
        className="relative z-10 mx-auto w-full max-w-[var(--alpha-content-narrow-width)] px-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 110px)" }}
      >
        {children}
      </main>
      <BottomDock />
    </div>
  );
}

function KatamerosStatusPanel({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mt-8 rounded-3xl border border-alpha/65 bg-alpha-surface/65 backdrop-blur-md p-8 text-center shadow-[0_14px_32px_-16px_rgba(120,80,30,0.38),inset_0_1px_0_rgba(255,255,255,0.72)]">
      <CopticCross className="mx-auto text-alpha-gold-deep" size={28} />
      <h2 className="font-arabic-serif text-[18px] font-extrabold text-alpha-heading mt-4">{title}</h2>
      {description ? (
        <p className="text-[12.5px] text-alpha-muted mt-3 leading-relaxed">{description}</p>
      ) : null}
    </div>
  );
}
