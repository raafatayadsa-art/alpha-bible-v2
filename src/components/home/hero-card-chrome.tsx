import { useState, type MouseEvent, type ReactNode } from "react";
import { Bookmark, Heart, Layers, QrCode, Share2, ShieldCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const HERO_STACK_LABELS = ["آية اليوم", "القطمارس", "قديس اليوم", "مناسبة"] as const;

/** Approved Alpha hero-card accent — use sparingly (active/primary only) */
export const ALPHA_HERO_ACCENT = "var(--alpha-gold)";

const HERO_GOLD = "var(--alpha-gold-bright)";
const HERO_GOLD_BRIGHT = "var(--alpha-gold-bright)";

/** Publisher hero — dark glass so gold glow reads through */
export const PUBLISHER_HERO_FOLLOW_BLUE = "#5b9fd8";
const PUBLISHER_LEDGER_DARK_BG = "rgba(0,0,0,0.26)";
const PUBLISHER_ENGAGEMENT_BG = "rgba(0,0,0,0.54)";
const PUBLISHER_LEDGER_FRAME_BG = PUBLISHER_LEDGER_DARK_BG;
const PUBLISHER_LEDGER_CELL_IDLE =
  "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.28) 100%)";
const PUBLISHER_ENGAGEMENT_CELL_IDLE =
  "linear-gradient(180deg, rgba(240,215,140,0.03) 0%, rgba(0,0,0,0.5) 100%)";
/** Light ivory nav — distinct from dark engagement row (like · repost · QR) */
const PUBLISHER_SECTION_NAV_BG =
  "linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(247,236,214,0.94) 100%)";
const PUBLISHER_VERIFIED_GREEN_BG = "rgba(16, 185, 129, 0.22)";
const PUBLISHER_STAT_LIKE = "#e85d7a";
const PUBLISHER_STAT_CONTENT = "#e7c97a";
const PUBLISHER_TOP_CHIP_H = "h-[30px]";

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
      .hero-ledger-broadcast-face--publisher {
        background: linear-gradient(180deg, rgba(240,215,140,0.05) 0%, rgba(0,0,0,0.28) 100%);
        border: 1px solid rgba(240,215,140,0.22);
      }
      .hero-ledger-broadcast-face--engagement {
        background: linear-gradient(180deg, rgba(240,215,140,0.07) 0%, rgba(0,0,0,0.52) 100%);
        border: 1px solid rgba(240,215,140,0.26);
        animation: heroLedgerBroadcastGlowEngagement 2.4s ease-in-out infinite;
      }
      @keyframes heroLedgerBroadcastGlowEngagement {
        0%, 100% {
          box-shadow:
            0 0 0 1px rgba(240,215,140,0.1),
            0 0 14px rgba(240,215,140,0.16),
            inset 0 0 20px rgba(0,0,0,0.35);
        }
        50% {
          box-shadow:
            0 0 0 1px rgba(240,215,140,0.28),
            0 0 26px rgba(240,215,140,0.38),
            inset 0 0 24px rgba(0,0,0,0.4);
        }
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
      .hero-ledger-broadcast-active {
        border-color: rgba(240, 215, 140, 0.55) !important;
        background: linear-gradient(180deg, rgba(212, 168, 87, 0.24) 0%, rgba(0, 0, 0, 0.12) 100%) !important;
        box-shadow:
          0 0 0 1px rgba(240, 215, 140, 0.32),
          0 0 22px rgba(212, 168, 87, 0.42),
          inset 0 0 18px rgba(212, 168, 87, 0.14) !important;
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
    void import("@/lib/user-sync-scheduler").then(({ scheduleUserDataSync }) =>
      scheduleUserDataSync({ delayMs: 1500, extraKey: key }),
    );
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
    void import("@/lib/user-sync-scheduler").then(({ scheduleUserDataSync }) =>
      scheduleUserDataSync({ delayMs: 1500, extraKey: key }),
    );
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
  activePulse = false,
  valueHidden = false,
  surface = "default",
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
  /** Steady gold ring when liked / active meditate */
  activePulse?: boolean;
  /** Hide numeric count when glyph is pinned to the edge (icon-only cells) */
  valueHidden?: boolean;
  /** Lighter glass on publisher hero ledger rows */
  surface?: "default" | "publisher" | "engagement";
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
          surface === "engagement"
            ? "hero-ledger-broadcast-face--engagement"
            : surface === "publisher"
              ? "hero-ledger-broadcast-face--publisher"
              : ""
        } ${isInteractive ? "" : "cursor-default"}`}
      >
        {content}
      </div>
    );

    return (
      <div className="hero-ledger-pulse-wrap hero-ledger-pulse-wrap--gold relative flex h-full min-w-0 w-full flex-1">
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
            className={`group relative w-full h-full min-h-[52px] overflow-hidden rounded-xl border transition cursor-pointer active:scale-[0.98] ${
              pressing ? "hero-ledger-meditate-press" : ""
            } ${active ? "hero-ledger-broadcast-active" : ""}`}
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
                  : surface === "engagement"
                    ? PUBLISHER_ENGAGEMENT_CELL_IDLE
                    : surface === "publisher"
                      ? PUBLISHER_LEDGER_CELL_IDLE
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

      if (notifyPulse || activePulse) {
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
  onCommunity,
  meditateLabel = "تأمّل",
  meditateSublabel = "وقف مع الآية",
  broadcastLabel = "انتشار",
  broadcastSublabel = "حمل البركة",
  communityLabel = "مجتمعي",
  communitySublabel = "شارك الآية",
  meditateLeadingIcon,
  meditateLeadingIconColor,
  meditateActivePulse,
  className,
  hideMeditate,
}: {
  accent: string;
  meditations: number;
  broadcasts: number;
  meditated: boolean;
  onMeditate?: () => void;
  onBroadcast?: () => void;
  onCommunity?: () => void;
  meditateLabel?: string;
  meditateSublabel?: string;
  broadcastLabel?: string;
  broadcastSublabel?: string;
  communityLabel?: string;
  communitySublabel?: string;
  meditateLeadingIcon?: LucideIcon;
  meditateLeadingIconColor?: string;
  meditateActivePulse?: boolean;
  className?: string;
  hideMeditate?: boolean;
}) {
  const compact = Boolean(onCommunity);

  const meditateCell = hideMeditate ? null : (
    <HeroSpiritLedgerCell
      glyph="Ⲁ"
      label={meditateLabel}
      sublabel={meditateSublabel}
      value={meditations}
      active={meditated}
      accent={accent}
      variant="meditate"
      onClick={onMeditate!}
      leadingIcon={meditateLeadingIcon}
      leadingIconColor={meditateLeadingIconColor}
      compact={compact}
      activePulse={meditateActivePulse && meditated}
    />
  );

  return (
    <>
      <HeroLedgerStyles />
      <div
        className={cn(
          "mt-1.5 flex items-stretch rounded-xl border px-1 py-1",
          compact ? "gap-1" : "gap-4",
          className,
        )}
        style={{
          borderColor: `${accent}33`,
          background: "rgba(0,0,0,0.28)",
          backdropFilter: "blur(8px)",
        }}
      >
        {meditateCell}
        {onCommunity ? (
          <>
            <div aria-hidden className="my-1.5 w-px shrink-0 bg-gradient-to-b from-transparent via-[#1f8a5a]/35 to-transparent" />
            <HeroSpiritLedgerCell
              glyph="Ⲙ"
              label={communityLabel}
              sublabel={communitySublabel}
              value={0}
              accent="#1f8a5a"
              variant="broadcast"
              onClick={onCommunity}
              compact={compact}
              valueHidden
            />
          </>
        ) : null}
        <div aria-hidden className="my-1.5 w-px shrink-0 bg-gradient-to-b from-transparent via-[#e7c97a]/35 to-transparent" />
        <HeroSpiritLedgerCell
          glyph="Ⲱ"
          label={broadcastLabel}
          sublabel={broadcastSublabel}
          value={broadcasts}
          accent={accent}
          variant="broadcast"
          onClick={onBroadcast}
          compact={compact}
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
  idleBackground = "rgba(0,0,0,0.32)",
}: {
  active?: boolean;
  accent: string;
  onClick?: (e: MouseEvent) => void;
  label?: string;
  className?: string;
  children: ReactNode;
  idleBackground?: string;
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
        background: active ? accent : idleBackground,
        boxShadow: active ? `0 4px 16px ${accent}55` : "0 4px 14px rgba(0,0,0,0.35)",
      }}
    >
      {children}
    </button>
  );
}

/** Publisher hero — compact read-only stat chip (ledger DNA) */
function AlphaHeroPublisherStatChip({
  label,
  value,
  accent,
  icon: Icon,
}: {
  label: string;
  value: number;
  accent: string;
  icon: LucideIcon;
}) {
  return (
    <div
      role="status"
      aria-label={`${label} ${value}`}
      className={cn(
        "inline-flex min-w-[52px] items-center justify-center rounded-xl border px-2 backdrop-blur-md",
        PUBLISHER_TOP_CHIP_H,
      )}
      style={{
        borderColor: `${accent}42`,
        background: PUBLISHER_LEDGER_DARK_BG,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 12px ${accent}18`,
      }}
    >
      <div className="flex flex-col items-center leading-none">
        <div className="flex items-center gap-1">
          <Icon className="h-3 w-3 shrink-0" style={{ color: accent }} strokeWidth={2.35} />
          <span className="font-black tabular-nums text-[11px] text-white">
            {formatHeroCount(value)}
          </span>
        </div>
        <span className="mt-0.5 text-[7.5px] font-extrabold" style={{ color: accent }}>
          {label}
        </span>
      </div>
    </div>
  );
}

