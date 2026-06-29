import { useSyncExternalStore } from "react";
import { journeyStreakSummary, readJourneyStreak } from "@/features/bible-journey/journey-storage";

export const SPIRITUAL_RECORD_CHANGED = "ab:spiritual-record-changed";

export type SpiritualPillar = "reading" | "prayer" | "agpeya";

type SpiritualRecordBlob = {
  prayer: string[];
  agpeya: string[];
};

const STORAGE_KEY = "ab:community-spiritual-record-v1";

const listeners = new Set<() => void>();

const EMPTY_SPIRITUAL_RECORD: SpiritualRecordSnapshot = {
  overallStreak: 0,
  readingStreak: 0,
  prayerStreak: 0,
  agpeyaStreak: 0,
  longestReading: 0,
  last7: [],
};

let spiritualRecordSnapshot: SpiritualRecordSnapshot | null = null;
let spiritualRecordSnapshotDay = "";

function localDayKey(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function readBlob(): SpiritualRecordBlob {
  if (typeof window === "undefined") return { prayer: [], agpeya: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { prayer: [], agpeya: [] };
    const parsed = JSON.parse(raw) as SpiritualRecordBlob;
    return {
      prayer: Array.isArray(parsed.prayer) ? parsed.prayer : [],
      agpeya: Array.isArray(parsed.agpeya) ? parsed.agpeya : [],
    };
  } catch {
    return { prayer: [], agpeya: [] };
  }
}

function writeBlob(blob: SpiritualRecordBlob) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      prayer: blob.prayer.slice(-120),
      agpeya: blob.agpeya.slice(-120),
    }),
  );
  spiritualRecordSnapshotDay = "";
  spiritualRecordSnapshot = null;
  window.dispatchEvent(new Event(SPIRITUAL_RECORD_CHANGED));
  listeners.forEach((l) => l());
}

function computeCurrentStreak(days: string[], today: string): number {
  if (!days.length) return 0;
  const set = new Set(days);
  let streak = 0;
  let cursor = today;
  while (set.has(cursor)) {
    streak += 1;
    const d = new Date(cursor);
    d.setDate(d.getDate() - 1);
    cursor = localDayKey(d.getTime());
  }
  return streak;
}

function readingActiveDays(): string[] {
  return readJourneyStreak().activeDays;
}

export function recordSpiritualPillarDay(pillar: "prayer" | "agpeya", at = Date.now()) {
  const day = localDayKey(at);
  const blob = readBlob();
  const list = pillar === "prayer" ? blob.prayer : blob.agpeya;
  if (list.includes(day)) return;
  if (pillar === "prayer") blob.prayer = [...list, day];
  else blob.agpeya = [...list, day];
  writeBlob(blob);
}

const BACKFILL_KEY = "ab:spiritual-record-backfill-v1";

/** One-time backfill prayer/agpeya days from local community moments. */
export function backfillSpiritualRecordFromMoments(): void {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(BACKFILL_KEY)) return;

  void import("./community-store").then(({ listCommunityMoments }) => {
    void import("@/features/church/current-user").then(({ getCurrentUser }) => {
      const userId = getCurrentUser().id;
      if (!userId) return;

      const moments = listCommunityMoments("all").filter((m) => m.userId === userId);
      for (const m of moments) {
        const at = new Date(m.createdAt).getTime();
        if (m.kind === "prayer") recordSpiritualPillarDay("prayer", at);
        if (m.kind === "agpeya" || m.source === "auto_agpeya") recordSpiritualPillarDay("agpeya", at);
      }

      window.localStorage.setItem(BACKFILL_KEY, "1");
    });
  });
}

export type SpiritualRecordSnapshot = {
  overallStreak: number;
  readingStreak: number;
  prayerStreak: number;
  agpeyaStreak: number;
  longestReading: number;
  last7: { day: string; label: string; reading: boolean; prayer: boolean; agpeya: boolean }[];
};

export function getSpiritualRecordSnapshot(): SpiritualRecordSnapshot {
  const today = localDayKey(Date.now());
  if (spiritualRecordSnapshot && spiritualRecordSnapshotDay === today) {
    return spiritualRecordSnapshot;
  }

  const blob = readBlob();
  const readingDays = readingActiveDays();
  const reading = journeyStreakSummary();

  const prayerStreak = computeCurrentStreak(blob.prayer, today);
  const agpeyaStreak = computeCurrentStreak(blob.agpeya, today);
  const readingStreak = reading.currentStreak;

  const unionDays = new Set([...readingDays, ...blob.prayer, ...blob.agpeya]);
  const overallStreak = computeCurrentStreak([...unionDays], today);

  const last7: SpiritualRecordSnapshot["last7"] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = localDayKey(d.getTime());
    last7.push({
      day: key,
      label: d.toLocaleDateString("ar-EG", { weekday: "short" }),
      reading: readingDays.includes(key),
      prayer: blob.prayer.includes(key),
      agpeya: blob.agpeya.includes(key),
    });
  }

  spiritualRecordSnapshotDay = today;
  spiritualRecordSnapshot = {
    overallStreak,
    readingStreak,
    prayerStreak,
    agpeyaStreak,
    longestReading: reading.longestStreak,
    last7,
  };
  return spiritualRecordSnapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener(SPIRITUAL_RECORD_CHANGED, listener);
    window.addEventListener("ab:storage", listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener(SPIRITUAL_RECORD_CHANGED, listener);
      window.removeEventListener("ab:storage", listener);
    }
  };
}

export function useSpiritualRecord() {
  return useSyncExternalStore(subscribe, getSpiritualRecordSnapshot, () => EMPTY_SPIRITUAL_RECORD);
}
