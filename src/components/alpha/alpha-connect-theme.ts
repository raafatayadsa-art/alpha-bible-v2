import { cn } from "@/lib/utils";
import {
  loadAlphaConnectSettings,
  type AlphaConnectSettingsState,
} from "./AlphaConnectSettings";

/** Dark neon theme — default, unchanged. */
export type AlphaConnectThemeId = "secure" | "classic";

export const ALPHA_CONNECT_THEME_LABELS: Record<AlphaConnectThemeId, string> = {
  secure: "Alpha Connect Secure",
  classic: "Alpha Connect Classic",
};

export const ALPHA_CONNECT_THEME_AR: Record<AlphaConnectThemeId, string> = {
  secure: "Alpha Connect Secure",
  classic: "Alpha Connect Classic",
};

export const CONNECT_THEME_CHANGED_EVENT = "alpha-connect-theme-changed";

export function normalizeConnectTheme(value: unknown): AlphaConnectThemeId {
  return value === "classic" ? "classic" : "secure";
}

export function getConnectTheme(settings?: Pick<AlphaConnectSettingsState, "theme">): AlphaConnectThemeId {
  return normalizeConnectTheme(settings?.theme ?? loadAlphaConnectSettings().theme);
}

export function isClassicConnectTheme(theme: AlphaConnectThemeId): boolean {
  return theme === "classic";
}

export function getAlphaConnectFrameClass(theme: AlphaConnectThemeId = "secure"): string {
  return cn("alpha-connect-theme", theme === "classic" && "alpha-connect-theme--classic");
}

export function dispatchConnectThemeChanged(theme: AlphaConnectThemeId): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONNECT_THEME_CHANGED_EVENT, { detail: { theme } }));
}

/** Unified presence dot colors — both themes. */
export const CONNECT_PRESENCE_COLORS = {
  available: "#22C55E",
  busy: "#F59E0B",
  unavailable: "#EF4444",
  hidden: "#6B7280",
} as const;