function AlphaHeroPublisherFollowChip({
  following,
  followCount,
  followBusy,
  onFollow,
}: {
  following: boolean;
  followCount: number;
  followBusy?: boolean;
  onFollow?: () => void;
}) {
  const blue = PUBLISHER_HERO_FOLLOW_BLUE;
  return (
    <button
      type="button"
      aria-pressed={following}
      aria-label={
        following
          ? `متابَع · ${followCount.toLocaleString("ar-EG")} متابع`
          : `متابعة · ${followCount.toLocaleString("ar-EG")} متابع`
      }
      disabled={followBusy}
      onClick={() => onFollow?.()}
      className={cn(
        "inline-flex min-w-[72px] flex-col items-center justify-center rounded-xl border px-3 backdrop-blur-md transition active:scale-95",
        PUBLISHER_TOP_CHIP_H,
        followBusy ? "opacity-70" : undefined,
      )}
      style={{
        borderColor: following ? `${blue}cc` : `${blue}55`,
        background: following
          ? `linear-gradient(180deg, ${blue} 0%, #4a8fd4 100%)`
          : PUBLISHER_LEDGER_DARK_BG,
        boxShadow: following
          ? `0 0 20px ${blue}77, inset 0 1px 0 rgba(255,255,255,0.22)`
          : `0 0 14px ${blue}44, inset 0 1px 0 rgba(255,255,255,0.08)`,
      }}
    >
      <span className="font-black tabular-nums text-[12px] leading-none text-white">
        {formatHeroCount(followCount)}
      </span>
      <span className="mt-0.5 text-[7px] font-extrabold text-white/80">
        {following ? "متابَع" : "متابعة"}
      </span>
    </button>
  );
}

