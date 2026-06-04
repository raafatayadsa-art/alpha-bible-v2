import { useCallback, useEffect, useState } from "react";
import type { ReadingStatus } from "./types";

const KEY = "ab.katameros.progress.v1";

type ProgressMap = Record<string, Record<string, ReadingStatus>>;

function safeRead(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function safeWrite(v: ProgressMap) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* ignore */ }
}

export function useKatamerosProgress(dayId: string) {
  const [map, setMap] = useState<ProgressMap>(() => safeRead());

  useEffect(() => { safeWrite(map); }, [map]);

  const statusOf = useCallback(
    (readingId: string): ReadingStatus => map[dayId]?.[readingId] ?? "not-started",
    [map, dayId],
  );

  const setStatus = useCallback((readingId: string, status: ReadingStatus) => {
    setMap((prev) => ({
      ...prev,
      [dayId]: { ...(prev[dayId] ?? {}), [readingId]: status },
    }));
  }, [dayId]);

  const lastInProgress = useCallback((): string | null => {
    const day = map[dayId];
    if (!day) return null;
    for (const id of Object.keys(day)) {
      if (day[id] === "in-progress") return id;
    }
    return null;
  }, [map, dayId]);

  const completedCount = useCallback((total: number) => {
    const day = map[dayId];
    if (!day) return 0;
    return Object.values(day).filter((s) => s === "completed").length;
  }, [map, dayId]);

  return { statusOf, setStatus, lastInProgress, completedCount };
}
