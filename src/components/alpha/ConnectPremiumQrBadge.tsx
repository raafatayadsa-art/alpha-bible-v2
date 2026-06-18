import { type MouseEvent } from "react";
import { AlphaQrCode } from "@/components/identity/AlphaQrCode";

type ConnectPremiumQrBadgeProps = {
  qrValue: string;
  shortCode: string;
  link: string;
  ariaLabel: string;
  onCopied?: () => void;
  className?: string;
  variant?: "premium" | "flat";
  size?: number;
};

export function ConnectPremiumQrBadge({
  qrValue,
  shortCode,
  link,
  ariaLabel,
  onCopied,
  className,
  variant = "premium",
  size = 44,
}: ConnectPremiumQrBadgeProps) {
  const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      /* clipboard may be unavailable */
    }
    onCopied?.();
  };

  const isFlat = variant === "flat";
  const qrFg = isFlat ? "1b4332" : "ffffff";
  const qrBg = isFlat ? "ffffff" : "050814";

  return (
    <button
      type="button"
      onClick={(event) => void handleCopy(event)}
      aria-label={ariaLabel}
      className={
        isFlat
          ? `connect-channel-qr-flat flex shrink-0 flex-col items-center transition-transform active:scale-95 ${className ?? ""}`
          : `connect-channel-qr-premium flex shrink-0 flex-col items-center rounded-2xl p-1 transition-transform active:scale-95 ${className ?? ""}`
      }
    >
      <div className={isFlat ? "connect-channel-qr-flat__canvas" : "connect-channel-qr-premium__inner rounded-xl bg-[#050814]/90 p-1"}>
        <AlphaQrCode
          value={qrValue}
          size={size}
          margin={isFlat ? 1 : 2}
          fgColor={qrFg}
          bgColor={qrBg}
          alt={ariaLabel}
          className={`block rounded-[3px] ${isFlat ? "connect-channel-qr-flat__img" : ""}`}
        />
      </div>
      <span
        className={`connect-user-code mt-0.5 max-w-[80px] truncate tabular-nums tracking-wider ${
          isFlat
            ? "text-[11px] font-bold text-[var(--connect-code-gold-muted,#d4a84b)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
            : "text-[8px] font-bold text-[var(--connect-code-gold,#e7b84a)] drop-shadow-[0_0_6px_rgba(231,184,74,0.35)]"
        }`}
      >
        {shortCode}
      </span>
    </button>
  );
}
