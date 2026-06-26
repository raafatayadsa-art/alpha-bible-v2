import { useAlphaThemeSync } from "./use-resolved-theme";

/** Mount once at app root — wires settings themeMode to document data-theme + .dark */
export function AlphaThemeBootstrap() {
  useAlphaThemeSync();
  return null;
}
