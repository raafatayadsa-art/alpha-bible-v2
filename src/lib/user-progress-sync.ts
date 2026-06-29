import { supabase } from "@/integrations/supabase/client";
import { getAuthUserId, waitForAuthUserId } from "@/features/auth";
import { isAuthenticated } from "@/features/church/current-user";
import type { JourneyChapterMap, JourneyStreakState } from "@/features/bible-journey/journey-storage";
import type { BibleJournalEntry } from "@/lib/bible-journal-state";
import type { ReadingSession, SavedChapter, TypographyPrefs } from "@/lib/reading-state";
import {
  USER_PROGRESS_SYNC_CHANGED,
  USER_SYNC_DYNAMIC_EXTRA_PREFIXES,
  USER_SYNC_EXTRA_KEYS,
  USER_SYNC_EXTRA_META_KEY,
  USER_SYNC_STATUS_EVENT,
  USER_SYNC_STORAGE_KEYS,
  type HighlightSyncEntry,
  type SyncExtraEntry,
  type UserProgressPayload,
  type UserProgressPayloadV1,
  type UserSyncStatus,
} from "@/lib/user-progress-sync-types";

export { USER_PROGRESS_SYNC_CHANGED, USER_SYNC_STATUS_EVENT } from "@/lib/user-progress-sync-types";
export type { UserSyncStatus, UserProgressPayload } from "@/lib/user-progress-sync-types";

type RemoteProgressRow = {
  id: number;
  user_id: string;
  payload: UserProgressPayload | UserProgressPayloadV1 | null;
  updated_at: string | null;
};

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let pushing = false;
let lastPushedAt = 0;
let pendingAfterLogin = false;

/** Reset sync timers after account switch / sign-out. */
export function resetUserProgressSyncState(): void {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  pushing = false;
  lastPushedAt = 0;
  pendingAfterLogin = false;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown, silent = false) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    if (!silent) {
      window.dispatchEvent(new CustomEvent("ab:storage", { detail: { key } }));
    }
  } catch {
    /* ignore */
  }
}

function emitProgressSync() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(USER_PROGRESS_SYNC_CHANGED));
}

export function setUserSyncStatus(status: UserSyncStatus, message?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(USER_SYNC_STATUS_EVENT, { detail: { status, message } }));
}

function readExtraMeta(): Record<string, number> {
  return readJson<Record<string, number>>(USER_SYNC_EXTRA_META_KEY, {});
}

function listDynamicExtraKeys(): string[] {
  if (typeof window === "undefined") return [];
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;
    if (USER_SYNC_DYNAMIC_EXTRA_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      keys.push(key);
    }
  }
  return keys;
}

function profileHasPendingCrop(data: string | null | undefined): boolean {
  if (!data) return false;
  try {
    const parsed = JSON.parse(data) as { customAvatarUrl?: string | null };
    return typeof parsed.customAvatarUrl === "string" && parsed.customAvatarUrl.startsWith("data:");
  } catch {
    return false;
  }
}

function sanitizeProfileUserForSync(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { customAvatarUrl?: string | null };
    if (typeof parsed.customAvatarUrl === "string" && parsed.customAvatarUrl.startsWith("data:")) {
      return JSON.stringify({ ...parsed, customAvatarUrl: null });
    }
  } catch {
    /* ignore */
  }
  return raw;
}

function collectExtras(): Record<string, SyncExtraEntry> {
  const meta = readExtraMeta();
  const extras: Record<string, SyncExtraEntry> = {};
  const allKeys = [...USER_SYNC_EXTRA_KEYS, ...listDynamicExtraKeys()];

  for (const key of allKeys) {
    const raw = window.localStorage.getItem(key);
    if (raw == null) continue;
    const data =
      key === USER_SYNC_STORAGE_KEYS.profileUser ? sanitizeProfileUserForSync(raw) : raw;
    extras[key] = { data, at: meta[key] ?? 0 };
  }
  return extras;
}

function normalizePayload(raw: UserProgressPayload | UserProgressPayloadV1 | null): UserProgressPayload | null {
  if (!raw || typeof raw !== "object") return null;
  if (raw.v === 2) return raw as UserProgressPayload;
  const v1 = raw as UserProgressPayloadV1;
  return {
    v: 2,
    updatedAt: v1.updatedAt ?? Date.now(),
    reading: v1.reading,
    savedChapters: v1.savedChapters,
    highlights: v1.highlights,
    journal: v1.journal,
    journey: v1.journey,
    typo: v1.typo,
    extras: {},
  };
}

