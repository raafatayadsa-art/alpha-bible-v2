/**
 * Alpha responsive tokens — JS/TS mirror of alpha-responsive.css custom properties.
 * Use for inline styles where CSS classes cannot express dynamic values.
 */

export const ALPHA_RESPONSIVE_BPS = {
  largePhone: 600,
  tablet: 768,
  largeTablet: 1024,
  desktop: 1367,
} as const;

/** Mobile-default frame width — fluid; see alpha-responsive.css */
export const ALPHA_FRAME_MAX_WIDTH_MOBILE = "100%";

/** Tailwind-friendly max-width token classes (see alpha-responsive.css). */
export const ALPHA_TW = {
  contentMax: "max-w-[var(--alpha-content-max-width)]",
  contentNarrow: "max-w-[var(--alpha-content-narrow-width)]",
  dockMax: "max-w-[var(--alpha-dock-max-width)]",
  readerMax: "max-w-[var(--alpha-reader-max-width)]",
  frameMax: "max-w-[var(--alpha-frame-max-width)]",
} as const;

/** Clamp user reading-width preference to responsive reader cap. */
export function readingWidthStyle(prefPx: number): { width: string; maxWidth: string } {
  return {
    width: "100%",
    maxWidth: `min(${prefPx}px, var(--alpha-reader-max-width))`,
  };
}

/** Overlay / sheet panels — match content column width. */
export const ALPHA_OVERLAY_PANEL = "alpha-overlay-panel" as const;

/** Carousel / card sizing tied to content column. */
export function contentColumnCalc(extraRem = "2rem"): string {
  return `calc((100vw - ${extraRem} - 2 * var(--alpha-content-padding-x) - 0.625rem) / 2.35)`;
}
