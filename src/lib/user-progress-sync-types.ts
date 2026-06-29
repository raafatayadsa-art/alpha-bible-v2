import type { BibleJournalEntry } from "@/lib/bible-journal-state";
import type { SavedChapter, ReadingSession, TypographyPrefs } from "@/lib/reading-state";
import type { VerseHighlightColor } from "@/lib/verse-highlights";
import type { JourneyChapterMap, JourneyStreakState } from "@/features/bible-journey/journey-storage";
import type { SettingsState } from "@/features/settings/settings-store";

export const USER_PROGRESS_SYNC_CHANGED = "ab:user-progress-sync-changed";
export const USER_SYNC_STATUS_EVENT = "ab:user-sync-status";
export const USER_SYNC_EXTRA_META_KEY = "ab:user-sync-extra-meta";

export type UserSyncStatus = "idle" | "syncing" | "synced" | "error" | "offline";

export type HighlightSyncEntry = {
  color: VerseHighlightColor;
  text?: string;
  bookName?: string;
  highlightedAt: number;
};

export type SyncExtraEntry = {
  data: string;
  at: number;
};

export type UserProgressPayloadV1 = {
  v: 1;
  updatedAt: number;
  reading?: {
    current: ReadingSession | null;
    recent: ReadingSession[];
  };
  savedChapters?: SavedChapter[];
  highlights?: Record<string, HighlightSyncEntry>;
  journal?: BibleJournalEntry[];
  journey?: {
    chapters: JourneyChapterMap;
    streak: JourneyStreakState;
  };
  typo?: TypographyPrefs;
};

export type UserProgressPayload = {
  v: 2;
  updatedAt: number;
  reading?: UserProgressPayloadV1["reading"];
  savedChapters?: SavedChapter[];
  highlights?: Record<string, HighlightSyncEntry>;
  journal?: BibleJournalEntry[];
  journey?: UserProgressPayloadV1["journey"];
  typo?: TypographyPrefs;
  settings?: Partial<SettingsState>;
  extras?: Record<string, SyncExtraEntry>;
};

export const USER_SYNC_STORAGE_KEYS = {
  readingCurrent: "ab:reading:current",
  readingRecent: "ab:reading:recent",
  savedChapters: "ab:saved:chapters",
  highlights: "ab:verse-highlights-v1",
  journal: "ab:bible:journal",
  journeyChapters: "ab:journey:chapters",
  journeyStreak: "ab:journey:streak",
  typo: "ab:reader:typography",
  settings: "ab:alpha-settings",
  locale: "ab:locale",
  profileUser: "ab:profile-user",
} as const;

/** Static localStorage keys synced via payload.extras */
export const USER_SYNC_EXTRA_KEYS = [
  USER_SYNC_STORAGE_KEYS.settings,
  USER_SYNC_STORAGE_KEYS.locale,
  USER_SYNC_STORAGE_KEYS.profileUser,
  "ab.katameros.progress.v1",
  "ab.agpeya.positions",
  "ab.agpeya.last",
  "ab.agpeya.autoscrollSpeed",
  "ab.agpeya.saved",
  "ab.agpeya.theme",
  "ab.agpeya.fontSize",
  "ab.agpeya.lineHeight",
  "ab.agpeya.audio",
  "ab:journal:custom:meditation-prompts",
  "ab:journal:custom:note-prompts",
  "ab:journal:custom:study-tags",
  "alpha.verse-day.likes",
  "alpha.verse-day.shares",
  "alpha.verse-day.liked",
  "alpha.synaxarium.hero.liked",
  "alpha:synaxarium:favorites",
  "alpha:church-directory:favorites",
  "alpha:search:recent",
  "ab.kholagy.positions",
  "ab.kholagy.last",
  "ab.kholagy.lastLiturgy",
  "ab.kholagy.theme",
  "ab.kholagy.displayMode",
] as const;

export const USER_SYNC_DYNAMIC_EXTRA_PREFIXES = ["alpha.hero.", "alpha.verse-day."] as const;
