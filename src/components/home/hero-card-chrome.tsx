import { useState, type MouseEvent } from "react";
import { Bookmark, Share2 } from "lucide-react";

export const HERO_STACK_LABELS = ["آية اليوم", "القطمارس", "قديس اليوم", "مناسبة"] as const;

const HERO_GOLD = "#f0d78c";
const HERO_GOLD_BRIGHT = "#ffd86a";

function HeroLedgerStyles() {
  return (
    <style>{`
      @keyframes heroLedgerPulseRing {
        0% {
          transform: scale(1);
          opacity: 0.55;
        }
        100% {
          transform: scale(1.32);
          opacity: 0;
        }
      }
      @keyframes heroLedgerBroadcastGlow {
        0%, 100% {
          box-shadow:
            0 0 0 1px rgba(240,215,140,0.1),
            0 0 16px rgba(240,215,140,0.14),
            inset 0 0 24px rgba(240,215,140,0.06);
        }
        50% {
          box-shadow:
            0 0 0 1px rgba(240,215,140,0.24),
            0 0 28px rgba(240,215,140,0.36),
            inset 0 0 32px rgba(240,215,140,0.12);
        }
      }
      @keyframes heroLedgerGlyphShimmer {
        0%, 100% {
          opacity: 0.92;
          text-shadow: 0 0 8px rgba(240,215,140,0.55), 0 0 3px rgba(255,216,106,0.35);
        }
        50% {
          opacity: 1;
          text-shadow: 0 0 16px rgba(255,216,106,0.95), 0 0 8px rgba(240,215,140,0.75);
        }
      }
      @keyframes heroLedgerMeditatePress {
        0% { transform: scale(1); }
        35% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      @keyframes heroLedgerMeditatePulseOnce {
        0% {
          transform: scale(1);
          opacity: 0.58;
        }
        100% {
          transform: scale(1.3);
          opacity: 0;
        }
      }
      .hero-ledger-pulse-wrap {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
      }
      .hero-ledger-pulse-wrap::before,
      .hero-ledger-pulse-wrap::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 12px;
        pointer-events: none;
        z-index: 0;
      }
      .hero-ledger-pulse-wrap > * {
        position: relative;
        z-index: 1;
        width: 100%;
      }
      .hero-ledger-pulse-wrap--gold::before,
      .hero-ledger-pulse-wrap--gold::after {
        border: 1.5px solid rgba(240,215,140,0.48);
        box-shadow: 0 0 14px rgba(240,215,140,0.24);
        animation: heroLedgerPulseRing 2.4s ease-out infinite;
      }
      .hero-ledger-pulse-wrap--gold::after {
        animation-delay: 1.2s;
      }
      .hero-ledger-broadcast-face {
        background: linear-gradient(180deg, rgba(240,215,140,0.14) 0%, rgba(0,0,0,0.24) 100%);
        border: 1px solid rgba(240,215,140,0.42);
        animation: heroLedgerBroadcastGlow 2.4s ease-in-out infinite;
      }
      .hero-ledger-glyph-shimmer {
        animation: heroLedgerGlyphShimmer 2.4s ease-in-out infinite;
      }
      .hero-ledger-glyph-gold {
        color: ${HERO_GOLD_BRIGHT};
        text-shadow: 0 0 10px rgba(240,215,140,0.75), 0 0 4px rgba(255,216,106,0.5);
      }
      .hero-ledger-meditate-press {
        animation: heroLedgerMeditatePress 420ms cubic-bezier(0.32, 0.72, 0, 1);
      }
      .hero-ledger-meditate-pulse-once {
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: 12px;
        border: 1.5px solid rgba(240,215,140,0.52);
        box-shadow: 0 0 16px rgba(240,215,140,0.32);
        animation: heroLedgerMeditatePulseOnce 700ms ease-out forwards;
      }
      .hero-ledger-meditate-pulse-once--delay {
        animation-delay: 180ms;
      }
    `}</style>
  );
}

export function formatHeroCount(n: number) {
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function seedHeroCount(id: string, salt: number) {
  let h = salt;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 80 + (h % 640);
}

export function readHeroMap(key: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as Record<string, number>;
  } catch { /* ignore */ }
  return {};
}

export function writeHeroMap(key: string, map: Record<string, number>) {
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch { /* ignore */ }
}

export function readHeroSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch { /* ignore */ }
  return new Set();
}

export function writeHeroSet(key: string, set: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch { /* ignore */ }
}

