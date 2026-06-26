import type { ThemeMode } from "@/features/settings/settings-store";

export type ResolvedTheme = "light" | "dark";

export function resolveThemeMode(mode: ThemeMode): ResolvedTheme {
  if (mode === "dark") return "dark";
  if (mode === "light") return "light";
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}
