/**
 * AlphaChurchEngagementBar
 * ─────────────────────────────────────────────────────────────
 * Dark ledger DNA — same spirit as AlphaHeroPublisherEngagementBar
 * but adapted for church post cards:
 *  - Cell 1: type-specific primary action (صليت / تهنئة / تعزية / حاضر / احجز / تأمّل)
 *  - Cell 2: تعليق + count
 *  - Cell 3: مشاركة + count
 *
 * On press: gold glow ring same as publisher engagement cells.
 */
import { useState, type MouseEvent } from "react";
import { MessageCircle, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostType } from "@/data/church-posts";

// ─── colour tokens (mirrors hero-card-chrome publisher tokens) ───
const ENGAGEMENT_BG = "rgba(18,10,4,0.52)";
const GOLD = "#f0d78c";
const GOLD_BORDER_IDLE = "rgba(240,215,140,0.14)";
const GOLD_BORDER_ACTIVE = "rgba(240,215,140,0.55)";
const GOLD_BG_ACTIVE =
  "linear-gradient(180deg, rgba(212,168,87,0.24) 0%, rgba(0,0,0,0.16) 100%)";
const CELL_BG_IDLE =
  "linear-gradient(180deg, rgba(240,215,140,0.03) 0%, rgba(0,0,0,0.48) 100%)";

// ─── type-specific primary action definition ─────────────────────
type ActionDef = {
  /** Arabic label shown inside the cell */
  label: string;
  /** Sub-label (small muted line) */
  sub: string;
  /** Coptic glyph (gold shimmer) */
  glyph: string;
  /** Icon accent colour when active */
  accent: string;
};

const TYPE_ACTION: Record<PostType, ActionDef> = {
  prayer: {
    label: "صليت لأجله",
    sub: "حمل الطلبة",
    glyph: "Ⲁ",
    accent: "#8a6ec1",
  },
  wedding: {
    label: "تهنئة",
    sub: "شارك الفرح",
    glyph: "Ⲱ",
    accent: "#e585a0",
  },
  condolence: {
    label: "تعزية",
    sub: "حمل العزاء",
    glyph: "Ⲁ",
    accent: "#9a8468",
  },
  meeting: {
    label: "حاضر",
    sub: "سجّل حضورك",
    glyph: "Ⲱ",
    accent: "#5b8fd1",
  },
  liturgy: {
    label: "حاضر",
    sub: "سجّل حضورك",
    glyph: "Ⲱ",
    accent: "#7a4a26",
  },
  trip: {
    label: "احجز",
    sub: "أمّن مكانك",
    glyph: "Ⲱ",
    accent: "#1f8a5a",
  },
  event: {
    label: "شاهد",
    sub: "بث مباشر",
    glyph: "Ⲱ",
    accent: "#e0464d",
  },
  news: {
    label: "تأمّل",
    sub: "احمل البركة",
    glyph: "Ⲁ",
    accent: "#c98a3c",
  },
  announcement: {
    label: "إعجاب",
    sub: "ادعم",
    glyph: "Ⲁ",
    accent: "#c44569",
  },
  report: {
    label: "تأمّل",
    sub: "احمل البركة",
    glyph: "Ⲁ",
    accent: "#3a6db0",
  },
};

