import { useState } from "react";

const POS_KEY = "ab.kholagy.positions";
const LAST_KEY = "ab.kholagy.last";
const LAST_LITURGY_KEY = "ab.kholagy.lastLiturgy";
const THEME_KEY = "ab.kholagy.theme";

export type KholagyScrollPosition = {
  scrollPercent: number;
  updatedAt: number;
};

function readPositions(): Record<string, KholagyScrollPosition> {
  try {
    const raw = localStorage.getItem(POS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, KholagyScrollPosition>) : {};
  } catch {
    return {};
  }
}

export function readKholagyPosition(groupKey: string): KholagyScrollPosition | null {
  return readPositions()[groupKey] ?? null;
}

function scheduleKholagySync(key: string) {
  void import("@/lib/user-sync-scheduler").then(({ scheduleUserDataSync }) =>
    scheduleUserDataSync({ debounced: true, delayMs: 4000, extraKey: key }),
  );
}

export function saveKholagyPosition(groupKey: string, pos: KholagyScrollPosition) {
  try {
    const all = readPositions();
    all[groupKey] = pos;
    localStorage.setItem(POS_KEY, JSON.stringify(all));
    scheduleKholagySync(POS_KEY);
  } catch {
    /* ignore */
  }
}

export function readLastOpenedKholagy(): { groupKey: string; title: string } | null {
  try {
    const raw = localStorage.getItem(LAST_KEY);
    return raw ? (JSON.parse(raw) as { groupKey: string; title: string }) : null;
  } catch {
    return null;
  }
}

export function saveLastOpenedKholagy(groupKey: string, title: string) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify({ groupKey, title }));
    scheduleKholagySync(LAST_KEY);
  } catch {
    /* ignore */
  }
}

export function readLastOpenedKholagyLiturgy(): {
  liturgyKey: string;
  sectionId: number;
  title: string;
} | null {
  try {
    const raw = localStorage.getItem(LAST_LITURGY_KEY);
    return raw
      ? (JSON.parse(raw) as { liturgyKey: string; sectionId: number; title: string })
      : null;
  } catch {
    return null;
  }
}

export function saveLastOpenedKholagyLiturgy(liturgyKey: string, sectionId: number, title: string) {
  try {
    localStorage.setItem(
      LAST_LITURGY_KEY,
      JSON.stringify({ liturgyKey, sectionId, title }),
    );
    scheduleKholagySync(LAST_LITURGY_KEY);
  } catch {
    /* ignore */
  }
}

export type KholagyTheme = "light" | "dark";

export function readKholagyTheme(): KholagyTheme {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function saveKholagyTheme(theme: KholagyTheme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
    scheduleKholagySync(THEME_KEY);
  } catch {
    /* ignore */
  }
}

export function useKholagyTheme(): [KholagyTheme, (t: KholagyTheme) => void] {
  const [theme, setThemeState] = useState<KholagyTheme>(() =>
    typeof window === "undefined" ? "light" : readKholagyTheme(),
  );

  const setTheme = (t: KholagyTheme) => {
    setThemeState(t);
    saveKholagyTheme(t);
  };

  return [theme, setTheme];
}
