import type { LucideIcon } from "lucide-react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

/** Visual tokens for the Standard Alpha Control Bar (Presentation Mode DNA). */
export function useAlphaControlTheme(dark: boolean) {
  return {
    barBg: dark
      ? "bg-[#0e2a22]/55 border-[#5aa78a]/30 shadow-[0_18px_50px_-22px_rgba(0,30,20,0.65)]"
      : "bg-[#e6f2ea]/55 border-[#9ec9b4]/55 shadow-[0_18px_50px_-22px_rgba(20,80,55,0.30)]",
    ctrlBtn: dark
      ? "bg-white/[0.05] border-[#7fc2a4]/25 text-[#dff3e8] backdrop-blur hover:bg-white/[0.08]"
      : "bg-white/55 border-[#9ec9b4]/55 text-[#1f4a38] backdrop-blur hover:bg-white/70",
    textShadow: dark
      ? ({ textShadow: "0 1px 2px rgba(0,0,0,0.55)" } as const)
      : ({ textShadow: "0 1px 1px rgba(20,60,40,0.18)" } as const),
    divider: dark ? "bg-[#7fc2a4]/30" : "bg-[#2f6e54]/20",
  };
}

export function AlphaControlMark({ dark, className }: { dark?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "text-[10px] font-extrabold tracking-[0.3em] leading-none select-none",
        dark ? "text-[#bfe5d3]/55" : "text-[#2f6e54]/70",
        className,
      )}
    >
      Ⲁ
    </span>
  );
}

export function AlphaControlBarShell({
  dark,
  children,
  className,
}: {
  dark?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const theme = useAlphaControlTheme(Boolean(dark));
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border backdrop-blur-2xl px-1.5 py-1",
        theme.barBg,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AlphaControlDivider({ dark }: { dark?: boolean }) {
  const theme = useAlphaControlTheme(Boolean(dark));
  return <span className={cn("mx-0.5 h-5 w-px shrink-0", theme.divider)} aria-hidden />;
}

export function AlphaControlPlayButton({
  playing,
  onToggle,
  dark,
  size = "md",
}: {
  playing: boolean;
  onToggle: () => void;
  dark?: boolean;
  size?: "md" | "sm";
}) {
  const h = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <button
      type="button"
      aria-label={playing ? "إيقاف التمرير" : "تشغيل التمرير"}
      onClick={onToggle}
      className={cn(
        "grid place-items-center rounded-full text-white bg-gradient-to-br from-[#5aa78a] to-[#1f5a42] border border-white/25 active:scale-95 transition-all",
        h,
        playing
          ? "shadow-[0_0_16px_rgba(90,167,138,0.85),0_0_30px_rgba(47,110,84,0.45)] ring-1 ring-[#bfe5d3]/60"
          : "shadow-[0_6px_14px_-6px_rgba(20,80,55,0.6)] ring-1 ring-[#bfe5d3]/35",
      )}
    >
      {playing ? (
        <Pause className={cn(icon, "fill-white")} />
      ) : (
        <Play className={cn(icon, "fill-white translate-x-[1px]")} />
      )}
    </button>
  );
}

export function AlphaControlCycleButton({
  icon: Icon,
  label,
  ariaLabel,
  onClick,
  dark,
  compact,
}: {
  icon: LucideIcon;
  label: string;
  ariaLabel: string;
  onClick: () => void;
  dark?: boolean;
  compact?: boolean;
}) {
  const theme = useAlphaControlTheme(Boolean(dark));
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      style={theme.textShadow}
      onClick={onClick}
      className={cn(
        "rounded-full font-bold border inline-flex items-center gap-1 active:scale-95 transition-transform",
        compact ? "h-7 px-2 text-[10.5px]" : "h-8 px-2.5 text-[11px]",
        theme.ctrlBtn,
      )}
    >
      <Icon className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      <span>{label}</span>
    </button>
  );
}

export function AlphaControlIconButton({
  icon: Icon,
  ariaLabel,
  onClick,
  dark,
  disabled,
  children,
}: {
  icon?: LucideIcon;
  ariaLabel: string;
  onClick: () => void;
  dark?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  const theme = useAlphaControlTheme(Boolean(dark));
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      style={theme.textShadow}
      onClick={onClick}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full border active:scale-95 transition-transform disabled:opacity-40",
        theme.ctrlBtn,
      )}
    >
      {children ?? (Icon ? <Icon className="h-3.5 w-3.5" /> : null)}
    </button>
  );
}

export function AlphaControlFontStepper({
  value,
  onDecrease,
  onIncrease,
  dark,
  min,
  max,
  decreaseIcon: DecreaseIcon,
  increaseIcon: IncreaseIcon,
}: {
  value: number | string;
  onDecrease: () => void;
  onIncrease: () => void;
  dark?: boolean;
  min?: number;
  max?: number;
  decreaseIcon: LucideIcon;
  increaseIcon: LucideIcon;
}) {
  const theme = useAlphaControlTheme(Boolean(dark));
  const atMin = typeof min === "number" && typeof value === "number" ? value <= min : false;
  const atMax = typeof max === "number" && typeof value === "number" ? value >= max : false;
  return (
    <>
      <button
        type="button"
        aria-label="تصغير الخط"
        disabled={atMin}
        style={theme.textShadow}
        onClick={onDecrease}
        className={cn(
          "grid h-8 w-8 place-items-center rounded-full border active:scale-95 transition-transform disabled:opacity-40",
          theme.ctrlBtn,
        )}
      >
        <DecreaseIcon className="h-3 w-3" />
      </button>
      <span
        className="min-w-8 text-center text-[10.5px] font-bold tabular-nums px-0.5"
        style={theme.textShadow}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="تكبير الخط"
        disabled={atMax}
        style={theme.textShadow}
        onClick={onIncrease}
        className={cn(
          "grid h-8 w-8 place-items-center rounded-full border active:scale-95 transition-transform disabled:opacity-40",
          theme.ctrlBtn,
        )}
      >
        <IncreaseIcon className="h-4 w-4" />
      </button>
    </>
  );
}