// ─── single engagement cell ───────────────────────────────────────
function ChurchEngagementCell({
  glyph,
  label,
  sub,
  value,
  active,
  accent,
  hideValue,
  icon: Icon,
  onClick,
}: {
  glyph?: string;
  label: string;
  sub: string;
  value: number;
  active?: boolean;
  accent: string;
  hideValue?: boolean;
  icon?: typeof MessageCircle;
  onClick?: () => void;
}) {
  const [pressing, setPressing] = useState(false);

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (!onClick) return;
    setPressing(true);
    setTimeout(() => setPressing(false), 380);
    onClick();
  };

  const formatCount = (n: number) => {
    if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`;
    if (n >= 1_000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={handleClick}
      aria-pressed={active ? "true" : undefined}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-2",
        "transition-all active:scale-[0.96]",
        onClick ? "cursor-pointer" : "cursor-default",
      )}
      style={{
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: active || pressing ? `${accent}88` : GOLD_BORDER_IDLE,
        background: active || pressing
          ? `linear-gradient(180deg, ${accent}28 0%, rgba(0,0,0,0.16) 100%)`
          : CELL_BG_IDLE,
        boxShadow:
          active || pressing
            ? `0 0 0 1px ${accent}44, 0 0 18px ${accent}55, inset 0 0 14px ${accent}22`
            : "inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <div className="flex items-center gap-1.5">
        {glyph ? (
          <span
            aria-hidden
            className="select-none font-black leading-none text-[18px] hero-ledger-glyph-gold hero-ledger-glyph-shimmer"
          >
            {glyph}
          </span>
        ) : null}
        {Icon ? (
          <Icon
            aria-hidden
            className="h-3.5 w-3.5 shrink-0"
            strokeWidth={2.2}
            style={{
              color: active ? accent : GOLD,
              filter: active
                ? `drop-shadow(0 0 6px ${accent}cc)`
                : undefined,
            }}
          />
        ) : null}
        {!hideValue ? (
          <span className="font-black tabular-nums leading-none text-white text-[14px]">
            {formatCount(value)}
          </span>
        ) : null}
      </div>
      <p className="w-full text-center leading-tight text-[9px]">
        <span className="font-extrabold" style={{ color: active ? accent : GOLD }}>
          {label}
        </span>
        {" "}
        <span className="font-medium text-white/40">· {sub}</span>
      </p>
    </Tag>
  );
}

// ─── divider ──────────────────────────────────────────────────────
function Divider() {
  return (
    <div
      aria-hidden
      className="my-1 w-px shrink-0 bg-gradient-to-b from-transparent via-[#e7c97a]/25 to-transparent"
    />
  );
}

// ─── public API ──────────────────────────────────────────────────
export type ChurchEngagementState = {
  primaryCount: number;
  primaryActive: boolean;
  commentCount: number;
  shareCount: number;
};

export type ChurchEngagementCallbacks = {
  onPrimary: () => void;
  onComment: () => void;
  onShare: () => void;
};

type Props = {
  postType: PostType;
  /** Card accent tone — drives the primary cell active glow */
  tone?: string;
  state: ChurchEngagementState;
  callbacks: ChurchEngagementCallbacks;
  className?: string;
};

export function AlphaChurchEngagementBar({
  postType,
  tone,
  state,
  callbacks,
  className,
}: Props) {
  const def = TYPE_ACTION[postType];
  // If a card tone is provided, override the default accent on the primary cell
  const primaryAccent = tone ?? def.accent;

  return (
    <>
      {/* inject hero ledger keyframes once */}
      <style>{`
        .hero-ledger-glyph-gold {
          background: linear-gradient(180deg, #ffd86a 0%, #c79356 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes heroLedgerBroadcastGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(240,215,140,0.1), 0 0 16px rgba(240,215,140,0.14); }
          50% { box-shadow: 0 0 0 1px rgba(240,215,140,0.28), 0 0 28px rgba(240,215,140,0.28); }
        }
        .hero-ledger-glyph-shimmer {
          animation: heroLedgerBroadcastGlow 3.2s ease-in-out infinite;
        }
      `}</style>
      <div
        className={cn("flex items-stretch gap-1.5 rounded-xl border px-1.5 py-1", className)}
        style={{
          borderColor: GOLD_BORDER_IDLE,
          background: ENGAGEMENT_BG,
          backdropFilter: "blur(10px)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -10px 28px rgba(0,0,0,0.4)",
        }}
      >
        {/* Cell 1: type-specific action — glow colour follows card tone */}
        <ChurchEngagementCell
          glyph={def.glyph}
          label={def.label}
          sub={def.sub}
          value={state.primaryCount}
          active={state.primaryActive}
          accent={primaryAccent}
          onClick={callbacks.onPrimary}
        />

        <Divider />

        {/* Cell 2: comment */}
        <ChurchEngagementCell
          icon={MessageCircle}
          label="تعليق"
          sub="أضف رأيك"
          value={state.commentCount}
          accent="#5b8fd1"
          onClick={callbacks.onComment}
        />

        <Divider />

        {/* Cell 3: share */}
        <ChurchEngagementCell
          icon={Share2}
          label="مشاركة"
          sub="انشر البركة"
          value={state.shareCount}
          accent="#c98a3c"
          onClick={callbacks.onShare}
        />
      </div>
    </>
  );
}
