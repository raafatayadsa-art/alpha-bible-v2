import { cn } from "@/lib/utils";
import {
  ALPHA_BACKGROUND_BASE,
  getAlphaBackgroundCss,
  type AlphaBackgroundVariant,
} from "./alpha-background";

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
  const gradient = getAlphaBackgroundCss(variant);

  return (
    <div
      aria-hidden
      data-alpha-background
      data-alpha-background-variant={variant}
      className={cn(
        "pointer-events-none inset-0 z-[0]",
        scope === "fixed" ? "fixed" : "absolute",
        className,
      )}
      style={{
        backgroundColor: ALPHA_BACKGROUND_BASE,
        backgroundImage: gradient,
      }}
    />
  );
}