export function collectLocalProgressPayload(): UserProgressPayload {
  const settingsRaw =
    typeof window !== "undefined" ? window.localStorage.getItem(USER_SYNC_STORAGE_KEYS.settings) : null;
  let settings: UserProgressPayload["settings"];
  if (settingsRaw) {
    try {
      settings = JSON.parse(settingsRaw) as UserProgressPayload["settings"];
    } catch {
      settings = undefined;
    }
  }

  return {
    v: 2,
    updatedAt: Date.now(),
    reading: {
      current: readJson<ReadingSession | null>(USER_SYNC_STORAGE_KEYS.readingCurrent, null),
      recent: readJson<ReadingSession[]>(USER_SYNC_STORAGE_KEYS.readingRecent, []),
    },
    savedChapters: readJson<SavedChapter[]>(USER_SYNC_STORAGE_KEYS.savedChapters, []),
    highlights: readJson<Record<string, HighlightSyncEntry>>(USER_SYNC_STORAGE_KEYS.highlights, {}),
    journal: readJson<BibleJournalEntry[]>(USER_SYNC_STORAGE_KEYS.journal, []),
    journey: {
      chapters: readJson<JourneyChapterMap>(USER_SYNC_STORAGE_KEYS.journeyChapters, {}),
      streak: readJson<JourneyStreakState>(USER_SYNC_STORAGE_KEYS.journeyStreak, {
        activeDays: [],
        longestStreak: 0,
      }),
    },
    typo: readJson<TypographyPrefs>(USER_SYNC_STORAGE_KEYS.typo, {
      fontSize: 19,
      lineHeight: 2.15,
      readingWidth: 640,
    }),
    settings,
    extras: collectExtras(),
  };
}

function applyExtrasToLocal(extras: Record<string, SyncExtraEntry> | undefined) {
  if (!extras) return;
  const meta = readExtraMeta();
  for (const [key, entry] of Object.entries(extras)) {
    if (key === USER_SYNC_STORAGE_KEYS.profileUser) {
      const current = window.localStorage.getItem(key);
      if (profileHasPendingCrop(current)) continue;
    }
    const data =
      key === USER_SYNC_STORAGE_KEYS.profileUser
        ? sanitizeProfileUserForSync(entry.data)
        : entry.data;
    writeJson(key, data, true);
    meta[key] = entry.at;
  }
  writeJson(USER_SYNC_EXTRA_META_KEY, meta, true);

  if (extras[USER_SYNC_STORAGE_KEYS.settings]) {
    window.dispatchEvent(new CustomEvent("ab:settings"));
  }
  if (extras[USER_SYNC_STORAGE_KEYS.profileUser]) {
    window.dispatchEvent(new CustomEvent("ab:profile-user"));
  }
  if (extras[USER_SYNC_STORAGE_KEYS.highlights]) {
    window.dispatchEvent(new Event("ab:verse-highlights-changed"));
  }
}

function applyPayloadToLocal(payload: UserProgressPayload) {
  if (payload.reading) {
    writeJson(USER_SYNC_STORAGE_KEYS.readingCurrent, payload.reading.current);
    writeJson(USER_SYNC_STORAGE_KEYS.readingRecent, payload.reading.recent);
  }
  if (payload.savedChapters) {
    writeJson(USER_SYNC_STORAGE_KEYS.savedChapters, payload.savedChapters);
  }
  if (payload.highlights) {
    writeJson(USER_SYNC_STORAGE_KEYS.highlights, payload.highlights);
    window.dispatchEvent(new Event("ab:verse-highlights-changed"));
  }
  if (payload.journal) {
    writeJson(USER_SYNC_STORAGE_KEYS.journal, payload.journal);
  }
  if (payload.journey) {
    writeJson(USER_SYNC_STORAGE_KEYS.journeyChapters, payload.journey.chapters);
    writeJson(USER_SYNC_STORAGE_KEYS.journeyStreak, payload.journey.streak);
  }
  if (payload.typo) {
    writeJson(USER_SYNC_STORAGE_KEYS.typo, payload.typo);
  }
  if (payload.settings) {
    writeJson(USER_SYNC_STORAGE_KEYS.settings, payload.settings);
    window.dispatchEvent(new CustomEvent("ab:settings"));
  }
  applyExtrasToLocal(payload.extras);
  emitProgressSync();
}

