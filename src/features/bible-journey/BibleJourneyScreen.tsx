import { Link } from "@tanstack/react-router";
import { Flame, ScrollText } from "lucide-react";
import { useEffect, useRef } from "react";
import { BackButton, BottomDock } from "@/components/bible";
import { hasContinueReadingTarget, resolveContinueReadingView } from "@/lib/continue-reading-nav";
import { useCurrentSession } from "@/lib/reading-state";
import { cn } from "@/lib/utils";
import type { BookJourneyItem } from "./journey-engine";
import { JourneyHeroCard } from "./JourneyHeroCard";
import { BOOK_STATUS_META, JOURNEY } from "./journey-tokens";
import { useBibleJourney } from "./useBibleJourney";

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold" style={{ color: JOURNEY.textMuted }}>
          {label}
        </span>
        <span className="text-[12px] font-extrabold tabular-nums" style={{ color: JOURNEY.goldDeep }}>
          {value}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: JOURNEY.beigeDeep }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            background: `linear-gradient(90deg, ${JOURNEY.goldSoft}, ${JOURNEY.gold})`,
          }}
        />
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="rounded-2xl border px-3 py-3 text-center"
      style={{ borderColor: JOURNEY.cardBorder, background: JOURNEY.card }}
    >
      <p className="text-[18px] font-extrabold tabular-nums" style={{ color: JOURNEY.goldDeep }}>
        {value}
      </p>
      <p className="mt-1 text-[10px] font-bold leading-snug" style={{ color: JOURNEY.textMuted }}>
        {label}
      </p>
    </div>
  );
}

function BookMapChip({ item }: { item: BookJourneyItem }) {
  const meta = BOOK_STATUS_META[item.status];
  const bg =
    item.status === "complete"
      ? JOURNEY.completeBg
      : item.status === "in-progress"
        ? JOURNEY.inProgressBg
        : JOURNEY.idleBg;
  const border =
    item.status === "complete"
      ? `${JOURNEY.goldSoft}88`
      : item.status === "in-progress"
        ? `${JOURNEY.purple}55`
        : JOURNEY.cardBorder;

  return (
    <Link
      to="/$book"
      params={{ book: item.book }}
      className="block rounded-xl border px-2 py-2 text-right transition active:scale-[0.98]"
      style={{ borderColor: border, background: bg }}
    >
      <p className="line-clamp-2 min-h-[2.4em] text-[10px] font-extrabold leading-snug" style={{ color: JOURNEY.text }}>
        {item.bookName}
      </p>
      <p className="mt-1 text-[9px] font-bold" style={{ color: JOURNEY.textMuted }}>
        {meta.emoji} {item.progressPercent}%
      </p>
    </Link>
  );
}

function BookMapSection({ title, books }: { title: string; books: BookJourneyItem[] }) {
  if (!books.length) return null;
  return (
    <section className="mt-5">
      <h2 className="mb-2 text-[13px] font-extrabold" style={{ color: JOURNEY.text }}>
        {title}
      </h2>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {books.map((item) => (
          <BookMapChip key={item.book} item={item} />
        ))}
      </div>
    </section>
  );
}

