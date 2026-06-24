import { useState, type MouseEvent, type ReactNode } from "react";
import { Bookmark, Heart, QrCode, Share2, UserPlus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const HERO_STACK_LABELS = ["آية اليوم", "القطمارس", "قديس اليوم", "مناسبة"] as const;

/** Approved Alpha hero-card accent — reuse on Synaxarium / shared surfaces */
export const ALPHA_HERO_ACCENT = "#e7c97a";

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
      .hero-ledger-pulse-wrap--blue::before,
      .hero-ledger-pulse-wrap--blue::after {
        border: 2px solid rgba(100,190,255,0.78);
        box-shadow: 0 0 22px rgba(80,175,255,0.55), 0 0 8px rgba(126,200,240,0.45);
        animation: heroLedgerPulseRing 2.4s ease-out infinite;
      }
      .hero-ledger-pulse-wrap--blue::after {
        animation-delay: 1.2s;
      }
      .hero-ledger-pulse-wrap--red::before,
      .hero-ledger-pulse-wrap--red::after {
        border: 2px solid rgba(255,90,90,0.82);
        box-shadow: 0 0 22px rgba(255,80,80,0.58), 0 0 8px rgba(248,113,113,0.48);
        animation: heroLedgerPulseRing 2.4s ease-out infinite;
      }
      .hero-ledger-pulse-wrap--red::after {
        animation-delay: 1.2s;
      }
      @keyframes heroLedgerNotifyFaceBlue {
        0%, 100% {
          box-shadow: 0 0 0 1px rgba(100,190,255,0.45), 0 0 16px rgba(80,175,255,0.38);
        }
        50% {
          box-shadow: 0 0 0 2px rgba(120,205,255,0.72), 0 0 32px rgba(80,175,255,0.62);
        }
      }
      @keyframes heroLedgerNotifyFaceRed {
        0%, 100% {
          box-shadow: 0 0 0 1px rgba(255,90,90,0.48), 0 0 16px rgba(255,80,80,0.4);
        }
        50% {
          box-shadow: 0 0 0 2px rgba(255,100,100,0.78), 0 0 32px rgba(255,70,70,0.65);
        }
      }
      .hero-ledger-notify-face--blue {
        animation: heroLedgerNotifyFaceBlue 2.4s ease-in-out infinite;
        border-color: rgba(100,190,255,0.68) !important;
      }
      .hero-ledger-notify-face--red {
        animation: heroLedgerNotifyFaceRed 2.4s ease-in-out infinite;
        border-color: rgba(255,90,90,0.72) !important;
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
  leadingIcon: LeadingIcon,
  leadingIconColor,
  leadingIconClassName,
  compact,
  className,
  glyphPosition = "inline",
  glyphEdge = "start",
  notifyPulse = false,
  notifyPulseTone = "gold",
  valueHidden = false,
}: {
  glyph: string;
  label: string;
  sublabel: string;
  value: number;
  active?: boolean;
  accent: string;
  onClick?: () => void;
  variant?: "default" | "meditate" | "broadcast";
  /** Small affordance icon beside the Coptic glyph — e.g. messages / calls on Connect card */
  leadingIcon?: LucideIcon;
  /** Tint for leadingIcon — keeps glyph gold while icon reads as action hint */
  leadingIconColor?: string;
  leadingIconClassName?: string;
  /** Tighter cell — more breathing room inside outer ledger frame */
  compact?: boolean;
  className?: string;
  /** Pin Ⲁ/Ⲱ to button edge; center holds icon + count */
  glyphPosition?: "inline" | "edge";
  /** Outer edge of the button (start = inline-start, e.g. right in RTL) */
  glyphEdge?: "start" | "end";
  /** Continuous activity ring — e.g. unread messages / missed calls */
  notifyPulse?: boolean;
  notifyPulseTone?: "gold" | "blue" | "red";
  /** Hide numeric count when glyph is pinned to the edge (icon-only cells) */
  valueHidden?: boolean;
}) {
  const [pressing, setPressing] = useState(false);
  const [pulseTick, setPulseTick] = useState(0);

  const isBroadcast = variant === "broadcast";
  const isMeditate = variant === "meditate";
  const isInteractive = Boolean(onClick) && (isMeditate || isBroadcast);
  const Tag = isInteractive ? "button" : "div";

  const blockBubble = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
  };

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (isBroadcast && !onClick) return;
    if (isMeditate || (isBroadcast && onClick)) {
      setPressing(true);
      setPulseTick((t) => t + 1);
      setTimeout(() => setPressing(false), 420);
    }
    onClick?.();
  };

  const glyphClass = `select-none font-black leading-none ${
    compact ? "text-[17px]" : "text-[20px]"
  } hero-ledger-glyph-gold${isBroadcast ? " hero-ledger-glyph-shimmer" : ""}`;

  const glyphAtEdge = glyphPosition === "edge";
  const edgeGlyphClass = `select-none font-black leading-none ${
    compact ? "text-[15px]" : "text-[17px]"
  } hero-ledger-glyph-gold opacity-[0.82]${isBroadcast ? " hero-ledger-glyph-shimmer" : ""}`;

  const content = (
    <div
      className={`relative z-[1] w-full ${
        compact ? "px-1 py-1" : "px-1.5 py-1.5"
      } ${glyphAtEdge ? "min-h-[44px]" : ""}`}
    >
      {glyphAtEdge ? (
        <span
          aria-hidden
          className={`pointer-events-none absolute top-0.5 z-[2] ${edgeGlyphClass} ${
            glyphEdge === "start" ? "start-1" : "end-1"
          }`}
        >
          {glyph}
        </span>
      ) : null}
      <div
        className={`flex w-full flex-col items-center text-center ${compact ? "gap-0.5" : "gap-1"}`}
      >
        <div className="flex items-center justify-center gap-1.5">
          {LeadingIcon ? (
            <LeadingIcon
              aria-hidden
              className={leadingIconClassName ?? "h-3.5 w-3.5 shrink-0"}
              strokeWidth={compact ? 2.35 : 2.25}
              style={{
                color: leadingIconColor ?? HERO_GOLD,
              filter: leadingIconColor
                  ? `drop-shadow(0 0 8px ${leadingIconColor}aa) drop-shadow(0 0 4px ${leadingIconColor}88)`
                  : undefined,
              opacity: notifyPulse ? 1 : 0.95,
              }}
            />
          ) : null}
          {!glyphAtEdge ? (
            <div className={`flex items-baseline justify-center ${compact ? "gap-1.5" : "gap-2"}`}>
              <span aria-hidden className={glyphClass}>
                {glyph}
              </span>
              <span
                className={`font-black tabular-nums leading-none text-white ${
                  compact ? "text-[13px]" : "text-[15px]"
                }`}
              >
                {formatHeroCount(value)}
              </span>
            </div>
          ) : !valueHidden ? (
            <span
              className={`font-black tabular-nums leading-none text-white ${
                compact ? "text-[14px]" : "text-[15px]"
              }`}
            >
              {formatHeroCount(value)}
            </span>
          ) : null}
        </div>
        <p className={`w-full leading-tight ${compact ? "text-[9px]" : "text-[9.5px]"}`}>
        <span className="font-extrabold" style={{ color: HERO_GOLD }}>
          {label}
        </span>
        <span className="mx-1 text-white/28">·</span>
        <span className="font-medium text-white/50">{sublabel}</span>
      </p>
      </div>
    </div>
  );

  if (isBroadcast) {
    const face = (
      <div
        data-hero-ledger="broadcast"
        role={isInteractive ? undefined : "status"}
        aria-label={
          isInteractive
            ? `انتشار ${formatHeroCount(value)} — مشاركة`
            : `انتشار ${formatHeroCount(value)}`
        }
        className={`hero-ledger-broadcast-face relative w-full rounded-xl ${
          isInteractive ? "" : "cursor-default"
        }`}
      >
        {content}
      </div>
    );

    return (
      <div className="hero-ledger-pulse-wrap hero-ledger-pulse-wrap--gold relative flex min-w-0 flex-1 ms-1">
        {isInteractive ? (
          <button
            type="button"
            onClick={handleClick}
            onPointerDown={(e) => {
              blockBubble(e);
              setPressing(true);
            }}
            onPointerUp={() => setTimeout(() => setPressing(false), 420)}
            onPointerLeave={() => setPressing(false)}
            className={`group relative w-full overflow-hidden rounded-xl border transition cursor-pointer active:scale-[0.98] ${
              pressing ? "hero-ledger-meditate-press" : ""
            }`}
            style={{
              borderColor: `${accent}38`,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.12) 100%)",
            }}
          >
            {face}
          </button>
        ) : (
          <div onClick={blockBubble} onPointerDown={blockBubble}>
            {face}
          </div>
        )}
      </div>
    );
  }

  return (
    (() => {
      const notifyFaceClass =
        notifyPulse && notifyPulseTone === "blue"
          ? "hero-ledger-notify-face--blue"
          : notifyPulse && notifyPulseTone === "red"
            ? "hero-ledger-notify-face--red"
            : "";

      const cell = (
        <Tag
          type={isInteractive ? "button" : undefined}
          data-hero-ledger={isMeditate ? "meditate" : undefined}
          onClick={handleClick}
          onPointerDown={(e) => {
            blockBubble(e);
            if (isMeditate) setPressing(true);
          }}
          onPointerUp={isMeditate ? () => setTimeout(() => setPressing(false), 420) : undefined}
          onPointerLeave={isMeditate ? () => setPressing(false) : undefined}
          className={`group relative flex min-w-0 flex-1 overflow-hidden rounded-xl border transition ${
            isInteractive ? "cursor-pointer" : "cursor-default"
          } ${isMeditate && pressing ? "hero-ledger-meditate-press" : ""} ${notifyFaceClass} ${className ?? ""}`}
          style={{
            borderColor: active ? `${accent}aa` : `${accent}38`,
            background: active
              ? `linear-gradient(180deg, ${accent}38 0%, ${accent}12 100%)`
              : notifyPulse && notifyPulseTone === "blue"
                ? "linear-gradient(180deg, rgba(100,190,255,0.22) 0%, rgba(0,0,0,0.16) 100%)"
                : notifyPulse && notifyPulseTone === "red"
                  ? "linear-gradient(180deg, rgba(255,90,90,0.24) 0%, rgba(0,0,0,0.16) 100%)"
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

      if (notifyPulse) {
        return (
          <div
            className={`hero-ledger-pulse-wrap hero-ledger-pulse-wrap--${notifyPulseTone} relative flex min-w-0 flex-1`}
          >
            {cell}
          </div>
        );
      }

      return cell;
    })()
  );
}

export function HeroSpiritLedgerRow({
  accent,
  meditations,
  broadcasts,
  meditated,
  onMeditate,
  onBroadcast,
  meditateLabel = "تأمّل",
  meditateSublabel = "وقف مع الآية",
  broadcastLabel = "انتشار",
  broadcastSublabel = "حمل البركة",
  meditateLeadingIcon,
  meditateLeadingIconColor,
  className,
}: {
  accent: string;
  meditations: number;
  broadcasts: number;
  meditated: boolean;
  onMeditate: () => void;
  onBroadcast?: () => void;
  meditateLabel?: string;
  meditateSublabel?: string;
  broadcastLabel?: string;
  broadcastSublabel?: string;
  meditateLeadingIcon?: LucideIcon;
  meditateLeadingIconColor?: string;
  className?: string;
}) {
  return (
    <>
      <HeroLedgerStyles />
      <div
        className={cn("mt-1.5 flex items-stretch gap-4 rounded-xl border px-1.5 py-1", className)}
        style={{
          borderColor: `${accent}33`,
          background: "rgba(0,0,0,0.28)",
          backdropFilter: "blur(8px)",
        }}
      >
        <HeroSpiritLedgerCell
          glyph="Ⲁ"
          label={meditateLabel}
          sublabel={meditateSublabel}
          value={meditations}
          active={meditated}
          accent={accent}
          variant="meditate"
          onClick={onMeditate}
          leadingIcon={meditateLeadingIcon}
          leadingIconColor={meditateLeadingIconColor}
        />
        <div aria-hidden className="my-1.5 w-px shrink-0 bg-gradient-to-b from-transparent via-[#e7c97a]/35 to-transparent" />
        <HeroSpiritLedgerCell
          glyph="Ⲱ"
          label={broadcastLabel}
          sublabel={broadcastSublabel}
          value={broadcasts}
          accent={accent}
          variant="broadcast"
          onClick={onBroadcast}
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

/** Approved Alpha — circular share control (verse card DNA) */
export function AlphaHeroShareButton({
  onClick,
  label = "مشاركة",
  className,
}: {
  onClick?: (e: MouseEvent) => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full border border-white/25 backdrop-blur-md transition active:scale-95",
        className,
      )}
      style={{ background: "rgba(0,0,0,0.32)", boxShadow: "0 4px 14px rgba(0,0,0,0.35)" }}
    >
      <Share2 className="h-[15px] w-[15px] text-white" strokeWidth={2.3} />
    </button>
  );
}

/** Approved Alpha — circular toggle control (save / like / bookmark) */
export function AlphaHeroToggleButton({
  active,
  accent,
  onClick,
  label,
  className,
  children,
}: {
  active?: boolean;
  accent: string;
  onClick?: (e: MouseEvent) => void;
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full border backdrop-blur-md transition active:scale-95",
        className,
      )}
      style={{
        borderColor: active ? accent : "rgba(255,255,255,0.25)",
        background: active ? accent : "rgba(0,0,0,0.32)",
        boxShadow: active ? `0 4px 16px ${accent}55` : "0 4px 14px rgba(0,0,0,0.35)",
      }}
    >
      {children}
    </button>
  );
}