function mergeReadingSessions(a: ReadingSession[], b: ReadingSession[]): ReadingSession[] {
  const byKey = new Map<string, ReadingSession>();
  for (const row of [...a, ...b]) {
    const key = `${row.book}::${row.chapter}`;
    const prev = byKey.get(key);
    if (!prev || row.lastOpenedAt > prev.lastOpenedAt) byKey.set(key, row);
  }
  return [...byKey.values()].sort((x, y) => y.lastOpenedAt - x.lastOpenedAt).slice(0, 6);
}

function mergeHighlights(
  a: Record<string, HighlightSyncEntry>,
  b: Record<string, HighlightSyncEntry>,
): Record<string, HighlightSyncEntry> {
  const out: Record<string, HighlightSyncEntry> = { ...a };
  for (const [key, entry] of Object.entries(b)) {
    const prev = out[key];
    if (!prev || entry.highlightedAt >= prev.highlightedAt) out[key] = entry;
  }
  return out;
}

function mergeJournal(a: BibleJournalEntry[], b: BibleJournalEntry[]): BibleJournalEntry[] {
  const byId = new Map<string, BibleJournalEntry>();
  for (const row of [...a, ...b]) {
    const prev = byId.get(row.id);
    if (!prev || row.updatedAt >= prev.updatedAt) byId.set(row.id, row);
  }
  return [...byId.values()].sort((x, y) => y.updatedAt - x.updatedAt);
}

function mergeJourneyChapters(a: JourneyChapterMap, b: JourneyChapterMap): JourneyChapterMap {
  const out: JourneyChapterMap = { ...a };
  for (const [key, row] of Object.entries(b)) {
    const prev = out[key];
    if (!prev || row.lastReadAt >= prev.lastReadAt) out[key] = row;
  }
  return out;
}

function mergeStreak(a: JourneyStreakState, b: JourneyStreakState): JourneyStreakState {
  const activeDays = [...new Set([...a.activeDays, ...b.activeDays])];
  return {
    activeDays,
    longestStreak: Math.max(a.longestStreak, b.longestStreak),
    lastReadDay: [a.lastReadDay, b.lastReadDay].filter(Boolean).sort().at(-1),
  };
}

function mergeSavedChapters(a: SavedChapter[], b: SavedChapter[]): SavedChapter[] {
  const byId = new Map<string, SavedChapter>();
  for (const row of [...a, ...b]) {
    const prev = byId.get(row.id);
    if (!prev || row.savedAt >= prev.savedAt) byId.set(row.id, row);
  }
  return [...byId.values()].sort((x, y) => y.savedAt - x.savedAt);
}

function mergeExtras(
  a: Record<string, SyncExtraEntry>,
  b: Record<string, SyncExtraEntry>,
): Record<string, SyncExtraEntry> {
  const out: Record<string, SyncExtraEntry> = { ...b };
  for (const [key, entry] of Object.entries(a)) {
    const prev = out[key];
    if (key === USER_SYNC_STORAGE_KEYS.profileUser) {
      const currentRaw =
        typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      if (profileHasPendingCrop(currentRaw) && currentRaw) {
        out[key] = { data: currentRaw, at: Math.max(entry.at, prev?.at ?? 0) };
        continue;
      }
      const sanitized = sanitizeProfileUserForSync(entry.data);
      if (!prev || entry.at >= prev.at) out[key] = { ...entry, data: sanitized };
      continue;
    }
    if (!prev || entry.at >= prev.at) out[key] = entry;
  }
  return out;
}

function mergeSettings(
  a: UserProgressPayload["settings"],
  b: UserProgressPayload["settings"],
  localNewer: boolean,
): UserProgressPayload["settings"] {
  if (!a && !b) return undefined;
  if (!a) return b;
  if (!b) return a;
  return localNewer ? { ...b, ...a } : { ...a, ...b };
}

