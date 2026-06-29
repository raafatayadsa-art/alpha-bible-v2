import type { LucideIcon } from "lucide-react";

export function ProfileAccentIcon({
  icon: Icon,
  accent,
  size = "md",
}: {
  icon: LucideIcon;
  accent: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg" ? "h-[52px] w-[52px] rounded-[18px]" : size === "md" ? "h-12 w-12 rounded-[16px]" : "h-11 w-11 rounded-[15px]";
  const iconDim =
    size === "lg" ? "h-[22px] w-[22px]" : size === "md" ? "h-5 w-5" : "h-[18px] w-[18px]";

  return (
    <div
      className={`relative grid ${dim} shrink-0 place-items-center border shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]`}
      style={{
        borderColor: `${accent}42`,
        background: `linear-gradient(148deg, color-mix(in srgb, ${accent} 24%, white) 0%, color-mix(in srgb, ${accent} 10%, var(--alpha-surface)) 48%, var(--alpha-base) 100%)`,
        boxShadow: `0 6px 18px -10px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.22)`,
      }}
    >
      <Icon className={iconDim} style={{ color: accent }} strokeWidth={2.25} />
    </div>
  );
}
