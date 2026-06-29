import { useCallback, useEffect, useState } from "react";
import type { AgpeyaTabKey } from "./types";

const POS_KEY = "ab.agpeya.positions";
const LAST_KEY = "ab.agpeya.last";
const SPEED_KEY = "ab.agpeya.autoscrollSpeed";
const SAVED_KEY = "ab.agpeya.saved";
const THEME_KEY = "ab.agpeya.theme";
const FONT_KEY = "ab.agpeya.fontSize";
const LH_KEY = "ab.agpeya.lineHeight";
const AUDIO_KEY = "ab.agpeya.audio";

export type AgpeyaTheme = "light" | "dark";
export type AgpeyaSpeed = "slow" | "medium" | "fast";

export interface AgpeyaPosition {
  tab: AgpeyaTabKey;
  scrollPercent: number; // 0..1
  updatedAt: number;
}

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    void import("@/lib/user-sync-scheduler").then(({ scheduleUserDataSync }) =>
      scheduleUserDataSync({ debounced: true, delayMs: 4000, extraKey: key }),
    );
  } catch { /* ignore */ }
}

/* ---------- Position per prayer ---------- */

export function savePrayerPosition(prayerId: string, pos: AgpeyaPosition) {
  const all = safeRead<Record<string, AgpeyaPosition>>(POS_KEY, {});
  all[prayerId] = pos;
  safeWrite(POS_KEY, all);
  safeWrite(LAST_KEY, { prayerId, ...pos });
}

export function readPrayerPosition(prayerId: string): AgpeyaPosition | null {
  const all = safeRead<Record<string, AgpeyaPosition>>(POS_KEY, {});
  return all[prayerId] ?? null;
}

export function readLastOpenedPrayer(): (AgpeyaPosition & { prayerId: string }) | null {
  return safeRead<(AgpeyaPosition & { prayerId: string }) | null>(LAST_KEY, null);
}

export function clearLastOpenedPrayer() {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(LAST_KEY); } catch { /* ignore */ }
}

export function clearPrayerPosition(prayerId: string) {
  const all = safeRead<Record<string, AgpeyaPosition>>(POS_KEY, {});
  if (prayerId in all) {
    delete all[prayerId];
    safeWrite(POS_KEY, all);
  }
}

/* ---------- Saved prayers ---------- */

export function useSavedAgpeya() {
  const [list, setList] = useState<string[]>(() => safeRead<string[]>(SAVED_KEY, []));
  const persist = useCallback((next: string[]) => {
    setList(next);
    safeWrite(SAVED_KEY, next);
  }, []);
  const isSaved = useCallback((id: string) => list.includes(id), [list]);
  const toggle = useCallback(
    (id: string) => {
      persist(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
    },
    [list, persist],
  );
  return { saved: list, isSaved, toggle };
}

/* ---------- Reader preferences ---------- */

export function useAgpeyaTheme(): [AgpeyaTheme, (t: AgpeyaTheme) => void] {
  const [theme, setTheme] = useState<AgpeyaTheme>(() => safeRead<AgpeyaTheme>(THEME_KEY, "light"));
  useEffect(() => { safeWrite(THEME_KEY, theme); }, [theme]);
  return [theme, setTheme];
}

export function useAgpeyaFontSize(): [number, (n: number) => void] {
  const [size, setSize] = useState<number>(() => safeRead<number>(FONT_KEY, 20));
  useEffect(() => { safeWrite(FONT_KEY, size); }, [size]);
  return [size, setSize];
}

export function useAgpeyaLineHeight(): [number, (n: number) => void] {
  const [lh, setLh] = useState<number>(() => safeRead<number>(LH_KEY, 2.05));
  useEffect(() => { safeWrite(LH_KEY, lh); }, [lh]);
  return [lh, setLh];
}

export function useAgpeyaSpeed(): [AgpeyaSpeed, (s: AgpeyaSpeed) => void] {
  const [speed, setSpeed] = useState<AgpeyaSpeed>(() => safeRead<AgpeyaSpeed>(SPEED_KEY, "medium"));
  useEffect(() => { safeWrite(SPEED_KEY, speed); }, [speed]);
  return [speed, setSpeed];
}

export const SPEED_PX_PER_SEC: Record<AgpeyaSpeed, number> = {
  slow: 18,
  medium: 36,
  fast: 64,
};

/* ---------- Audio (placeholder — no player yet) ---------- */

export interface AgpeyaAudioState {
  /** Currently selected prayer's audio (or null). */
  prayerId: string | null;
  /** Whether the future player is logically "playing". Always false today. */
  playing: boolean;
  /** Position in seconds; reserved for future player. */
  positionSec: number;
}

export function useAgpeyaAudio(): [AgpeyaAudioState, (s: Partial<AgpeyaAudioState>) => void] {
  const [state, setState] = useState<AgpeyaAudioState>(() =>
    safeRead<AgpeyaAudioState>(AUDIO_KEY, { prayerId: null, playing: false, positionSec: 0 }),
  );
  const update = useCallback((patch: Partial<AgpeyaAudioState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch, playing: false }; // force-off until player ships
      safeWrite(AUDIO_KEY, next);
      return next;
    });
  }, []);
  return [state, update];
}
