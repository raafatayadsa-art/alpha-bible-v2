import { Link } from "@tanstack/react-router";
import { BookOpen, Sparkles } from "lucide-react";
import { HeroBadgeEmblem } from "@/components/home/hero-card-chrome";
import { CopticMiniCross } from "@/components/coptic";
import oldTestamentRef from "@/features/bible-v2/assets/old-testament-ref.jpg";
import type { BibleJourneySnapshot } from "./journey-engine";
import { JOURNEY } from "./journey-tokens";

function JourneyHeroStyles() {
  return (
    <style>{`
      @keyframes journeyHeroGlow {
        0%, 100% {
          box-shadow:
            0 0 0 1px rgba(231,201,122,0.18),
            0 8px 28px -12px rgba(120,80,30,0.45),
            0 0 24px rgba(231,201,122,0.12);
        }
        50% {
          box-shadow:
            0 0 0 1px rgba(231,201,122,0.38),
            0 12px 36px -10px rgba(120,80,30,0.55),
            0 0 40px rgba(231,201,122,0.28);
        }
      }
      @keyframes journeyHeroRingBreathe {
        0%, 100% { opacity: 0.45; transform: scale(1); }
        50% { opacity: 0.85; transform: scale(1.015); }
      }
      @keyframes journeyCtaPulseRing {
        0% { transform: scale(1); opacity: 0.55; }
        100% { transform: scale(1.28); opacity: 0; }
      }
      @keyframes journeyCtaGlow {
        0%, 100% {
          box-shadow:
            0 0 0 1px rgba(231,201,122,0.25),
            0 4px 16px -4px rgba(199,147,86,0.55),
            0 0 18px rgba(231,201,122,0.22),
            inset 0 1px 0 rgba(255,255,255,0.45);
        }
        50% {
          box-shadow:
            0 0 0 1px rgba(240,215,140,0.45),
            0 6px 22px -4px rgba(199,147,86,0.65),
            0 0 32px rgba(231,201,122,0.42),
            inset 0 1px 0 rgba(255,255,255,0.55);
        }
      }
      @keyframes journeyHeroCardIn {
        from { opacity: 0; transform: translateY(10px) scale(0.985); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .journey-hero-card {
        animation: journeyHeroCardIn 0.45s cubic-bezier(0.32, 0.72, 0, 1) both;
      }
      .journey-hero-shell {
        animation: journeyHeroGlow 3.2s ease-in-out infinite;
      }
      .journey-hero-glow-ring {
        animation: journeyHeroRingBreathe 2.6s ease-in-out infinite;
      }
      .journey-cta-wrap {
        position: relative;
        display: block;
      }
      .journey-cta-wrap::before,
      .journey-cta-wrap::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 14px;
        border: 1.5px solid rgba(231,201,122,0.42);
        pointer-events: none;
        animation: journeyCtaPulseRing 2.4s ease-out infinite;
      }
      .journey-cta-wrap::after {
        animation-delay: 1.2s;
      }
      .journey-cta-btn {
        animation: journeyCtaGlow 2.4s ease-in-out infinite;
      }
    `}</style>
  );
}

function ProgressRing({ percent, size = 52 }: { percent: number; size?: number }) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, percent)) / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#journeyRingGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="journeyRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={JOURNEY.goldSoft} />
            <stop offset="100%" stopColor={JOURNEY.gold} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-[11px] font-extrabold tabular-nums text-white" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
          {percent}%
        </span>
      </div>
    </div>
  );
}

