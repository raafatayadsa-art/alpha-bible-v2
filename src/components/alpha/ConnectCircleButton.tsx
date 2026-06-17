import type { ButtonHTMLAttributes, ComponentType } from "react";

export type ConnectCircleTone = "green" | "blue" | "red" | "neutral";

export function ConnectCircleButton({
  icon: Icon,
  label,
  sublabel,
  tone,
  size = "large",
  onClick,
  pressHandlers,
  transmitting = false,
  pulse = true,
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  sublabel?: string;
  tone: ConnectCircleTone;
  size?: "large" | "small";
  onClick?: () => void;
  pressHandlers?: ButtonHTMLAttributes<HTMLButtonElement>;
  transmitting?: boolean;
  pulse?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const isLarge = size === "large";
  const iconColor =
    tone === "green"
      ? "text-neon-green"
      : tone === "blue"
        ? "text-neon-blue"
        : tone === "red"
          ? "text-destructive"
          : "text-foreground/90";
  const labelColor =
    tone === "green"
      ? "text-neon-green"
      : tone === "blue"
        ? "text-neon-blue"
        : tone === "red"
          ? "text-destructive"
          : "text-muted-foreground";

  if (!isLarge) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`flex w-[72px] flex-col items-center gap-1.5 active:scale-95 disabled:opacity-70 ${className ?? ""}`}
      >
        <div className="glass flex h-14 w-14 items-center justify-center rounded-full border border-white/10">
          <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={2.1} />
        </div>
        <span className="text-center text-[10px] leading-tight text-muted-foreground">{label}</span>
      </button>
    );
  }

  const isMicGreen = tone === "green";
  const ringAlpha = isMicGreen ? "0.82_0.22_145" : tone === "red" ? "0.65_0.22_25" : "0.72_0.18_235";
  const pulseClass = pulse
    ? tone === "green"
      ? "connect-pulse-wrap--green"
      : tone === "blue"
        ? "connect-pulse-wrap--blue"
        : tone === "red"
          ? "connect-pulse-wrap--red"
          : ""
    : "";
  const faceClass =
    tone === "green" ? "connect-mic-face neon-ring" : tone === "red" ? "neon-ring-red" : "";
  const background =
    tone === "red" ? "var(--gradient-end-call)" : tone === "green" ? "var(--gradient-mic)" : "var(--gradient-mic)";
  const neonRingStyle =
    tone === "blue"
      ? {
          boxShadow:
            "0 0 0 1px oklch(0.72 0.18 235 / 0.7), 0 0 30px oklch(0.72 0.18 235 / 0.45), inset 0 0 30px oklch(0.72 0.18 235 / 0.15)",
        }
      : undefined;
  const iconGlow =
    tone === "red"
      ? "drop-shadow-[0_0_10px_oklch(0.65_0.22_25)]"
      : tone === "green"
        ? "drop-shadow-[0_0_10px_var(--neon-green)]"
        : "drop-shadow-[0_0_10px_var(--neon-blue)]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...pressHandlers}
      className={`flex w-[108px] flex-col items-center gap-2 active:scale-[0.98] disabled:opacity-70 ${
        pressHandlers ? "touch-none select-none" : ""
      } ${pressHandlers?.className ?? ""} ${className ?? ""}`}
    >
      <span
        className={`relative flex h-[112px] w-[112px] items-center justify-center${isMicGreen ? " connect-mic-stage" : ""}`}
      >
        {isMicGreen ? (
          <>
            <span aria-hidden className="connect-mic-deco-1 absolute inset-0 rounded-full border border-dashed" />
            <span aria-hidden className="connect-mic-deco-2 absolute inset-2 rounded-full border border-dotted" />
            <span aria-hidden className="connect-mic-deco-3 absolute inset-4 rounded-full border border-dotted" />
          </>
        ) : (
          <>
            <span
              aria-hidden
              className={`absolute inset-0 rounded-full border border-dashed border-[oklch(${ringAlpha}/0.15)]`}
            />
            <span
              aria-hidden
              className={`absolute inset-2 rounded-full border border-dotted border-[oklch(${ringAlpha}/0.2)]`}
            />
            <span
              aria-hidden
              className={`absolute inset-4 rounded-full border border-dotted border-[oklch(${ringAlpha}/0.25)]`}
            />
          </>
        )}
        <span
          aria-hidden
          className={`${pulse ? "connect-pulse-wrap" : ""} ${pulseClass} ${
            pulse && transmitting ? "connect-pulse-wrap--transmitting" : ""
          } relative flex h-[88px] w-[88px] items-center justify-center rounded-full`}
        >
          <span
            className={`relative flex h-[88px] w-[88px] items-center justify-center rounded-full ${faceClass} ${
              transmitting && tone === "green" ? "connect-mic-transmitting" : ""
            }`}
            style={{ background, ...neonRingStyle }}
          >
            <span
              aria-hidden
              className={`absolute inset-2 rounded-full border ${
                isMicGreen ? "connect-mic-deco-face" : `border-[oklch(${ringAlpha}/0.3)]`
              }`}
            />
            <Icon className={`relative z-10 h-7 w-7 ${iconColor} ${iconGlow}`} strokeWidth={2.2} />
          </span>
        </span>
      </span>
      <div className="flex min-h-[44px] flex-col items-center justify-start text-center">
        <p className={`text-[11px] font-semibold leading-tight ${labelColor}${tone === "green" ? " connect-mic-label" : ""}`}>
          {label}
        </p>
        <p className="mt-0.5 min-h-[14px] text-[9px] text-muted-foreground">{sublabel ?? ""}</p>
      </div>
    </button>
  );
}
