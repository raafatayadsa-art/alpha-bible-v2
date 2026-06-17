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
        className={`mt-0.5 max-w-[72px] truncate tabular-nums tracking-wide ${
          isFlat
            ? "text-[9px] font-semibold text-[#1b4332]"
            : "text-[7px] font-bold text-neon-green/85"
        }`}
      >
        {shortCode}
      </span>
    </button>
  );
}