export function BibleJourneyScreen({
  backTo = "/bible",
  fromBible2 = false,
}: {
  backTo?: string;
  fromBible2?: boolean;
}) {
  const { snapshot, isLoading } = useBibleJourney();
  const session = useCurrentSession();
  const continueView = resolveContinueReadingView(session);
  const heroAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const frame = requestAnimationFrame(() => {
      heroAnchorRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <main dir="rtl" className="relative min-h-[100dvh] pb-36" style={{ background: JOURNEY.beige, color: JOURNEY.text }}>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-48 opacity-40"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${JOURNEY.goldSoft}55, transparent 70%)` }}
        aria-hidden
      />

      <header
        className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur-md"
        style={{ borderColor: JOURNEY.cardBorder, background: "rgba(244,234,216,0.92)" }}
      >
        <BackButton to={backTo} compact />
        <div className="text-center">
          <p className="text-[10px] font-bold tracking-wide" style={{ color: JOURNEY.beigeMuted }}>
            ✦ ALPHA BIBLE ✦
          </p>
          <h1 className="font-arabic-serif text-[16px] font-extrabold">رحلتي مع الكتاب المقدس</h1>
        </div>
        <div className="w-9" aria-hidden />
      </header>

      <div ref={heroAnchorRef} className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] scroll-mt-[72px] px-4 pt-3">
        {isLoading || !snapshot ? (
          <p className="py-16 text-center text-[13px]" style={{ color: JOURNEY.textMuted }}>
            جاري تحميل رحلتك…
          </p>
        ) : (
          <>
            {hasContinueReadingTarget(continueView) ? (
              <JourneyHeroCard
                snapshot={snapshot}
                continueBook={continueView.bookParam!}
                continueChapter={continueView.chapter!}
                continueLabel={continueView.ctaLabel}
              />
            ) : null}

            <section className="mt-5 rounded-[22px] border p-4" style={{ borderColor: JOURNEY.cardBorder, background: JOURNEY.card }}>
              <h2 className="mb-3 text-[13px] font-extrabold">نسبة الإنجاز</h2>
              <div className="space-y-3">
                <ProgressBar label="العهد القديم" value={snapshot.otPercent} />
                <ProgressBar label="العهد الجديد" value={snapshot.ntPercent} />
                <ProgressBar label="الكتاب المقدس بالكامل" value={snapshot.biblePercent} />
              </div>
            </section>

            <section
              className="mt-5 grid grid-cols-3 gap-2 rounded-[22px] border p-4"
              style={{ borderColor: JOURNEY.cardBorder, background: JOURNEY.card }}
            >
              <StatTile label="أيام متتالية" value={snapshot.streak.currentStreak} />
              <StatTile label="آخر قراءة" value={snapshot.streak.lastReadLabel} />
              <StatTile label="أطول سلسلة" value={snapshot.streak.longestStreak} />
            </section>

            <section className="mt-5">
              <h2 className="mb-2 text-[13px] font-extrabold">إحصائيات روحية</h2>
              <div className="grid grid-cols-2 gap-2">
                <StatTile label="آيات مقروءة (تقريبي)" value={snapshot.stats.versesRead} />
                <StatTile label="أصحاحات مكتملة" value={snapshot.stats.chaptersCompleted} />
                <StatTile label="آيات محفوظة" value={snapshot.stats.savedVerses} />
                <StatTile label="ملاحظات مكتوبة" value={snapshot.stats.notesCount} />
              </div>
            </section>

            <section className="mt-5 rounded-[22px] border p-4" style={{ borderColor: JOURNEY.cardBorder, background: JOURNEY.card }}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h2 className="text-[13px] font-extrabold">خريطة الأسفار</h2>
                <div className="mr-auto flex flex-wrap gap-1.5">
                  {Object.values(BOOK_STATUS_META).map((m) => (
                    <span
                      key={m.tone}
                      className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold")}
                      style={{
                        background:
                          m.tone === "complete"
                            ? JOURNEY.completeBg
                            : m.tone === "in-progress"
                              ? JOURNEY.inProgressBg
                              : JOURNEY.idleBg,
                        color: JOURNEY.textMuted,
                      }}
                    >
                      {m.emoji} {m.label}
                    </span>
                  ))}
                </div>
              </div>
              <BookMapSection title="العهد القديم" books={snapshot.otBooks} />
              <BookMapSection title="العهد الجديد" books={snapshot.ntBooks} />
            </section>

            <section
              className="mt-5 rounded-[22px] border p-4"
              style={{ borderColor: JOURNEY.cardBorder, background: JOURNEY.card }}
            >
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4" style={{ color: JOURNEY.purple }} />
                <h2 className="text-[13px] font-extrabold">الخطط النشطة</h2>
              </div>
              <p className="mt-3 text-[12px] leading-relaxed" style={{ color: JOURNEY.textMuted }}>
                لا توجد خطة قراءة نشطة حالياً. تابع القراءة يومياً — رحلتك تُسجَّل تلقائياً أثناء مطالعة
                الأصحاح.
              </p>
            </section>

            <p className="mt-6 pb-2 text-center text-[10px] leading-relaxed" style={{ color: JOURNEY.textMuted }}>
              <Flame className="mx-auto mb-1 h-3.5 w-3.5 opacity-60" />
              رحلة هادئة — بدون شارات أو ألعاب. فقط تقدّمك الحقيقي مع كلمة الله.
            </p>
          </>
        )}
      </div>

      <BottomDock />
    </main>
  );
}
