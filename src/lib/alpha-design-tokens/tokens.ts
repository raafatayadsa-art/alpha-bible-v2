/**
 * ALPHA UI Polish — central design tokens (TypeScript).
 * CSS source of truth: alpha-polish-tokens.css
 */

export const ALPHA_POLISH = {
  spacing: {
    1: 8,
    2: 16,
    3: 24,
    4: 32,
    5: 48,
  },
  radius: {
    hero: 30,
    card: 26,
    cardCompact: 22,
    featured: 24,
    mini: 20,
    button: 18,
    input: 18,
    tag: 9999,
    dockTab: 16,
    thumb: 12,
  },
  motion: {
    durationFast: 150,
    durationNormal: 200,
    durationSlow: 300,
    easeStandard: "cubic-bezier(0.22, 1, 0.36, 1)",
    easeSpring: "cubic-bezier(0.34, 1.25, 0.64, 1)",
  },
  icon: {
    sm: 16,
    md: 20,
    lg: 24,
    stroke: 2,
  },
  typography: {
    h1: { size: "1.375rem", weight: 700, lineHeight: 1.25 },
    h2: { size: "1.0625rem", weight: 600, lineHeight: 1.35 },
    body: { size: "0.9375rem", weight: 400, lineHeight: 1.55 },
    desc: { size: "0.8125rem", weight: 400, lineHeight: 1.5 },
    caption: { size: "0.6875rem", weight: 500, lineHeight: 1.35 },
  },
} as const;

/** Hero card accent — use sparingly for active/primary only */
export const ALPHA_GOLD = {
  DEFAULT: "var(--alpha-gold)",
  bright: "var(--alpha-gold-bright)",
  deep: "var(--alpha-gold-deep)",
} as const;

export const ALPHA_TEXT = {
  primary: "var(--alpha-text-primary)",
  secondary: "var(--alpha-text-secondary)",
  description: "var(--alpha-text-description)",
  inactive: "var(--alpha-text-inactive)",
} as const;

/** Publisher workspace / public page accent */
export const ALPHA_PUBLISHER = {
  purple: "var(--alpha-publisher-purple)",
  ink: "var(--alpha-publisher-ink)",
  muted: "var(--alpha-publisher-muted)",
  subtle: "var(--alpha-publisher-subtle)",
  surface: "var(--alpha-publisher-surface)",
} as const;
