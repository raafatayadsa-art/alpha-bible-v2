import type { CSSProperties } from "react";
import {
  BookOpen,
  ScrollText,
  Cross,
  Mail,
  Send,
  CheckCircle2,
  Circle,
} from "lucide-react";
import type { DailyReading, ReadingStatus, ReadingType } from "../types";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKatamerosPress } from "./KatamerosPressEffects";

export const READING_ICON: Record<ReadingType, typeof BookOpen> = {
  psalm: ScrollText,
  gospel: BookOpen,
  pauline: Mail,
  catholic: Cross,
  praxis: Send,
};

export const READING_TONE: Record<ReadingType, string> = {
  psalm: "#6a4ab5",
  gospel: "#b8893a",
  pauline: "#3a6a9b",
  catholic: "#b8423a",
  praxis: "#3e7a55",
};

type ReadingIconSize = "xs" | "compact" | "medium" | "large";

const READING_ICON_SIZES: Record<ReadingIconSize, string> = {
  xs: "h-7 w-7",
  compact: "h-8 w-8",
  medium: "h-10 w-10",
  large: "h-11 w-11",
};

const READING_GLYPH_SIZES: Record<ReadingIconSize, string> = {
  xs: "h-3.5 w-3.5",
  compact: "h-4 w-4",
  medium: "h-[18px] w-[18px]",
  large: "h-5 w-5",
};

function readingIcon3dStyle(tone: string, pressed = false): CSSProperties {
  return {
    borderColor: `${tone}22`,
    background: `linear-gradient(155deg, rgba(255,255,255,0.42) 0%, ${tone}1a 38%, ${tone}28 100%)`,
    boxShadow: pressed
      ? `inset 0 2px 5px rgba(0,0,0,0.14), 0 1px 3px -1px ${tone}22`
      : `inset 0 1px 0 rgba(255,255,255,0.72), inset 0 -2px 4px rgba(0,0,0,0.07), 0 5px 12px -5px ${tone}33, 0 2px 4px -2px rgba(0,0,0,0.1)`,
  };
}

/** Mission-control style reading section icon — soft 3D tinted glass tile. */
export function KatamerosReadingIcon({
  type,
  size = "medium",
  className,
  interactive = false,
}: {
  type: ReadingType;
  size?: ReadingIconSize;
  className?: string;
  interactive?: boolean;
}) {
  const tone = READING_TONE[type];
  const Icon = READING_ICON[type];

  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center rounded-[14px] border",
        READING_ICON_SIZES[size],
        interactive && "transition-all duration-200 ease-out group-active:scale-[0.96] group-active:translate-y-[1px]",
        className,
      )}
      style={readingIcon3dStyle(tone)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-1 top-0.5 h-[38%] rounded-t-[12px] bg-gradient-to-b from-white/50 to-transparent"
      />
      <Icon
        className={cn(
          "relative z-[1]",
          READING_GLYPH_SIZES[size],
          interactive && "transition-transform duration-200 group-active:scale-95",
        )}
        style={{
          color: tone,
          filter: `drop-shadow(0 1px 0 rgba(255,255,255,0.35)) drop-shadow(0 2px 3px ${tone}44)`,
        }}
        strokeWidth={2.25}
      />
    </div>
  );
}

type ReadingProgressColumnProps = {
  reading: DailyReading;
  status: ReadingStatus;
  isActive: boolean;
  onOpen: () => void;
  statusBadge: React.ReactNode;
};