/** Read-only content total — inside hero, above play */
export function AlphaHeroPublisherContentBadge({ contentCount }: { contentCount: number }) {
  return (
    <AlphaHeroPublisherStatChip
      label="محتوى"
      value={contentCount}
      accent={PUBLISHER_STAT_CONTENT}
      icon={Layers}
    />
  );
}

/** Dark ledger frame — shared by engagement row + section tabs */
export function AlphaHeroPublisherLedgerFrame({
  accent,
  children,
  className,
  engagement = false,
}: {
  accent: string;
  children: ReactNode;
  className?: string;
  /** Darker frame for hero engagement row (like · repost · QR) */
  engagement?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 rounded-xl border backdrop-blur-md",
        engagement ? "p-0" : "px-1 py-0.5",
        className,
      )}
      style={{
        borderColor: `${accent}${engagement ? "22" : "33"}`,
        background: engagement ? PUBLISHER_ENGAGEMENT_BG : PUBLISHER_LEDGER_DARK_BG,
        boxShadow: engagement
          ? "inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -10px 28px rgba(0,0,0,0.45)"
          : "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {children}
    </div>
  );
}

/** One engagement action — same broadcast ledger DNA as repost */
function AlphaHeroPublisherEngagementCell({
  glyph,
  label,
  sublabel,
  value,
  accent,
  onClick,
  busy,
  valueHidden = false,
  active = false,
}: {
  glyph: string;
  label: string;
  sublabel: string;
  value: number;
  accent: string;
  onClick?: () => void;
  busy?: boolean;
  valueHidden?: boolean;
  active?: boolean;
}) {
  return (
    <AlphaHeroPublisherLedgerFrame accent={accent} engagement className="min-w-0 flex-1">
      <HeroSpiritLedgerCell
        glyph={glyph}
        label={label}
        sublabel={sublabel}
        value={value}
        valueHidden={valueHidden}
        accent={accent}
        active={active}
        variant="broadcast"
        surface="engagement"
        onClick={busy ? undefined : onClick}
        className={`h-full w-full min-h-[52px] ${busy ? "opacity-70" : ""}`}
      />
    </AlphaHeroPublisherLedgerFrame>
  );
}

