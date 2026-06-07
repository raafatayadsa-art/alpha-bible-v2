/** Shared cycle tiers for the Standard Alpha Control Bar. */

export const SPEED_TIERS = [
  { label: "بطيء", multiplier: 20 / 28 },
  { label: "متوسط", multiplier: 45 / 28 },
  { label: "سريع", multiplier: 90 / 28 },
] as const;

export const SPEED_STORAGE_KEY = "ab.autoscroll.speedTier";
export const DEFAULT_SPEED_TIER = 1;

export function loadInitialSpeedTier(): number {
  if (typeof window === "undefined") return DEFAULT_SPEED_TIER;
  try {
    const raw = window.localStorage.getItem(SPEED_STORAGE_KEY);
    if (raw != null) {
      const n = Number(raw);
      if (Number.isFinite(n) && n >= 0 && n < SPEED_TIERS.length) return n;
    }
    const legacy = window.localStorage.getItem("ab.autoscroll.speedIdx");
    if (legacy != null) {
      const idx = Number(legacy);
      if (Number.isFinite(idx)) return Math.min(2, Math.floor(idx / 2.5));
    }
  } catch { /* ignore */ }
  return DEFAULT_SPEED_TIER;
}

export const LINE_SPACING_TIERS = [
  { label: "ضيق", pick: (steps: number[]) => steps[0] ?? 1.6 },
  { label: "متوسط", pick: (steps: number[]) => steps[Math.floor(steps.length / 2)] ?? 2.0 },
  { label: "واسع", pick: (steps: number[]) => steps[steps.length - 1] ?? 2.4 },
] as const;

export function lineSpacingTierIndex(lineHeight: number, steps: number[]) {
  const values = LINE_SPACING_TIERS.map((t) => t.pick(steps));
  let best = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < values.length; i++) {
    const d = Math.abs(values[i] - lineHeight);
    if (d < bestDiff) {
      bestDiff = d;
      best = i;
    }
  }
  return best;
}

export function cycleLineHeight(lineHeight: number, steps: number[]) {
  const tier = lineSpacingTierIndex(lineHeight, steps);
  const next = LINE_SPACING_TIERS[(tier + 1) % LINE_SPACING_TIERS.length];
  return next.pick(steps);
}

export function lineSpacingLabel(lineHeight: number, steps: number[]) {
  return LINE_SPACING_TIERS[lineSpacingTierIndex(lineHeight, steps)]?.label ?? "متوسط";
}

/** Presentation display mode spacing keys. */
export type PresentationSpacing = "tight" | "normal" | "wide";
export const PRESENTATION_SPACING_ORDER: PresentationSpacing[] = ["tight", "normal", "wide"];
export const PRESENTATION_SPACING_LH: Record<PresentationSpacing, number> = {
  tight: 1.7,
  normal: 2.1,
  wide: 2.6,
};
export const PRESENTATION_SPACING_LABEL: Record<PresentationSpacing, string> = {
  tight: "ضيق",
  normal: "متوسط",
  wide: "واسع",
};

export function cyclePresentationSpacing(current: PresentationSpacing): PresentationSpacing {
  const idx = PRESENTATION_SPACING_ORDER.indexOf(current);
  return PRESENTATION_SPACING_ORDER[(idx + 1) % PRESENTATION_SPACING_ORDER.length] ?? "tight";
}

export type PresentationSpeed = "slow" | "medium" | "fast";
export const PRESENTATION_SPEED_ORDER: PresentationSpeed[] = ["slow", "medium", "fast"];
export const PRESENTATION_SPEED_PX: Record<PresentationSpeed, number> = {
  slow: 20,
  medium: 45,
  fast: 90,
};
export const PRESENTATION_SPEED_LABEL: Record<PresentationSpeed, string> = {
  slow: "بطيء",
  medium: "متوسط",
  fast: "سريع",
};

export function cyclePresentationSpeed(current: PresentationSpeed): PresentationSpeed {
  const idx = PRESENTATION_SPEED_ORDER.indexOf(current);
  return PRESENTATION_SPEED_ORDER[(idx + 1) % PRESENTATION_SPEED_ORDER.length] ?? "slow";
}

export const READING_WIDTH_TIERS = [
  { label: "ضيق", value: 420 },
  { label: "متوسط", value: 640 },
  { label: "واسع", value: 800 },
] as const;

export function readingWidthTierIndex(width: number) {
  let best = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < READING_WIDTH_TIERS.length; i++) {
    const d = Math.abs(READING_WIDTH_TIERS[i].value - width);
    if (d < bestDiff) {
      bestDiff = d;
      best = i;
    }
  }
  return best;
}

export function cycleReadingWidth(width: number) {
  const tier = readingWidthTierIndex(width);
  return READING_WIDTH_TIERS[(tier + 1) % READING_WIDTH_TIERS.length].value;
}

export function readingWidthLabel(width: number) {
  return READING_WIDTH_TIERS[readingWidthTierIndex(width)]?.label ?? "متوسط";
}
