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
    size === "lg"
      ? "h-[54px] w-[54px] rounded-[20px]"
      : size === "md"
        ? "h-[50px] w-[50px] rounded-[18px]"
        : "h-11 w-11 rounded-[16px]";
  const iconDim =
    size === "lg" ? "h-[23px] w-[23px]" : size === "md" ? "h-[21px] w-[21px]" : "h-[18px] w-[18px]";

  return (
    <div className={`relative ${dim} shrink-0`}>
      {/* 3D glass plate */}
      <div
        className="absolute inset-0 rounded-[inherit] border backdrop-blur-md"
        style={{
          borderColor: "rgba(255,255,255,0.42)",
          background: `linear-gradient(155deg, color-mix(in srgb, ${accent} 18%, rgba(255,255,255,0.72)) 0%, color-mix(in srgb, ${accent} 8%, rgba(255,255,255,0.28)) 42%, color-mix(in srgb, ${accent} 14%, rgba(255,255,255,0.08)) 100%)`,
          boxShadow: `
            0 10px 22px -12px ${accent}66,
            0 4px 10px -6px rgba(40,28,12,0.22),
            inset 0 2px 0 rgba(255,255,255,0.55),
            inset 0 -3px 8px color-mix(in srgb, ${accent} 22%, transparent)
          `,
        }}
      />
      {/* Color wash */}
      <div
        aria-hidden
        className="absolute inset-[3px] rounded-[inherit] opacity-90"
        style={{
          background: `radial-gradient(circle at 28% 18%, color-mix(in srgb, ${accent} 35%, white) 0%, transparent 58%)`,
        }}
      />
      <div className="relative grid h-full w-full place-items-center">
        <Icon
          className={`${iconDim} drop-shadow-[0_1px_0_rgba(255,255,255,0.65)]`}
          style={{ color: accent }}
          strokeWidth={2.35}
        />
      </div>
    </div>
  );
}
