import type { LucideIcon } from "lucide-react";
import { bibleV2IconScale, bibleV2Tokens } from "../tokens";

type ToolTone = "gold" | "navy";

const toneStyles: Record<
  ToolTone,
  { background: string; border: string; icon: string; shadow: string }
> = {
  gold: {
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(248,236,210,0.72) 100%)",
    border: "rgba(212,175,55,0.28)",
    icon: bibleV2Tokens.goldDeep,
    shadow: "0 6px 16px -10px rgba(184,137,58,0.35), inset 0 1px 0 rgba(255,255,255,0.9)",
  },
  navy: {
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(224,232,248,0.72) 100%)",
    border: "rgba(61,90,154,0.22)",
    icon: bibleV2Tokens.navy,
    shadow: "0 6px 16px -10px rgba(30,43,84,0.22), inset 0 1px 0 rgba(255,255,255,0.9)",
  },
};

export function BibleV2QuickToolIcon({
  icon: Icon,
  tone = "gold",
}: {
  icon: LucideIcon;
  tone?: ToolTone;
}) {
  const palette = toneStyles[tone];
  const { shell, glyph, radius } = bibleV2IconScale.tool;

  return (
    <div
      className="grid shrink-0 place-items-center border backdrop-blur-sm"
      style={{
        width: shell,
        height: shell,
        borderRadius: radius,
        background: palette.background,
        borderColor: palette.border,
        boxShadow: palette.shadow,
      }}
    >
      <Icon className="shrink-0" style={{ width: glyph, height: glyph, color: palette.icon }} strokeWidth={2} />
    </div>
  );
}