/** Section quick-jump — light ivory tabs, full-width row; scrolls to `#publisher-{id}` */
export function AlphaHeroPublisherSectionTab({
  label,
  sublabel = "قسم",
  accent,
  onClick,
  active = false,
  className,
}: {
  label: string;
  sublabel?: string;
  accent: string;
  onClick: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "min-w-0 w-full rounded-xl border px-1.5 py-2 text-center transition active:scale-[0.97]",
        active ? "ring-1 ring-offset-1 ring-offset-[#f4eee6]" : undefined,
        className,
      )}
      style={{
        borderColor: active ? `${accent}aa` : `${accent}55`,
        background: active
          ? `linear-gradient(180deg, ${accent}22 0%, rgba(255,255,255,0.98) 55%)`
          : PUBLISHER_SECTION_NAV_BG,
        boxShadow: active
          ? `0 6px 18px -10px ${accent}66, inset 0 1px 0 rgba(255,255,255,0.9)`
          : `0 4px 14px -10px rgba(93,50,145,0.12), inset 0 1px 0 rgba(255,255,255,0.85)`,
        ...(active ? { ringColor: `${accent}88` } : {}),
      }}
    >
      <span
        className="block truncate text-[10px] font-extrabold leading-tight"
        style={{ color: active ? accent : "#3a3258" }}
      >
        {label}
      </span>
      <span className="mt-0.5 block truncate text-[8px] font-bold text-[#8a84a8]">{sublabel}</span>
    </button>
  );
}