/** Reading row for the main Katameros screen (no progress ring). */
export function ReadingProgressColumn({
  reading,
  status,
  isActive,
  onOpen,
  statusBadge,
}: ReadingProgressColumnProps) {
  const tone = READING_TONE[reading.type];
  const { pressing, onPointerDown, onPointerUp, onPointerLeave, onPointerCancel } = useKatamerosPress({
    haptic: true,
    shimmer: false,
  });

  const lit = isActive || status === "in-progress" || pressing;

  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerCancel}
      className={cn(
        "group relative w-full overflow-hidden text-right rounded-2xl border p-3 flex items-center gap-3",
        "transition-all duration-200 ease-out active:scale-[0.985] active:translate-y-[1px]",
        lit
          ? "bg-[#faf6ec]/72 backdrop-blur-md shadow-[0_14px_28px_-12px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.75)]"
          : "bg-[#faf6ec]/62 backdrop-blur-md shadow-[0_10px_24px_-14px_rgba(120,80,30,0.38),inset_0_1px_0_rgba(255,255,255,0.7)]",
      )}
      style={{
        borderColor: pressing ? `${tone}22` : lit ? `${tone}30` : "#d4c4a8cc",
        boxShadow: pressing
          ? `0 0 0 1px ${tone}14, 0 8px 18px -14px ${tone}18`
          : status === "completed"
            ? `0 8px 20px -14px ${tone}22, inset 0 0 0 1px ${tone}10`
            : isActive
              ? `0 0 0 1px ${tone}14, 0 10px 22px -14px ${tone}18`
              : undefined,
      }}
    >
      <KatamerosReadingIcon type={reading.type} size="medium" interactive />
      <div className="min-w-0 flex-1">
        <div className="font-arabic-serif text-[14px] font-extrabold text-[#3a2a18] leading-tight">
          {reading.title}
        </div>
        <div className="text-[10px] text-[#6a543a] mt-0.5">{reading.source}</div>
      </div>
      {statusBadge}
    </button>
  );
}

/** Premium glass preview of the next reading — shown after the current card. */
export function KatamerosNextReadingCard({
  reading,
  onOpen,
  className,
  compact = false,
}: {
  reading: DailyReading;
  onOpen: () => void;
  className?: string;
  compact?: boolean;
}) {
  const tone = READING_TONE[reading.type];
  const { pressing, onPointerDown, onPointerUp, onPointerLeave, onPointerCancel } = useKatamerosPress({
    haptic: true,
    shimmer: false,
  });

  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerCancel}
      className={cn(
        "group relative overflow-hidden w-full text-right backdrop-blur-md transition-all duration-200 ease-out active:scale-[0.985] active:translate-y-[1px]",
        compact
          ? "mt-2 rounded-xl border border-[#d4c4a8]/50 bg-[#faf6ec]/52 p-2 shadow-[0_6px_16px_-14px_rgba(120,80,30,0.28),inset_0_1px_0_rgba(255,255,255,0.55)]"
          : "mt-3 rounded-2xl border border-[#d4c4a8]/60 bg-[#faf6ec]/64 p-2.5 shadow-[0_10px_24px_-16px_rgba(120,80,30,0.35),inset_0_1px_0_rgba(255,255,255,0.68)]",
        pressing && (compact ? "border-[#d4c4a8]/65 bg-[#faf6ec]/60" : "border-[#d4c4a8]/75 bg-[#faf6ec]/72"),
        className,
      )}
      style={{
        boxShadow: pressing
          ? `inset 0 1px 0 rgba(255,255,255,0.45), 0 0 0 1px ${tone}12, 0 10px 24px -18px ${tone}14`
          : `inset 0 1px 0 rgba(255,255,255,0.45), 0 12px 28px -18px ${tone}18`,
      }}
    >
      <div
        aria-hidden
        className={cn("pointer-events-none absolute inset-0 opacity-40", compact ? "rounded-xl" : "rounded-2xl")}
        style={{
          background: `radial-gradient(ellipse 85% 70% at 0% 0%, ${tone}08, transparent 58%)`,
        }}
      />

      <div className={cn("relative flex items-center", compact ? "gap-1.5" : "gap-2")}>
        <KatamerosReadingIcon type={reading.type} size={compact ? "xs" : "compact"} interactive />

        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full border border-[#d4c4a8]/65 font-bold text-[#b8893a]",
              compact ? "bg-[#faf6ec]/70 px-1.5 py-px text-[7.5px] mb-0.5" : "bg-[#faf6ec]/78 px-2 py-0.5 text-[8.5px] mb-1",
            )}
          >
            {!compact ? <span className="h-1 w-1 rounded-full bg-[#b8893a]" /> : null}
            القراءة التالية
          </div>
          <div
            className={cn(
              "font-arabic-serif font-extrabold text-[#3a2a18] leading-tight line-clamp-1",
              compact ? "text-[11.5px]" : "text-[13px]",
            )}
          >
            {reading.title}
          </div>
          {!compact ? (
            <div className="text-[9.5px] text-[#6a543a] mt-0.5 line-clamp-1">{reading.source}</div>
          ) : null}
        </div>

        <ChevronLeft
          className={cn(
            "text-[#6a543a] shrink-0 transition-transform group-active:translate-x-[-2px]",
            compact ? "h-3 w-3" : "h-3.5 w-3.5",
          )}
        />
      </div>
    </button>
  );
}

