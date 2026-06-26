import { useEffect, useState } from "react";
import { readSettingsState, useSettings } from "@/features/settings/settings-store";
import { applyAlphaThemeFromMode } from "./apply-theme";
import { resolveThemeMode, type ResolvedTheme } from "./resolve-theme";

export function useResolvedTheme(): ResolvedTheme {
  const { state } = useSettings();
  return resolveThemeMode(state.themeMode);
}

/** Applies global theme to <html> and reacts to settings + system preference. */
export function useAlphaThemeSync() {
  const { state } = useSettings();
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    typeof window === "undefined" ? "light" : resolveThemeMode(readSettingsState().themeMode),
  );

  useEffect(() => {
    const sync = () => {
      const next = resolveThemeMode(readSettingsState().themeMode);
      setResolved(next);
      applyAlphaThemeFromMode(readSettingsState().themeMode);
    };

    sync();
    window.addEventListener("ab:settings", sync);
    window.addEventListener("storage", sync);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => sync();
    mq.addEventListener("change", onSystem);

    return () => {
      window.removeEventListener("ab:settings", sync);
      window.removeEventListener("storage", sync);
      mq.removeEventListener("change", onSystem);
    };
  }, [state.themeMode]);

  return resolved;
}