export function HeroSpiritLedgerCell({
  glyph,
  label,
  sublabel,
  value,
  active,
  accent,
  onClick,
  variant = "default",
}: {
  glyph: string;
  label: string;
  sublabel: string;
  value: number;
  active?: boolean;
  accent: string;
  onClick?: () => void;
  variant?: "default" | "meditate" | "broadcast";
}) {
  const [pressing, setPressing] = useState(false);
  const [pulseTick, setPulseTick] = useState(0);

  const isBroadcast = variant === "broadcast";
  const isMeditate = variant === "meditate";
  const Tag = isMeditate && onClick ? "button" : "div";

  const blockBubble = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
  };

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (isBroadcast) return;
    if (isMeditate) {
      setPressing(true);
      setPulseTick((t) => t + 1);
      setTimeout(() => setPressing(false), 420);
    }
    onClick?.();
  };

  const glyphClass = `select-none font-black leading-none text-[20px] hero-ledger-glyph-gold${
    isBroadcast ? " hero-ledger-glyph-shimmer" : ""
  }`;

  const content = (
    <div className="relative z-[1] flex w-full flex-col items-center gap-1 px-1.5 py-1.5 text-center">
      <div className="flex items-baseline justify-center gap-2">
        <span aria-hidden className={glyphClass}>
          {glyph}
        </span>
        <span className="text-[15px] font-black tabular-nums leading-none text-white">
          {formatHeroCount(value)}
        </span>
      </div>
      <p className="w-full text-[9.5px] leading-tight">
        <span className="font-extrabold" style={{ color: HERO_GOLD }}>
          {label}
        </span>
        <span className="mx-1 text-white/28">·</span>
        <span className="font-medium text-white/50">{sublabel}</span>
      </p>
    </div>
  );

  if (isBroadcast) {
    return (
      <div className="hero-ledger-pulse-wrap hero-ledger-pulse-wrap--gold relative flex min-w-0 flex-1 ms-1">
        <div
          data-hero-ledger="broadcast"
          role="status"
          aria-label={`انتشار ${formatHeroCount(value)}`}
          onClick={blockBubble}
          onPointerDown={blockBubble}
          className="hero-ledger-broadcast-face relative w-full cursor-default rounded-xl"
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <Tag
      type={isMeditate && onClick ? "button" : undefined}
      data-hero-ledger={isMeditate ? "meditate" : undefined}
      onClick={handleClick}
      onPointerDown={(e) => {
        blockBubble(e);
        if (isMeditate) setPressing(true);
      }}
      onPointerUp={isMeditate ? () => setTimeout(() => setPressing(false), 420) : undefined}
      onPointerLeave={isMeditate ? () => setPressing(false) : undefined}
      className={`group relative flex min-w-0 flex-1 overflow-hidden rounded-xl border transition ${
        isMeditate && onClick ? "cursor-pointer" : "cursor-default"
      } ${isMeditate && pressing ? "hero-ledger-meditate-press" : ""}`}
      style={{
        borderColor: active ? `${accent}aa` : `${accent}38`,
        background: active
          ? `linear-gradient(180deg, ${accent}38 0%, ${accent}12 100%)`
          : "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.12) 100%)",
        boxShadow: active ? `0 0 16px ${accent}38` : "none",
      }}
    >
      {isMeditate && pulseTick > 0 ? (
        <>
          <span key={`med-pulse-a-${pulseTick}`} aria-hidden className="hero-ledger-meditate-pulse-once z-0" />
          <span
            key={`med-pulse-b-${pulseTick}`}
            aria-hidden
            className="hero-ledger-meditate-pulse-once hero-ledger-meditate-pulse-once--delay z-0"
          />
        </>
      ) : null}
      {content}
    </Tag>
  );
}

export function HeroSpiritLedgerRow({
  accent,
  meditations,
  broadcasts,
  meditated,
  onMeditate,
}: {
  accent: string;
  meditations: number;
  broadcasts: number;
  meditated: boolean;
  onMeditate: () => void;
}) {
  return (
    <>
      <HeroLedgerStyles />
      <div
        className="mt-1.5 flex items-stretch gap-4 rounded-xl border px-1.5 py-1"
        style={{
          borderColor: `${accent}33`,
          background: "rgba(0,0,0,0.28)",
          backdropFilter: "blur(8px)",
        }}
      >
        <HeroSpiritLedgerCell
          glyph="Ⲁ"
          label="تأمّل"
          sublabel="وقف مع الآية"
          value={meditations}
          active={meditated}
          accent={accent}
          variant="meditate"
          onClick={onMeditate}
        />
        <div aria-hidden className="my-1.5 w-px shrink-0 bg-gradient-to-b from-transparent via-[#e7c97a]/35 to-transparent" />
        <HeroSpiritLedgerCell
          glyph="Ⲱ"
          label="انتشار"
          sublabel="حمل البركة"
          value={broadcasts}
          accent={accent}
          variant="broadcast"
        />
      </div>
    </>
  );
}

export function HeroCompactLedgerCell({
  label,
  sublabel,
  accent = "#e7c97a",
  className = "",
}: {
  label: string;
  sublabel?: string;
  accent?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`relative overflow-hidden rounded-xl border px-2.5 py-1.5 text-center transition group-active:hero-ledger-meditate-press ${className}`}
      style={{
        borderColor: `${accent}38`,
        background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.12) 100%)",
        backdropFilter: "blur(8px)",
      }}
    >
      <p className="w-full text-[9.5px] leading-tight">
        {sublabel ? (
          <>
            <span className="font-extrabold" style={{ color: HERO_GOLD }}>
              {label}
            </span>
            <span className="mx-1 text-white/28">·</span>
            <span className="font-medium text-white/50">{sublabel}</span>
          </>
        ) : (
          <span className="font-extrabold" style={{ color: HERO_GOLD }}>
            {label}
          </span>
        )}
      </p>
    </div>
  );
}

