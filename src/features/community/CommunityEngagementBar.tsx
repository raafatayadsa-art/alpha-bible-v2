import { useState, type MouseEvent } from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommunityMomentKind } from "./community-types";
import { COMMUNITY_KIND_META } from "./community-types";

const ENGAGEMENT_BG = "rgba(18,10,4,0.52)";
const GOLD = "#f0d78c";
const GOLD_BORDER_IDLE = "rgba(240,215,140,0.14)";
const CELL_BG_IDLE =
  "linear-gradient(180deg, rgba(240,215,140,0.03) 0%, rgba(0,0,0,0.48) 100%)";

function EngagementCell({
  glyph,
  label,
  sub,
  value,
  active,
  accent,
  icon: Icon,
  onClick,
}: {
  glyph?: string;
  label: string;
  sub: string;
  value: number;
  active?: boolean;
  accent: string;
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

  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={handleClick}
      aria-pressed={active ? "true" : undefined}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-2",
        "transition-all active:scale-[0.96]",
        onClick ? "cursor-pointer touch-manipulation" : "cursor-default",
      )}
      style={{
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: active || pressing ? `${accent}88` : GOLD_BORDER_IDLE,
        background:
          active || pressing
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
            className="select-none font-black leading-none text-[18px]"
            style={{
              background: "linear-gradient(180deg, #ffd86a 0%, #c79356 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {glyph}
          </span>
        ) : null}
        {Icon ? (
          <Icon
            aria-hidden
            className="h-3.5 w-3.5 shrink-0"
            strokeWidth={2.2}
            style={{ color: active ? accent : GOLD }}
          />
        ) : null}
        <span className="font-black tabular-nums leading-none text-white text-[14px]">{value}</span>
      </div>
      <p className="w-full text-center leading-tight text-[9px]">
        <span className="font-extrabold" style={{ color: active ? accent : GOLD }}>
          {label}
        </span>{" "}
        <span className="font-medium text-white/40">· {sub}</span>
      </p>
    </Tag>
  );
}

type Props = {
  kind: CommunityMomentKind;
  primaryCount: number;
  primaryActive: boolean;
  commentCount: number;
  onPrimary: () => void;
  onComment: () => void;
};

export function CommunityEngagementBar({
  kind,
  primaryCount,
  primaryActive,
  commentCount,
  onPrimary,
  onComment,
}: Props) {
  const meta = COMMUNITY_KIND_META[kind];

  return (
    <div
      className="flex items-stretch gap-1.5 rounded-xl border px-1.5 py-1"
      style={{
        borderColor: GOLD_BORDER_IDLE,
        background: ENGAGEMENT_BG,
        backdropFilter: "blur(10px)",
      }}
    >
      <EngagementCell
        glyph="Ⲁ"
        label={meta.primaryLabel}
        sub={meta.primarySub}
        value={primaryCount}
        active={primaryActive}
        accent={meta.accent}
        onClick={onPrimary}
      />
      <div aria-hidden className="my-1 w-px shrink-0 bg-gradient-to-b from-transparent via-[#e7c97a]/25 to-transparent" />
      <EngagementCell
        icon={MessageCircle}
        label="تعليق"
        sub="شجّع أخاك"
        value={commentCount}
        accent="#5b8fd1"
        onClick={onComment}
      />
    </div>
  );
}
