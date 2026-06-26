import type { ThemeMode } from "@/features/settings/settings-store";
import { resolveThemeMode, type ResolvedTheme } from "./resolve-theme";

export function applyAlphaTheme(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  root.classList.toggle("dark", resolved === "dark");
}

export function applyAlphaThemeFromMode(mode: ThemeMode) {
  applyAlphaTheme(resolveThemeMode(mode));
}
