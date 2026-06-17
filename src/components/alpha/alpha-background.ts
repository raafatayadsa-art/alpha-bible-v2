/** Shell top radial bowl — canonical “current” (Variant B). */
export type AlphaBackgroundVariant = "a" | "b" | "c";

export const ALPHA_BACKGROUND_VARIANTS: AlphaBackgroundVariant[] = ["a", "b", "c"];

export const ALPHA_BACKGROUND_LABELS: Record<AlphaBackgroundVariant, string> = {
  a: "A — No radial",
  b: "B — Current radial",
  c: "C — Subtle (20%)",
};

export const ALPHA_BACKGROUND_DESCRIPTIONS: Record<AlphaBackgroundVariant, string> = {
  a: "Flat shell only (#f4ead8). No top ellipse.",
  b: "Current approved top radial bowl (3 layers).",
  c: "Same geometry as B at 20% opacity.",
};

/** Shared shell fill under the gradient layers. */
export const ALPHA_BACKGROUND_BASE = "#f4ead8";

const GRADIENT_LAYERS = [
  "radial-gradient(120% 50% at 50% 0%, rgba(255,231,184,0.55), transparent 60%)",
  "radial-gradient(70% 60% at 100% 30%, rgba(167,139,217,0.15), transparent 65%)",
  "radial-gradient(80% 60% at 0% 85%, rgba(214,168,98,0.19), transparent 65%)",
] as const;

const SUBTLE_FACTOR = 0.2;

function scaleRgbaAlpha(value: string, factor: number): string {
  return value.replace(/rgba\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/g, (_, r, g, b, a) => {
    const scaled = Math.round(parseFloat(a) * factor * 1000) / 1000;
    return `rgba(${r}, ${g}, ${b}, ${scaled})`;
  });
}

export function getAlphaBackgroundLayers(variant: AlphaBackgroundVariant): string[] | null {
  if (variant === "a") return null;
  if (variant === "b") return [...GRADIENT_LAYERS];
  return GRADIENT_LAYERS.map((layer) => scaleRgbaAlpha(layer, SUBTLE_FACTOR));
}

export function getAlphaBackgroundCss(variant: AlphaBackgroundVariant): string | undefined {
  const layers = getAlphaBackgroundLayers(variant);
  if (!layers?.length) return undefined;
  return layers.join(", ");
}

export function parseAlphaBackgroundVariant(raw: string | null | undefined): AlphaBackgroundVariant | null {
  const v = raw?.trim().toLowerCase();
  if (v === "a" || v === "b" || v === "c") return v;
  return null;
}

export const ALPHA_BG_QUERY_KEY = "alphaBg";
export const ALPHA_BG_STORAGE_KEY = "alpha-background-variant";
