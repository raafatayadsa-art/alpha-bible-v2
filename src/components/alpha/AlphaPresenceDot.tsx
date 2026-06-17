import { presenceDotClassName } from "@/features/alpha-connect/presence";
import { usePresenceDot } from "@/features/alpha-connect/useAlphaPresence";
import { cn } from "@/lib/utils";

type AlphaPresenceDotProps = {
  userId: string;
  size?: "xs" | "sm" | "md";
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

export function AlphaPresenceDot({
  userId,
  size = "sm",
  className,
  onClick,
  ariaLabel,
}: AlphaPresenceDotProps) {
  const status = usePresenceDot(userId);
  if (!status) return null;

  const Tag = onClick ? "button" : "span";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(presenceDotClassName(status, size), className, onClick ? "cursor-pointer" : undefined)}
    />
  );
}
