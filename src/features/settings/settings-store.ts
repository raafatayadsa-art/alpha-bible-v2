import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ab:alpha-settings";

export type MessageDeleteDuration = "after_view" | "1h" | "1d" | "1w";
export type ThemeMode = "light" | "dark" | "system";
export type LineSpacing = "compact" | "normal" | "relaxed";

export type SettingsState = {
  themeMode: ThemeMode;
  uiFontSize: number;
  uiFontFamily: "serif" | "sans";
  lineSpacing: LineSpacing;
  biometric: boolean;
  twoFactor: boolean;
  verified: boolean;
  registeredDevices: number;
  profileVisibility: "everyone" | "church" | "friends";
  whoCanMessage: "everyone" | "church" | "friends";
  hidePhone: boolean;
  hideEmail: boolean;
  hideChurch: boolean;
  hideBirthdate: boolean;
  messageDeleteDuration: MessageDeleteDuration;
  blockStrangers: boolean;
  notifyVerse: boolean;
  notifyPrayer: boolean;
  notifySaint: boolean;
  notifyKatameros: boolean;
  notifyMeetings: boolean;
  notifyTrips: boolean;
  notifyEvents: boolean;
  notifyPrayerRequests: boolean;
  notifyComments: boolean;
  notifyReplies: boolean;
  notifyMentions: boolean;
  bibleFontSize: number;
  bibleFontFamily: "serif" | "sans";
  bibleNightMode: boolean;
  bibleDayMode: boolean;
  bibleReduceMotion: boolean;
  bibleSaveLastRead: boolean;
  bibleAutoscrollSpeed: number;
  biblePreferredTranslation: string;
  bibleShowVerseNumbers: boolean;
  prayerReminder: boolean;
  prayerSilentMode: boolean;
  prayerBedtimeReminder: boolean;
  prayerMorningReminder: boolean;
  highContrast: boolean;
  screenReader: boolean;
  haptics: boolean;
  reduceMotion: boolean;
  largeText: boolean;
};

export const DEFAULT_SETTINGS: SettingsState = {
  themeMode: "light",
  uiFontSize: 16,
  uiFontFamily: "serif",
  lineSpacing: "normal",
  biometric: true,
  twoFactor: false,
  verified: true,
  registeredDevices: 2,
  profileVisibility: "church",
  whoCanMessage: "church",
  hidePhone: false,
  hideEmail: false,
  hideChurch: false,
  hideBirthdate: true,
  messageDeleteDuration: "1d",
  blockStrangers: true,
  notifyVerse: true,
  notifyPrayer: true,
  notifySaint: true,
  notifyKatameros: true,
  notifyMeetings: true,
  notifyTrips: true,
  notifyEvents: true,
  notifyPrayerRequests: true,
  notifyComments: true,
  notifyReplies: true,
  notifyMentions: true,
  bibleFontSize: 16,
  bibleFontFamily: "serif",
  bibleNightMode: false,
  bibleDayMode: true,
  bibleReduceMotion: false,
  bibleSaveLastRead: true,
  bibleAutoscrollSpeed: 2,
  biblePreferredTranslation: "النسخة القبطية",
  bibleShowVerseNumbers: true,
  prayerReminder: true,
  prayerSilentMode: true,
  prayerBedtimeReminder: true,
  prayerMorningReminder: true,
  highContrast: false,
  screenReader: false,
  haptics: true,
  reduceMotion: false,
  largeText: false,
};

function read(): SettingsState {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function write(state: SettingsState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("ab:settings", { detail: state }));
  } catch { /* ignore */ }
}

export function computeSecurityScore(s: SettingsState): number {
  let score = 55;
  if (s.biometric) score += 15;
  if (s.twoFactor) score += 18;
  if (s.verified) score += 10;
  if (s.registeredDevices <= 2) score += 5;
  if (s.blockStrangers) score += 4;
  if (s.hidePhone) score += 3;
  if (s.hideEmail) score += 3;
  return Math.min(100, score);
}

export function securityLabel(score: number): string {
  if (score >= 90) return "ممتاز";
  if (score >= 75) return "جيد جداً";
  if (score >= 60) return "جيد";
  return "يحتاج تحسين";
}

export function useSettings() {
  const [state, setState] = useState<SettingsState>(() => read());

  useEffect(() => {
    const sync = () => setState(read());
    window.addEventListener("ab:settings", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ab:settings", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const patch = useCallback(<K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setState((prev) => {
      const next = { ...prev, [key]: value };
      write(next);
      return next;
    });
  }, []);

  const clearCache = useCallback(() => {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith("alpha:") || k.startsWith("ab:"));
      keys.forEach((k) => {
        if (k !== STORAGE_KEY) localStorage.removeItem(k);
      });
    } catch { /* ignore */ }
  }, []);

  return { state, patch, clearCache };
}
