import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { CopticCross, CopticMiniCross } from "@/components/coptic";
import continueBook from "@/features/bible-lavoble/assets/continue-book.jpg";
import { defaultContinueReading } from "@/features/bible-home/data/continueReading";
import { useCurrentSession } from "@/lib/reading-state";
import { bibleV2Tokens } from "../tokens";

function resolveContinueData(session: ReturnType<typeof useCurrentSession>) {
  if (!session) {
    return {
      ...defaultContinueReading,
      reference: "يوحنا 3:16",
      progressPercent: 45,
      bookParam: "John",
      chapter: 3,
    };
  }

  return {
    ...defaultContinueReading,
    reference: `${session.bookName || session.book} ${session.chapter}${session.verse ? `:${session.verse}` : ""}`,
    progressPercent: Math.min(100, Math.max(0, session.progressPercent)),
    bookParam: session.book,
    chapter: session.chapter,
  };
}

function ReadingProgressBar({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="mt-3">
      <div className="mb-2 flex items-center justify-between gap-2 text-[10px] font-bold">
        <span style={{ color: bibleV2Tokens.textMuted }}>تقدم القراءة في هذا الإصحاح</span>
        <span style={{ color: bibleV2Tokens.goldDeep }}>{clamped}%</span>
      </div>
      <div
        className="relative h-2.5 overflow-visible rounded-full border border-[#ead9b1]/90"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(237,224,200,0.75) 100%)",
          boxShadow: "inset 0 1px 3px rgba(120,90,40,0.12)",
        }}
        dir="ltr"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="تقدم القراءة في هذا الإصحاح"
      >
        <div
          className="relative h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${clamped}%`,
            background: `linear-gradient(90deg, ${bibleV2Tokens.goldSoft} 0%, ${bibleV2Tokens.gold} 55%, ${bibleV2Tokens.goldDeep} 100%)`,
            boxShadow: "0 0 10px rgba(212,175,55,0.35), inset 0 1px 0 rgba(255,255,255,0.45)",
          }}
        >
          <span
            aria-hidden
            className="absolute inset-y-0 right-0 w-2 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.85) 0%, transparent 70%)" }}
          />
        </div>
        <span
          aria-hidden
          className="absolute top-1/2 z-10 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-[#f5e6b8] to-[#c49a3a] shadow-[0_2px_8px_rgba(120,80,30,0.35)]"
          style={{ left: `calc(${clamped}% - 10px)` }}
        >
          <CopticMiniCross size={8} className="text-[#5a4010]" />
        </span>
      </div>
    </div>
  );
}

export function BibleV2ContinueReading() {
  const session = useCurrentSession();
  const data = resolveContinueData(session);
  const progress = data.progressPercent;

  const destination = {
    to: "/$book/$chapter" as const,
    params: { book: data.bookParam!, chapter: String(data.chapter) },
  };

  return (
    <section className="relative mx-4 mt-7 mb-1">
      <article
        className="relative overflow-hidden rounded-[28px] border-2 border-[#d4af37]/45 backdrop-blur-sm"
        style={{
          background:
            "linear-gradient(180deg, #fbf3e1 0%, #f5ead8 48%, #f0e4cc 100%)",
          boxShadow: [
            "inset 0 1px 0 rgba(255,255,255,0.95)",
            "inset 0 0 0 1px rgba(255,255,255,0.55)",
            `0 22px 46px -18px ${bibleV2Tokens.shadowCard}`,
            `0 8px 24px -12px ${bibleV2Tokens.shadowWarm}`,
          ].join(", "),
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-3 rounded-[22px] border border-[#d4af37]/18"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 15%, #b8893a 0.5px, transparent 0.6px), radial-gradient(circle at 80% 85%, #b8893a 0.5px, transparent 0.6px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="pointer-events-none absolute left-3 top-3 text-[#b8893a]/35" aria-hidden>
          <CopticMiniCross size={12} />
        </div>
        <div className="pointer-events-none absolute right-3 top-3 text-[#b8893a]/35" aria-hidden>
          <CopticMiniCross size={12} />
        </div>
        <div className="pointer-events-none absolute left-1/2 top-2.5 -translate-x-1/2" aria-hidden>
          <CopticCross size={14} className="text-[#b8893a]/55" />
        </div>

        <div className="relative px-4 pb-4 pt-8">
          <div className="flex items-stretch gap-3" dir="rtl">
            <div className="relative w-[34%] shrink-0 self-center">
              <div
                className="relative mx-auto aspect-[4/5] w-full max-w-[108px]"
                style={{
                  filter: "drop-shadow(0 16px 24px rgba(30,43,84,0.35)) drop-shadow(0 6px 10px rgba(0,0,0,0.18))",
                }}
              >
                <img
                  src={continueBook}
                  alt=""
                  loading="lazy"
                  draggable={false}
                  className="h-full w-full object-contain object-bottom"
                />
              </div>
            </div>

            <div
              className="min-w-0 flex-1 rounded-[20px] border border-[#ead9b1]/80 px-3 py-3 text-right"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.72) 0%, rgba(250,247,242,0.42) 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -8px 16px rgba(120,90,40,0.04)",
              }}
            >
              <h3 className="text-center text-[15px] font-extrabold leading-tight" style={{ color: bibleV2Tokens.navy }}>
                استمر في القراءة
              </h3>

              <div className="mt-2 flex items-center justify-center gap-1.5">
                <span className="h-1 w-1 rotate-45 rounded-[1px] bg-[#d4af37]/70" aria-hidden />
                <p className="text-[13px] font-extrabold tracking-tight" style={{ color: bibleV2Tokens.navy }}>
                  {data.reference}
                </p>
                <span className="h-1 w-1 rotate-45 rounded-[1px] bg-[#d4af37]/70" aria-hidden />
              </div>

              <p className="mt-2 line-clamp-3 text-[10.5px] leading-[1.75] text-[#4a3a24]/90">
                {data.preview}
              </p>
            </div>
          </div>

          <ReadingProgressBar value={progress} />

          <Link
            {...destination}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-white transition active:scale-[0.98]"
            style={{
              background: `linear-gradient(180deg, ${bibleV2Tokens.navySoft} 0%, ${bibleV2Tokens.navy} 100%)`,
              boxShadow: "0 10px 24px -8px rgba(30,43,84,0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
            aria-label={`${data.ctaLabel} — ${data.reference}`}
          >
            <ChevronLeft className="h-4 w-4 shrink-0 opacity-90" />
            <span className="text-[13px] font-bold">{data.ctaLabel}</span>
            <CopticCross size={14} className="shrink-0 text-[#d4af37]" />
          </Link>
        </div>
      </article>
    </section>
  );
}