export function HeroLedgerStylesHost() {
  return <HeroLedgerStyles />;
}

/** ✦ label ✦ — golden emblem flanking (same gold DNA as Ⲁ/Ⲱ ledger glyphs). */
export function HeroBadgeEmblem({
  label,
  compact,
  className = "",
}: {
  label: string;
  compact?: boolean;
  className?: string;
}) {
  const starCls = compact
    ? "text-[9px] leading-none"
    : "text-[10px] leading-none";
  const textCls = compact ? "text-[10px]" : "text-[10.5px]";

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span aria-hidden className={`hero-ledger-glyph-gold select-none font-black ${starCls}`}>
        ✦
      </span>
      <span className={`font-extrabold text-white ${textCls}`}>{label}</span>
      <span aria-hidden className={`hero-ledger-glyph-gold select-none font-black ${starCls}`}>
        ✦
      </span>
    </span>
  );
}

export function HeroCardTopBar({
  badge,
  accent,
  saved,
  onShare,
  onToggleSave,
  saveLabel,
  shareLabel,
  compact,
}: {
  badge: string;
  accent: string;
  saved?: boolean;
  onShare?: () => void;
  onToggleSave?: () => void;
  saveLabel?: string;
  shareLabel?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="absolute inset-x-0 top-0 z-20 flex justify-end px-3 pt-2.5">
        <div
          className="inline-flex items-center rounded-full border px-2.5 py-1 backdrop-blur-md"
          style={{ borderColor: `${accent}80`, background: "rgba(0,0,0,0.38)" }}
        >
          <HeroBadgeEmblem label={badge} compact />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-3 pt-3">
      <button
        type="button"
        aria-label={shareLabel ?? "مشاركة"}
        onClick={(e) => {
          e.stopPropagation();
          onShare?.();
        }}
        className="grid h-9 w-9 place-items-center rounded-full border border-white/25 backdrop-blur-md transition active:scale-95"
        style={{ background: "rgba(0,0,0,0.32)", boxShadow: "0 4px 14px rgba(0,0,0,0.35)" }}
      >
        <Share2 className="h-[15px] w-[15px] text-white" strokeWidth={2.3} />
      </button>

      <div
        className="inline-flex items-center rounded-full border px-3 py-1 backdrop-blur-md"
        style={{ borderColor: `${accent}80`, background: "rgba(0,0,0,0.38)" }}
      >
        <HeroBadgeEmblem label={badge} />
      </div>

      <button
        type="button"
        aria-label={saveLabel ?? (saved ? "إزالة الحفظ" : "حفظ")}
        aria-pressed={saved}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave?.();
        }}
        className="grid h-9 w-9 place-items-center rounded-full border backdrop-blur-md transition active:scale-95"
        style={{
          borderColor: saved ? accent : "rgba(255,255,255,0.25)",
          background: saved ? accent : "rgba(0,0,0,0.32)",
          boxShadow: saved ? `0 4px 16px ${accent}55` : "0 4px 14px rgba(0,0,0,0.35)",
        }}
      >
        <Bookmark className={`h-[15px] w-[15px] ${saved ? "fill-white text-white" : "text-white"}`} strokeWidth={2.3} />
      </button>
    </div>
  );
}

export function HeroProgressRail({
  index,
  total,
  labels,
  onSelect,
}: {
  index: number;
  total: number;
  labels: readonly string[];
  onSelect?: (i: number) => void;
}) {
  const progress = ((index + 1) / total) * 100;

  return (
    <div className="mt-3 px-1">
      <div
        className="relative h-[3px] overflow-hidden rounded-full"
        style={{ background: "rgba(120,80,30,0.14)" }}
      >
        <div
          className="absolute inset-y-0 right-0 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #c9983a 0%, #f0d78c 55%, #e7c97a 100%)",
            boxShadow: "0 0 10px rgba(231,201,122,0.45)",
          }}
        />
      </div>

      <div className="mt-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
        {Array.from({ length: total }, (_, i) => {
          const active = i === index;
          return (
            <button
              key={i}
              type="button"
              aria-label={labels[i] ?? `بطاقة ${i + 1}`}
              aria-current={active ? "step" : undefined}
              onClick={() => onSelect?.(i)}
              className="group flex flex-col items-center gap-1 rounded-lg px-0.5 py-1 transition active:scale-[0.97]"
            >
              <span
                className="h-1 w-full max-w-[28px] rounded-full transition-all duration-400"
                style={{
                  background: active
                    ? "linear-gradient(90deg, #c9983a, #f0d78c)"
                    : "rgba(120,80,30,0.22)",
                  boxShadow: active ? "0 0 8px rgba(231,201,122,0.5)" : "none",
                  transform: active ? "scaleY(1.4)" : "scaleY(1)",
                }}
              />
              <span
                className="text-[9px] font-extrabold leading-tight transition-colors duration-300"
                style={{
                  color: active ? "#5a1f2a" : "rgba(90,31,42,0.45)",
                }}
              >
                {labels[i]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