/** Publisher hero — follow only (top-left) + verified badge row */
export function AlphaHeroPublisherHeroTopBar({
  followCount,
  following,
  followBusy,
  onFollow,
  isTrusted,
  typeLabel,
  typeIcon: TypeIcon,
  showFollow = true,
  className,
}: {
  followCount: number;
  following: boolean;
  followBusy?: boolean;
  onFollow?: () => void;
  isTrusted?: boolean;
  typeLabel: string;
  typeIcon?: LucideIcon;
  showFollow?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 px-4 pt-4", className)}>
      <div className="shrink-0">
        {showFollow ? (
          <AlphaHeroPublisherFollowChip
            following={following}
            followCount={followCount}
            followBusy={followBusy}
            onFollow={onFollow}
          />
        ) : null}
      </div>

      <div className="flex max-w-[68%] shrink-0 flex-wrap items-center justify-end gap-1.5">
        {isTrusted ? (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-extrabold text-emerald-50 backdrop-blur-md ring-1 ring-emerald-300/35"
            style={{ background: PUBLISHER_VERIFIED_GREEN_BG }}
          >
            <ShieldCheck className="h-3 w-3 text-emerald-100" />
            ناشر موثوق
          </span>
        ) : null}
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold text-white/90 backdrop-blur-md ring-1 ring-white/15"
          style={{ background: PUBLISHER_LEDGER_DARK_BG }}
        >
          {TypeIcon ? <TypeIcon className="h-3 w-3" /> : null}
          {typeLabel}
        </span>
      </div>
    </div>
  );
}

/** Publisher / audio hero — verse-card ledger DNA with like + share (+ QR) */
export function AlphaHeroPublisherEngagementBar({
  likeCount,
  shareCount,
  qrCount = 0,
  liked,
  shared = false,
  likeBusy,
  onLike,
  onShare,
  onQr,
  className,
}: {
  likeCount: number;
  shareCount: number;
  qrCount?: number;
  liked: boolean;
  shared?: boolean;
  likeBusy?: boolean;
  onLike: () => void;
  onShare: () => void;
  onQr?: () => void;
  className?: string;
}) {
  const goldAccent = ALPHA_HERO_ACCENT;
  const likeAccent = PUBLISHER_STAT_LIKE;
  const qrAccent = "#b8a4e8";

  return (
    <>
      <HeroLedgerStyles />
      <div className={cn("flex items-stretch gap-1.5", className)}>
        <AlphaHeroPublisherEngagementCell
          glyph="Ⲱ"
          label="إعجاب"
          sublabel="ادعم الصفحة"
          value={likeCount}
          accent={liked ? goldAccent : likeAccent}
          active={liked}
          onClick={onLike}
          busy={likeBusy}
        />
        <AlphaHeroPublisherEngagementCell
          glyph="Ⲱ"
          label="إعادة نشر"
          sublabel="على صفحتي"
          value={shareCount}
          accent={goldAccent}
          active={shared}
          onClick={onShare}
        />
        {onQr ? (
          <AlphaHeroPublisherEngagementCell
            glyph="Ⲱ"
            label="باركود"
            sublabel="رمز الصفحة"
            value={qrCount}
            accent={qrAccent}
            onClick={onQr}
          />
        ) : null}
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
  hideShare,
  hideToggle,
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
  hideShare?: boolean;
  hideToggle?: boolean;
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
      {hideShare ? (
        <span className="h-9 w-9 shrink-0" aria-hidden />
      ) : (
        <AlphaHeroShareButton onClick={onShare} label={shareLabel} />
      )}
      <div
        className="inline-flex items-center rounded-full border px-3 py-1 backdrop-blur-md"
        style={{ borderColor: `${accent}80`, background: "rgba(0,0,0,0.38)" }}
      >
        <HeroBadgeEmblem label={badge} />
      </div>
      {hideToggle ? (
        <span className="h-9 w-9 shrink-0" aria-hidden />
      ) : (
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
      )}
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
  hideShare,
  hideToggle,
}: {
  badge: string;
  accent: string;
  saved?: boolean;
  onShare?: () => void;
  onToggleSave?: () => void;
  saveLabel?: string;
  shareLabel?: string;
  compact?: boolean;
  hideShare?: boolean;
  hideToggle?: boolean;
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
      hideShare={hideShare}
      hideToggle={hideToggle}
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
    <div className="relative z-20 mt-3 px-1">
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect?.(i);
              }}
              className="group flex flex-col items-center gap-1 rounded-lg px-0.5 py-1 transition active:scale-[0.97] touch-manipulation"
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
                  color: active ? "#3a2a18" : "rgba(58,42,24,0.45)",
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
