import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronLeft, Sparkles } from "lucide-react";
import readingHero from "@/assets/home/art-readings.jpg";
import { CopticCross } from "@/components/coptic";
import { useCurrentSession } from "@/lib/reading-state";
import { continueReadingDestination, resolveContinueReadingView } from "@/lib/continue-reading-nav";
import { bibleV2Tokens } from "../tokens";

function ContinueReadingStyles() {
  return (
    <style>{`
      @keyframes continueGlowPulse {
        0%, 100% { opacity: 0.45; transform: scale(1); }
        50% { opacity: 0.72; transform: scale(1.06); }
      }
      @keyframes continueShimmer {
        0% { transform: translateX(-120%) skewX(-12deg); }
        100% { transform: translateX(220%) skewX(-12deg); }
      }
      .continue-glass-glow { animation: continueGlowPulse 5s ease-in-out infinite; }
      .continue-glass-shimmer::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.28) 50%, transparent 60%);
        animation: continueShimmer 7s ease-in-out infinite;
        pointer-events: none;
      }
    `}</style>
  );
}

function ProgressRing({ value, size = 62 }: { value: number; size?: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  const stroke = 4.5;
  const radius = (size - stroke * 2) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id="continueRingGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={bibleV2Tokens.goldSoft} />
            <stop offset="55%" stopColor={bibleV2Tokens.gold} />
            <stop offset="100%" stopColor={bibleV2Tokens.goldDeep} />
          </linearGradient>
          <filter id="continueRingGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={stroke}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#continueRingGold)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#continueRingGlow)"
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-[13px] font-black tabular-nums text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]">
          {clamped}%
        </span>
      </div>
    </div>
  );
}

function LuminousProgressBar({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="mt-4" dir="ltr">
      <div
        className="relative h-1.5 overflow-hidden rounded-full"
        style={{
          background: "rgba(255,255,255,0.18)",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.12)",
        }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="تقدم القراءة في هذا الإصحاح"
      >
        <div
          className="relative h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${clamped}%`,
            background: `linear-gradient(90deg, ${bibleV2Tokens.goldSoft} 0%, ${bibleV2Tokens.gold} 50%, ${bibleV2Tokens.goldDeep} 100%)`,
            boxShadow: "0 0 14px rgba(212,175,55,0.55), inset 0 1px 0 rgba(255,255,255,0.5)",
          }}
        />
        <span
          aria-hidden
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border border-white/80 bg-[#f5e6b8] shadow-[0_0_10px_rgba(212,175,55,0.8)]"
          style={{ left: `calc(${clamped}% - 5px)` }}
        />
      </div>
    </div>
  );
}

export function BibleV2ContinueReading({ placement = "hero" }: { placement?: "hero" | "footer" }) {
  const session = useCurrentSession();
  const data = resolveContinueReadingView(session);
  const destination = continueReadingDestination(data, { booksRoute: "/books" });
  const sectionClass = placement === "hero" ? "relative mx-4 mt-2" : "relative mx-4 mt-7 mb-1";

  return (
    <section className={sectionClass} dir="rtl">
      <ContinueReadingStyles />

      <Link
        {...destination}
        className="group relative block overflow-hidden rounded-[32px] transition duration-300 active:scale-[0.985]"
        style={{
          boxShadow: [
            "0 0 0 1px rgba(255,255,255,0.35)",
            "0 28px 56px -22px rgba(30,43,84,0.38)",
            "0 12px 28px -14px rgba(212,175,55,0.22)",
            "inset 0 1px 0 rgba(255,255,255,0.25)",
          ].join(", "),
        }}
        aria-label={`${data.ctaLabel} — ${data.reference}`}
      >
        <img
          src={readingHero}
          alt=""
          loading="eager"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover object-[center_30%] transition duration-700 group-hover:scale-[1.04]"
        />

        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(165deg, rgba(30,43,84,0.15) 0%, rgba(20,28,52,0.55) 42%, rgba(12,18,38,0.82) 100%)",
          }}
        />

        <span
          aria-hidden
          className="continue-glass-glow pointer-events-none absolute -left-8 top-6 h-32 w-32 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.42) 0%, transparent 70%)" }}
        />
        <span
          aria-hidden
          className="continue-glass-glow pointer-events-none absolute -right-6 bottom-10 h-28 w-28 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(143,180,255,0.28) 0%, transparent 70%)",
            animationDelay: "2.5s",
          }}
        />

        <div className="continue-glass-shimmer relative m-3 overflow-hidden rounded-[26px] border border-white/30 p-4 backdrop-blur-2xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0.14) 100%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-4 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)" }}
          />

          <div className="relative flex items-start gap-3.5">
            <ProgressRing value={data.progressPercent} />

            <div className="min-w-0 flex-1 pt-0.5 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#f5e6b8]/90" strokeWidth={2.2} />
                <span className="text-[10px] font-bold tracking-[0.12em] text-white/75">
                  استمر من حيث توقفت
                </span>
              </div>

              <h3 className="mt-1.5 font-arabic-serif text-[19px] font-extrabold leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
                {data.reference}
              </h3>

              <p className="mt-2 line-clamp-2 text-[11px] leading-[1.85] text-white/78">
                {data.preview}
              </p>
            </div>
          </div>

          <LuminousProgressBar value={data.progressPercent} />

          <div
            className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/25 px-3.5 py-2.5"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
            }}
          >
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white/90">
              <BookOpen className="h-4 w-4 text-[#f5e6b8]" strokeWidth={2.2} />
              {data.ctaLabel}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold text-white transition group-hover:gap-2"
              style={{
                background: `linear-gradient(135deg, ${bibleV2Tokens.gold} 0%, ${bibleV2Tokens.goldDeep} 100%)`,
                boxShadow: "0 6px 18px -4px rgba(212,175,55,0.55), inset 0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              اقرأ الآن
              <ChevronLeft className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2" aria-hidden>
          <CopticCross size={13} className="text-white/45 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
        </div>
      </Link>
    </section>
  );
}