export function mergeProgressPayloads(
  local: UserProgressPayload,
  remote: UserProgressPayload,
): UserProgressPayload {
  const localCurrent = local.reading?.current ?? null;
  const remoteCurrent = remote.reading?.current ?? null;
  const localNewer = local.updatedAt >= remote.updatedAt;
  const current =
    !localCurrent ? remoteCurrent
    : !remoteCurrent ? localCurrent
    : localCurrent.lastOpenedAt >= remoteCurrent.lastOpenedAt
      ? localCurrent
      : remoteCurrent;

  return {
    v: 2,
    updatedAt: Math.max(local.updatedAt, remote.updatedAt, Date.now()),
    reading: {
      current,
      recent: mergeReadingSessions(local.reading?.recent ?? [], remote.reading?.recent ?? []),
    },
    savedChapters: mergeSavedChapters(local.savedChapters ?? [], remote.savedChapters ?? []),
    highlights: mergeHighlights(local.highlights ?? {}, remote.highlights ?? {}),
    journal: mergeJournal(local.journal ?? [], remote.journal ?? []),
    journey: {
      chapters: mergeJourneyChapters(
        local.journey?.chapters ?? {},
        remote.journey?.chapters ?? {},
      ),
      streak: mergeStreak(
        local.journey?.streak ?? { activeDays: [], longestStreak: 0 },
        remote.journey?.streak ?? { activeDays: [], longestStreak: 0 },
      ),
    },
    typo: (localNewer ? local.typo : remote.typo) ?? local.typo ?? remote.typo,
    settings: mergeSettings(local.settings, remote.settings, localNewer),
    extras: mergeExtras(local.extras ?? {}, remote.extras ?? {}),
  };
}

async function fetchRemoteProgressRow(): Promise<RemoteProgressRow | null> {
  if (!isAuthenticated()) return null;
  const uid = await getAuthUserId();
  if (!uid) return null;

  const { data, error } = await supabase
    .from("users_progress")
    .select("id, user_id, payload, updated_at")
    .eq("user_id", uid)
    .maybeSingle();

  if (error) {
    console.error("[user-progress] fetch", error.message);
    setUserSyncStatus("error", error.message);
    return null;
  }
  return (data as RemoteProgressRow | null) ?? null;
}

export async function pullUserProgressFromRemote(): Promise<UserProgressPayload | null> {
  setUserSyncStatus("syncing");
  const row = await fetchRemoteProgressRow();
  const remote = normalizePayload(row?.payload ?? null);
  if (!remote) {
    setUserSyncStatus("synced");
    return null;
  }

  const local = collectLocalProgressPayload();
  const merged = mergeProgressPayloads(local, remote);
  applyPayloadToLocal(merged);
  setUserSyncStatus("synced");
  return merged;
}

async function pushUserProgressOnce(force = false): Promise<boolean> {
  if (!isAuthenticated()) {
    pendingAfterLogin = true;
    return false;
  }

  const uid = await getAuthUserId();
  if (!uid) {
    pendingAfterLogin = true;
    return false;
  }

  const local = collectLocalProgressPayload();
  if (!force && local.updatedAt <= lastPushedAt) return true;

  pushing = true;
  setUserSyncStatus("syncing");
  try {
    const remoteRow = await fetchRemoteProgressRow();
    const remote = normalizePayload(remoteRow?.payload ?? null);
    const merged = remote ? mergeProgressPayloads(local, remote) : local;

    const { error } = await supabase.from("users_progress").upsert(
      {
        user_id: uid,
        payload: merged as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      console.error("[user-progress] upsert", error.message);
      setUserSyncStatus("error", "تعذّر حفظ البيانات على السحابة");
      return false;
    }

    lastPushedAt = merged.updatedAt;
    pendingAfterLogin = false;
    setUserSyncStatus("synced");
    return true;
  } finally {
    pushing = false;
  }
}

export async function pushUserProgressToRemote(force = false): Promise<boolean> {
  if (pushing) return false;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const ok = await pushUserProgressOnce(force);
    if (ok) return true;
    if (!isAuthenticated()) return false;
    await sleep(700 * (attempt + 1));
  }
  return false;
}

export function scheduleUserProgressPush(delayMs = 2500) {
  if (typeof window === "undefined") return;
  if (!isAuthenticated()) pendingAfterLogin = true;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void pushUserProgressToRemote();
  }, delayMs);
}

export function scheduleUserProgressPushDebounced(delayMs = 6000) {
  scheduleUserProgressPush(delayMs);
}

export async function flushUserProgressPush(): Promise<boolean> {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  return pushUserProgressToRemote(true);
}

export async function runFullUserProgressSync(): Promise<void> {
  const uid = await waitForAuthUserId(12000);
  if (!uid) return;

  setUserSyncStatus("syncing");
  await pullUserProgressFromRemote();
  await pushUserProgressToRemote(true);
  if (pendingAfterLogin) {
    pendingAfterLogin = false;
    await pushUserProgressToRemote(true);
  }
}

export function hasPendingUserSync(): boolean {
  return pendingAfterLogin;
}