/** Publisher / audio hero — verse-card ledger DNA with follow + like + share */
export function AlphaHeroPublisherEngagementBar({
  followCount,
  likeCount,
  shareCount,
  following,
  liked,
  followBusy,
  likeBusy,
  onFollow,
  onLike,
  onShare,
  onQr,
  className,
}: {
  followCount: number;
  likeCount: number;
  shareCount: number;
  following: boolean;
  liked: boolean;
  followBusy?: boolean;
  likeBusy?: boolean;
  onFollow: () => void;
  onLike: () => void;
  onShare: () => void;
  onQr?: () => void;
  className?: string;
}) {
  const goldAccent = ALPHA_HERO_ACCENT;
  const followAccent = "#9d7bd8";
  const likeAccent = "#e85d7a";

  return (
    <>
      <HeroLedgerStyles />
      <div className={cn("space-y-2", className)}>
        <div
          className="rounded-xl border px-1.5 py-1"
          style={{
            borderColor: `${followAccent}44`,
            background: "rgba(0,0,0,0.28)",
            backdropFilter: "blur(8px)",
          }}
        >
          <HeroSpiritLedgerCell
            glyph="Ⲁ"
            label={following ? "متابَع" : "متابعة"}
            sublabel="انضم للناشر"
            value={followCount}
            active={following}
            accent={followAccent}
            variant="meditate"
            onClick={followBusy ? undefined : onFollow}
            leadingIcon={UserPlus}
            leadingIconColor="#ddd6fe"
            className={followBusy ? "opacity-70" : undefined}
          />
        </div>

        <div
          className="flex items-stretch gap-2 rounded-xl border px-1.5 py-1"
          style={{
            borderColor: `${goldAccent}33`,
            background: "rgba(0,0,0,0.28)",
            backdropFilter: "blur(8px)",
          }}
        >
          <HeroSpiritLedgerCell
            glyph="Ⲁ"
            label="إعجاب"
            sublabel="ادعم المحتوى"
            value={likeCount}
            active={liked}
            accent={likeAccent}
            variant="meditate"
            onClick={likeBusy ? undefined : onLike}
            leadingIcon={Heart}
            leadingIconColor="#fda4af"
            className={likeBusy ? "opacity-70" : undefined}
          />
          <div aria-hidden className="my-1.5 w-px shrink-0 bg-gradient-to-b from-transparent via-[#e7c97a]/35 to-transparent" />
          <HeroSpiritLedgerCell
            glyph="Ⲱ"
            label="انتشار"
            sublabel="شارك الصفحة"
            value={shareCount}
            accent={goldAccent}
            variant="broadcast"
            onClick={onShare}
          />
          {onQr ? (
            <>
              <div aria-hidden className="my-1.5 w-px shrink-0 bg-gradient-to-b from-transparent via-[#e7c97a]/25 to-transparent" />
              <HeroSpiritLedgerCell
                glyph="Ⲱ"
                label="باركود"
                sublabel="رمز الصفحة"
                value={0}
                accent={goldAccent}
                variant="meditate"
                onClick={onQr}
                leadingIcon={QrCode}
                leadingIconColor={goldAccent}
                compact
                glyphPosition="edge"
                glyphEdge="end"
                valueHidden
              />
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}

/** Top action bar — share · badge · toggle (verse card layout) */
export function AlphaHeroActionBar({
  badge,
  accent = ALPHA_HERO_ACCENT,
  toggled,
  onShare,
  onToggle,
  shareLabel,
  toggleLabel,
  toggleIcon: ToggleIcon = Bookmark,
  compact,
  className,
}: {
  badge: string;
  accent?: string;
  toggled?: boolean;
  onShare?: (e: MouseEvent) => void;
  onToggle?: (e: MouseEvent) => void;
  shareLabel?: string;
  toggleLabel?: string;
  toggleIcon?: LucideIcon;
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <div className={cn("absolute inset-x-0 top-0 z-20 flex justify-end px-3 pt-2.5", className)}>
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
    <div className={cn("absolute inset-x-0 top-0 z-20 flex items-center justify-between px-3 pt-3", className)}>
      <AlphaHeroShareButton onClick={onShare} label={shareLabel} />
      <div
        className="inline-flex items-center rounded-full border px-3 py-1 backdrop-blur-md"
        style={{ borderColor: `${accent}80`, background: "rgba(0,0,0,0.38)" }}
      >
        <HeroBadgeEmblem label={badge} />
      </div>
      <AlphaHeroToggleButton
        active={toggled}
        accent={accent}
        onClick={onToggle}
        label={toggleLabel}
      >
        <ToggleIcon
          className={`h-[15px] w-[15px] ${toggled ? "fill-white text-white" : "text-white"}`}
          strokeWidth={2.3}
        />
      </AlphaHeroToggleButton>
    </div>
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
  return (
    <AlphaHeroActionBar
      badge={badge}
      accent={accent}
      toggled={saved}
      onShare={() => onShare?.()}
      onToggle={() => onToggleSave?.()}
      shareLabel={shareLabel}
      toggleLabel={saveLabel ?? (saved ? "إزالة الحفظ" : "حفظ")}
      compact={compact}
    />
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
