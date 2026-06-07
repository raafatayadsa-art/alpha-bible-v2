import { AlphaGlyph } from "@/components/controls/alpha-glyphs";
import { AlphaIcon3D } from "@/components/controls/AlphaIcon3D";
import {
  ALPHA_ICON_REGISTRY,
  ALPHA_ICON_SIZES,
  type AlphaIconKind,
  type AlphaIconSize,
} from "@/components/controls/alpha-icon-registry";

export function AlphaPremiumIcon({
  kind,
  size = "md",
  color,
  active = false,
  className,
}: {
  kind: AlphaIconKind;
  size?: AlphaIconSize;
  color?: string;
  active?: boolean;
  className?: string;
}) {
  const def = ALPHA_ICON_REGISTRY[kind];
  const accent = color ?? def.accent;
  const dim = ALPHA_ICON_SIZES[size];

  return (
    <AlphaIcon3D color={accent} size={dim.shell} isOpen={active} className={className}>
      <AlphaGlyph kind={kind} size={dim.glyph} color={accent} />
    </AlphaIcon3D>
  );
}
