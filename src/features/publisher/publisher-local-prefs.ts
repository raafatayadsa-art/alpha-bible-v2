import type { PublisherContentItem } from "./types";

const CONTINUE_PREFIX = "alpha:publisher:continue:";
const FAVORITES_PREFIX = "alpha:publisher:favorites:";
const PREFS_EVENT = "ab:publisher-local-prefs";

export type PublisherContinueEntry = {
  contentId: string;
  title: string;
  coverUrl: string | null;
  contentKind: PublisherContentItem["contentKind"];
  progressPct: number;
  positionSec: number;
  durationSec: number;
  updatedAt: number;
};

export type PublisherFavoriteEntry = {
  contentId: string;
  title: string;
  coverUrl: string | null;
  contentKind: PublisherContentItem["contentKind"];
  addedAt: number;
};

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

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(PREFS_EVENT, { detail: { key } }));
  } catch {
    /* ignore */
  }
}

export function readPublisherContinue(publisherId: string): PublisherContinueEntry | null {
  return readJson<PublisherContinueEntry | null>(`${CONTINUE_PREFIX}${publisherId}`, null);
}

export function writePublisherContinue(publisherId: string, entry: PublisherContinueEntry) {
  writeJson(`${CONTINUE_PREFIX}${publisherId}`, entry);
}

export function clearPublisherContinue(publisherId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(`${CONTINUE_PREFIX}${publisherId}`);
    window.dispatchEvent(new CustomEvent(PREFS_EVENT));
  } catch {
    /* ignore */
  }
}

export function readPublisherFavorites(publisherId: string): PublisherFavoriteEntry[] {
  return readJson<PublisherFavoriteEntry[]>(`${FAVORITES_PREFIX}${publisherId}`, []);
}

export function isPublisherFavorite(publisherId: string, contentId: string): boolean {
  return readPublisherFavorites(publisherId).some((f) => f.contentId === contentId);
}

export function togglePublisherFavorite(
  publisherId: string,
  item: Pick<PublisherContentItem, "id" | "title" | "coverUrl" | "contentKind">,
): boolean {
  const list = readPublisherFavorites(publisherId);
  const exists = list.some((f) => f.contentId === item.id);
  const next = exists
    ? list.filter((f) => f.contentId !== item.id)
    : [
        {
          contentId: item.id,
          title: item.title,
          coverUrl: item.coverUrl,
          contentKind: item.contentKind,
          addedAt: Date.now(),
        },
        ...list,
      ].slice(0, 48);
  writeJson(`${FAVORITES_PREFIX}${publisherId}`, next);
  return !exists;
}

export function subscribePublisherPrefs(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange();
  window.addEventListener(PREFS_EVENT, handler);
  return () => window.removeEventListener(PREFS_EVENT, handler);
}