/** Hero progress strip — golden shimmer + glass press on dark hero card. */
export function KatamerosHeroProgressCard({
  reading,
  progressPercent,
  inProgress,
  onOpen,
}: {
  reading: DailyReading;
  progressPercent: number;
  inProgress: boolean;
  onOpen: () => void;
}) {
  const tone = READING_TONE[reading.type];
  const { pressing, onPointerDown, onPointerUp, onPointerLeave, onPointerCancel, rippleLayer } =
    useKatamerosPress({ haptic: true, shimmer: true });

  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerCancel}
      className={cn(
        "group relative mt-auto w-full overflow-hidden text-right border-t px-4 py-3",
        "transition-all duration-200 ease-out active:scale-[0.985] active:translate-y-[1px]",
        pressing
          ? "border-[#d4c4a8]/35 bg-[#faf6ec]/28 backdrop-blur-md"
          : "border-[#d4c4a8]/25 bg-[#faf6ec]/18 backdrop-blur-[2px]",
      )}
      style={{
        boxShadow: pressing ? `inset 0 1px 0 rgba(255,255,255,0.1), 0 0 18px -14px ${tone}18` : undefined,
      }}
    >
      {rippleLayer}
      <div className="relative flex items-center gap-2">
        <KatamerosReadingIcon type={reading.type} size="xs" interactive />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-[8.5px] font-bold text-[#f0dfaa]/80 drop-shadow-sm">
              {inProgress ? "استكمال القراءة" : "القراءة الحالية"}
            </span>
            <span className="text-[8.5px] font-bold text-[#fefce8]/80 drop-shadow-sm tabular-nums">
              {progressPercent}%
            </span>
          </div>
          <div className="font-arabic-serif text-[11.5px] font-extrabold text-[#fdfbf7]/90 leading-tight drop-shadow-md line-clamp-1">
            {reading.title}
          </div>
        </div>
      </div>
      <div className="relative mt-2 h-1 w-full overflow-hidden rounded-full bg-black/20">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progressPercent}%`,
            background: "linear-gradient(to left, #f0dfaa, #c4974a)",
            boxShadow: pressing
              ? "0 0 6px rgba(240, 223, 170, 0.28)"
              : "0 0 8px rgba(240, 223, 170, 0.22)",
          }}
        />
      </div>
    </button>
  );
}

export function KatamerosStatusBadge({
  status,
  tone,
}: {
  status: ReadingStatus;
  tone?: string;
}) {
  if (status === "completed") {
    const c = tone ?? "#1f6e54";
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full text-[9.5px] font-bold px-2 h-6 border shrink-0"
        style={{ background: `${c}14`, borderColor: `${c}40`, color: c }}
      >
        <CheckCircle2 className="h-3 w-3" />
        مكتمل
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#fdf0f0] border border-[#e8b4b4] text-[#b8423a] text-[9.5px] font-bold px-2 h-6 shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-[#b8423a] animate-pulse" />
        قيد القراءة
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#fbf3e1] border border-[#ead9b1] text-[#6a543a] text-[9.5px] font-bold px-2 h-6 shrink-0">
      <Circle className="h-3 w-3" />
      لم تبدأ
    </span>
  );
}
