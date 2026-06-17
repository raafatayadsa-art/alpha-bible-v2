import { getChannelInviteCode, getChannelInviteLink } from "./connect-channels-registry";
import { ConnectPremiumQrBadge } from "./ConnectPremiumQrBadge";

function buildShareInviteUrl(channelId: string): string {
  const deepLink = getChannelInviteLink(channelId);
  if (typeof window === "undefined") return deepLink;
  return `${window.location.origin}/alpha-connect?invite=${encodeURIComponent(deepLink)}`;
}

type ConnectChannelQrBadgeProps = {
  channelId: string;
  onCopied?: () => void;
  className?: string;
  variant?: "premium" | "flat";
  size?: number;
};

export function ConnectChannelQrBadge({ channelId, onCopied, className, variant = "flat", size = 52 }: ConnectChannelQrBadgeProps) {
  const code = getChannelInviteCode(channelId);
  const link = buildShareInviteUrl(channelId);
  const shortCode = code.replace(/^ALPHA-G-/i, "G·");

  return (
    <ConnectPremiumQrBadge
      qrValue={code}
      shortCode={shortCode}
      link={link}
      ariaLabel={`نسخ رابط دعوة القناة ${code}`}
      onCopied={onCopied}
      className={className}
      variant={variant}
      size={size}
    />
  );
}
