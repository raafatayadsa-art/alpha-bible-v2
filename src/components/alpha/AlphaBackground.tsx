import { cn } from "@/lib/utils";
import {
  getAlphaBackgroundCss,
  type AlphaBackgroundVariant,
} from "./alpha-background";
import {
  alphaTopDebugBorderStyle,
  isAlphaTopDebugActive,
  useAlphaTopDebugTarget,
} from "./alpha-top-debug";
import { useResolvedTheme } from "@/lib/alpha-theme";

type AlphaBackgroundProps = {
  variant: AlphaBackgroundVariant;
  /** fixed = viewport (global shell). absolute = inside preview phone frame. */
  scope?: "fixed" | "absolute";
  className?: string;
};

/**
 * Single global shell decorative layer (top radial bowl).
 * Route-level gradients are unchanged until migration — this stacks additively on Variant B.
 */
export function AlphaBackground({
  variant,
  scope = "fixed",
  className,
}: AlphaBackgroundProps) {
  const { isDark } = useResolvedTheme();
  const gradient = isDark ? undefined : getAlphaBackgroundCss(variant);
  const topDebug = useAlphaTopDebugTarget();
  const fixedBgActive = scope === "fixed" && isAlphaTopDebugActive(6, topDebug);

  return (
    <div
      aria-hidden
      data-alpha-background
      data-alpha-background-variant={variant}
      data-alpha-top-debug={fixedBgActive ? "fixed-background" : undefined}
      className={cn(
        "pointer-events-none inset-0 z-[0]",
        scope === "fixed" ? "fixed" : "absolute",
        className,
      )}
      style={{
        backgroundColor: "var(--alpha-bg-base)",
        backgroundImage: gradient,
        ...alphaTopDebugBorderStyle(fixedBgActive),
      }}
    />
  );
}
