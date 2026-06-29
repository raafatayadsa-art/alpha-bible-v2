import type { LucideIcon } from "lucide-react";

const SIZES = {
  sm: { box: 40, icon: 18, radius: 12 },
  md: { box: 52, icon: 24, radius: 16 },
  lg: { box: 64, icon: 28, radius: 18 },
} as const;

export function FounderIcon3D({
  icon: Icon,
  accent,
  size = "md",
}: {
  icon: LucideIcon;
  accent: string;
  size?: keyof typeof SIZES;
}) {
  const s = SIZES[size];

  return (
    <div
      className="relative grid shrink-0 place-items-center border"
      style={{
        width: s.box,
        height: s.box,
        borderRadius: s.radius,
        borderColor: `${accent}70`,
        background: `linear-gradient(145deg, color-mix(in srgb, ${accent} 42%, white 8%) 0%, color-mix(in srgb, ${accent} 22%, #1C1C1E) 48%, #000000 100%)`,
        boxShadow: `
          0 10px 24px -8px rgba(0,0,0,0.75),
          0 0 28px -10px ${accent},
          inset 0 1px 0 rgba(255,255,255,0.28),
          inset 0 -4px 10px rgba(0,0,0,0.4)
        `,
        transform: "perspective(520px) rotateX(10deg) rotateY(-4deg)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[2px]"
        style={{
          borderRadius: s.radius - 2,
          background: "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, transparent 55%)",
        }}
      />
      <Icon
        className="relative z-[1]"
        style={{
          width: s.icon,
          height: s.icon,
          color: accent,
          filter: `drop-shadow(0 3px 6px color-mix(in srgb, ${accent} 65%, black))`,
        }}
        strokeWidth={2.25}
      />
    </div>
  );
}
