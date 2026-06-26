/** ALPHA-101 — Bible Journey progress persistence (local). */

export type JourneyChapterRecord = {
  progressPercent: number;
  maxVerse?: number;
  lastReadAt: number;
};

export type JourneyChapterMap = Record<string, JourneyChapterRecord>;

export type JourneyStreakState = {
  /** YYYY-MM-DD local calendar days with reading activity */
  activeDays: string[];
  longestStreak: number;
  lastReadDay?: string;
};

const KEYS = {
  chapters: "ab:journey:chapters",
  streak: "ab:journey:streak",
} as const;

export function journeyChapterKey(book: string, chapter: number): string {
  return `${book}::${chapter}`;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("ab:storage", { detail: { key } }));
  } catch {
    /* ignore */
  }
}

export function readJourneyChapterMap(): JourneyChapterMap {
  return read<JourneyChapterMap>(KEYS.chapters, {});
}

export function readJourneyStreak(): JourneyStreakState {
  return read<JourneyStreakState>(KEYS.streak, { activeDays: [], longestStreak: 0 });
}

function localDayKey(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function computeLongestStreak(days: string[]): number {
  if (days.length === 0) return 0;
  const sorted = [...new Set(days)].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = new Date(sorted[i - 1]);
    const cur = new Date(sorted[i]);
    const diffDays = Math.round((cur.getTime() - prev.getTime()) / 86_400_000);
    if (diffDays === 1) {
      run += 1;
      best = Math.max(best, run);
    } else if (diffDays > 1) {
      run = 1;
    }
  }
  return best;
}

function computeCurrentStreak(days: string[], today: string): number {
  if (days.length === 0) return 0;
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

export function recordJourneyReading(input: {
  book: string;
  chapter: number;
  progressPercent: number;
  verse?: number;
  lastOpenedAt: number;
}) {
  const map = readJourneyChapterMap();
  const key = journeyChapterKey(input.book, input.chapter);
  const prev = map[key];
  const progressPercent = Math.max(prev?.progressPercent ?? 0, Math.min(100, input.progressPercent));
  const maxVerse = Math.max(prev?.maxVerse ?? 0, input.verse ?? 0) || undefined;

  map[key] = {
    progressPercent,
    maxVerse,
    lastReadAt: input.lastOpenedAt,
  };
  write(KEYS.chapters, map);

  if (progressPercent < 3) return;

  const day = localDayKey(input.lastOpenedAt);
  const streak = readJourneyStreak();
  const activeDays = streak.activeDays.includes(day) ? streak.activeDays : [...streak.activeDays, day];
  const longestStreak = Math.max(streak.longestStreak, computeLongestStreak(activeDays));
  write(KEYS.streak, {
    activeDays,
    longestStreak,
    lastReadDay: day,
  });
}

export function journeyStreakSummary(streak: JourneyStreakState = readJourneyStreak()) {
  const today = localDayKey(Date.now());
  const currentStreak = computeCurrentStreak(streak.activeDays, today);
  const yesterday = localDayKey(Date.now() - 86_400_000);
  const activeToday = streak.activeDays.includes(today);
  const lastReadDay = streak.lastReadDay;
  return {
    currentStreak,
    longestStreak: Math.max(streak.longestStreak, currentStreak),
    lastReadDay,
    activeToday,
    lastReadLabel: lastReadDay
      ? lastReadDay === today
        ? "اليوم"
        : lastReadDay === yesterday
          ? "أمس"
          : new Date(lastReadDay).toLocaleDateString("ar-EG", { day: "numeric", month: "short" })
      : "—",
  };
}

export const JOURNEY_STORAGE_KEYS = KEYS;