function JourneyContinueButton({
  bookParam,
  chapter,
  label,
  isFreshStart,
}: {
  bookParam: string;
  chapter: number;
  label: string;
  isFreshStart?: boolean;
}) {
  return (
    <div className="journey-cta-wrap mt-3">
      <Link
        to="/$book/$chapter"
        params={{ book: bookParam, chapter: String(chapter) }}
        search={{}}
        className="journey-cta-btn relative z-[1] flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#efe2c4]/80 px-4 py-2.5 text-[12px] font-extrabold transition active:scale-[0.98]"
        style={{
          background: "linear-gradient(180deg, #fff4d4 0%, #e7c07a 48%, #c79356 100%)",
          color: JOURNEY.goldDeep,
        }}
      >
        {isFreshStart ? <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} /> : <BookOpen className="h-3.5 w-3.5" strokeWidth={2.2} />}
        {label}
      </Link>
    </div>
  );
}

export function JourneyHeroCard({
  snapshot,
  continueBook,
  continueChapter,
  continueLabel,
}: {
  snapshot: BibleJourneySnapshot;
  continueBook: string;
  continueChapter: number;
  continueLabel: string;
}) {
  const isFreshStart = snapshot.biblePercent === 0 && snapshot.stats.chaptersCompleted === 0;
  const accent = isFreshStart ? JOURNEY.purpleSoft : JOURNEY.goldSoft;

  return (
    <>
      <JourneyHeroStyles />
      <section
        id="journey-hero-card"
        className="journey-hero-card journey-hero-shell relative overflow-hidden rounded-[22px] border"
        style={{ borderColor: `${accent}44` }}
      >
        <img
          src={oldTestamentRef}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ filter: "brightness(0.38) saturate(1.15)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(58,42,24,0.72) 0%, rgba(20,14,8,0.55) 45%, rgba(12,8,4,0.88) 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse 70% 55% at 85% 15%, ${accent}55 0%, transparent 65%)`,
          }}
        />
        <div
          aria-hidden
          className="journey-hero-glow-ring pointer-events-none absolute inset-[1px] rounded-[21px] ring-1 ring-inset ring-white/10"
        />

        <div className="relative z-10 p-3.5">
          <div className="flex items-start gap-3">
            <ProgressRing percent={snapshot.biblePercent} />

            <div className="min-w-0 flex-1 text-right">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold tracking-wide text-white/55">
                    {isFreshStart ? "✦ بداية رحلتك ✦" : "✦ كارت الرحلة ✦"}
                  </p>
                  <p
                    className="mt-0.5 font-arabic-serif text-[17px] font-extrabold leading-tight tabular-nums text-white"
                    style={{ textShadow: "0 2px 12px rgba(0,0,0,0.65)" }}
                  >
                    {snapshot.completedBooks}
                    <span className="mx-1 text-[12px] font-bold text-white/70">/</span>
                    {snapshot.totalBooks}
                    <span className="mr-1 text-[11px] font-bold text-white/75">سفر</span>
                  </p>
                </div>
                <div
                  className="inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 backdrop-blur-md"
                  style={{ borderColor: `${accent}44`, background: "rgba(0,0,0,0.35)" }}
                >
                  <HeroBadgeEmblem label={isFreshStart ? "ابدأ" : "رحلة"} compact />
                </div>
              </div>

              {isFreshStart ? (
                <p className="mt-2 text-[11px] font-medium leading-relaxed text-white/72">
                  <CopticMiniCross className="ml-1 inline h-3 w-3 opacity-70" />
                  خطوة واحدة تفصلك عن أول إصحاح — رحلتك تُسجَّل تلقائياً.
                </p>
              ) : (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                  <span
                    className="rounded-lg border px-2 py-1 backdrop-blur-sm"
                    style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.88)" }}
                  >
                    {snapshot.currentBookName ?? "—"}
                  </span>
                  <span className="text-white/35">·</span>
                  <span className="tabular-nums text-white/65">
                    إ{snapshot.currentChapter ?? "—"} · {Math.round(snapshot.currentProgress)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <JourneyContinueButton
            bookParam={continueBook}
            chapter={continueChapter}
            label={isFreshStart ? "ابدأ رحلتك" : continueLabel}
            isFreshStart={isFreshStart}
          />
        </div>
      </section>
    </>
  );
}
