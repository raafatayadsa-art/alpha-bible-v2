import type { LucideIcon } from "lucide-react";

type ToolTone = "gold" | "navy";

const palettes: Record<ToolTone, { light: string; base: string; dark: string; glow: string; border: string }> = {
  gold: {
    light: "#f5e6b8",
    base: "#d4a93a",
    dark: "#7a5a18",
    glow: "rgba(184, 137, 58, 0.42)",
    border: "rgba(212, 175, 55, 0.45)",
  },
  navy: {
    light: "#c8d4ef",
    base: "#4a6bb5",
    dark: "#1e2b54",
    glow: "rgba(61, 90, 154, 0.38)",
    border: "rgba(61, 90, 154, 0.38)",
  },
};

export function BibleV2QuickToolIcon({
  icon: Icon,
  tone = "gold",
}: {
  icon: LucideIcon;
  tone?: ToolTone;
}) {
  const palette = palettes[tone];

  return (
    <div className="relative shrink-0" style={{ width: 52, height: 52 }}>
      <div
        className="relative grid h-full w-full place-items-center overflow-hidden"
        style={{
          borderRadius: 18,
          background: `radial-gradient(130% 110% at 30% 16%, ${palette.light} 0%, ${palette.base}88 48%, ${palette.dark}33 100%)`,
          border: `1px solid ${palette.border}`,
          boxShadow: [
            "inset 0 2px 0 rgba(255,255,255,0.9)",
            `inset 0 -10px 16px ${palette.dark}22`,
            `0 12px 26px -10px ${palette.glow}`,
            "0 4px 10px -6px rgba(120,80,30,0.14)",
          ].join(", "),
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[14%] top-[7%] h-[40%] rounded-full"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.06) 100%)",
            filter: "blur(0.5px)",
          }}
        />
        <Icon
          className="relative z-[1] h-[22px] w-[22px]"
          style={{ color: palette.dark, filter: "drop-shadow(0 2px 3px rgba(255,255,255,0.35))" }}
          strokeWidth={1.85}
        />
      </div>
    </div>
  );
}
