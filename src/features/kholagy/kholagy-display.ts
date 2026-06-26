import { useState } from "react";

export type KholagyDisplayMode =
  | "all"
  | "ar-cop"
  | "en-cop"
  | "ar"
  | "cop"
  | "en";

export const KHOLAGY_DISPLAY_MODES: {
  id: KholagyDisplayMode;
  label: string;
  short: string;
}[] = [
  { id: "all", label: "الثلاثة معًا", short: "٣" },
  { id: "ar-cop", label: "عربي + قبطي", short: "ع+Ⲁ" },
  { id: "en-cop", label: "إنجليزي + قبطي", short: "EN+Ⲁ" },
  { id: "ar", label: "عربي فقط", short: "ع" },
  { id: "cop", label: "قبطي فقط", short: "Ⲁ" },
  { id: "en", label: "إنجليزي فقط", short: "EN" },
];

const DISPLAY_KEY = "ab.kholagy.displayMode";

export type KholagyColumn = "ar" | "cop" | "en";

export function readKholagyDisplayMode(): KholagyDisplayMode {
  try {
    const raw = localStorage.getItem(DISPLAY_KEY);
    if (raw && KHOLAGY_DISPLAY_MODES.some((m) => m.id === raw)) {
      return raw as KholagyDisplayMode;
    }
  } catch {
    /* ignore */
  }
  return "all";
}

export function saveKholagyDisplayMode(mode: KholagyDisplayMode) {
  try {
    localStorage.setItem(DISPLAY_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function useKholagyDisplayMode(): [KholagyDisplayMode, (mode: KholagyDisplayMode) => void] {
  const [mode, setModeState] = useState<KholagyDisplayMode>(() =>
    typeof window === "undefined" ? "all" : readKholagyDisplayMode(),
  );

  const setMode = (next: KholagyDisplayMode) => {
    setModeState(next);
    saveKholagyDisplayMode(next);
  };

  return [mode, setMode];
}

export function columnsForMode(mode: KholagyDisplayMode): KholagyColumn[] {
  switch (mode) {
    case "all":
      return ["ar", "cop", "en"];
    case "ar-cop":
      return ["ar", "cop"];
    case "en-cop":
      return ["cop", "en"];
    case "ar":
      return ["ar"];
    case "cop":
      return ["cop"];
    case "en":
      return ["en"];
  }
}
