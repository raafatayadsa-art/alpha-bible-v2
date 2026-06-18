/** Temporary Katameros top-curve fix preview — not production default. */
export type KatamerosCurvePreviewVariant = "a" | "b" | "c";

export const KATAMEROS_CURVE_VARIANTS: KatamerosCurvePreviewVariant[] = ["a", "b", "c"];

export const KATAMEROS_CURVE_QUERY_KEY = "katamerosBg";

export const KATAMEROS_CURVE_LABELS: Record<KatamerosCurvePreviewVariant, string> = {
  a: "A — No PNG (flat shell)",
  b: "B — PNG cropped (skip medallion arc)",
  c: "C — Full PNG + opaque header",
};

export const KATAMEROS_CURVE_DESCRIPTIONS: Record<KatamerosCurvePreviewVariant, string> = {
  a: "Hide katameros-reading-bg.png entirely. Flat #f4ead8 only.",
  b: "Keep parchment PNG but extend flat cap + lower image start to skip medallion arc.",
  c: "Keep full PNG placement; AlphaHeaderShell gets solid cream fill so arc cannot show through.",
};

/** Extra px below cap line to skip medallion upper arc (forensic estimate). */
export const KATAMEROS_MEDALLION_CROP_PX = 72;

export function parseKatamerosCurveVariant(
  raw: string | null | undefined,
): KatamerosCurvePreviewVariant | null {
  const v = raw?.trim().toLowerCase();
  if (v === "a" || v === "b" || v === "c") return v;
  return null;
}
