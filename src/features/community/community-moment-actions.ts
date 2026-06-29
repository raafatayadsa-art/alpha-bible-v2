import { useSyncExternalStore } from "react";

export const COMMUNITY_PIN_CHANGED = "ab:community-pin-changed";

const PIN_KEY = "ab:community-pinned-moments-v1";

const pinListeners = new Set<() => void>();

const EMPTY_PINNED: string[] = [];
let pinnedSnapshot: string[] = EMPTY_PINNED;
let pinnedSnapshotRaw = "";
let orderedMomentsCache: { momentsKey: string; pinnedRaw: string; result: unknown[] } | null = null;

function invalidateOrderedMomentsCache() {
  orderedMomentsCache = null;
}

function notifyPin() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(COMMUNITY_PIN_CHANGED));
  }
  pinListeners.forEach((l) => l());
}

function readPinnedSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY_PINNED;
  try {
    const raw = window.localStorage.getItem(PIN_KEY) ?? "";
    if (raw === pinnedSnapshotRaw) return pinnedSnapshot;
    pinnedSnapshotRaw = raw;
    if (!raw) {
      pinnedSnapshot = EMPTY_PINNED;
      return pinnedSnapshot;
    }
    const parsed = JSON.parse(raw) as string[];
    pinnedSnapshot = Array.isArray(parsed) ? parsed : EMPTY_PINNED;
    return pinnedSnapshot;
  } catch {
    pinnedSnapshotRaw = "";
    pinnedSnapshot = EMPTY_PINNED;
    return pinnedSnapshot;
  }
}

function writePinned(ids: string[]) {
  if (typeof window === "undefined") return;
  const next = ids.slice(0, 20);
  const raw = JSON.stringify(next);
  window.localStorage.setItem(PIN_KEY, raw);
  pinnedSnapshotRaw = raw;
  pinnedSnapshot = next;
  invalidateOrderedMomentsCache();
  notifyPin();
}

export function getPinnedCommunityMomentIds(): string[] {
  return readPinnedSnapshot();
}

export function isCommunityMomentPinned(id: string): boolean {
  return readPinnedSnapshot().includes(id);
}

export function togglePinCommunityMoment(id: string): boolean {
  const list = readPinnedSnapshot();
  if (list.includes(id)) {
    writePinned(list.filter((x) => x !== id));
    return false;
  }
  writePinned([id, ...list.filter((x) => x !== id)]);
  return true;
}

export function orderMomentsWithPins<T extends { id: string }>(moments: T[]): T[] {
  const pinned = readPinnedSnapshot();
  const pinnedRaw = pinnedSnapshotRaw;
  const momentsKey = moments.map((m) => m.id).join("|");
  if (
    orderedMomentsCache &&
    orderedMomentsCache.momentsKey === momentsKey &&
    orderedMomentsCache.pinnedRaw === pinnedRaw
  ) {
    return orderedMomentsCache.result as T[];
  }

  if (!pinned.length) {
    orderedMomentsCache = { momentsKey, pinnedRaw, result: moments as unknown[] };
    return moments;
  }

  const byId = new Map(moments.map((m) => [m.id, m]));
  const head: T[] = [];
  for (const id of pinned) {
    const m = byId.get(id);
    if (m) head.push(m);
  }
  const pinnedSet = new Set(head.map((m) => m.id));
  const result = [...head, ...moments.filter((m) => !pinnedSet.has(m.id))];
  orderedMomentsCache = { momentsKey, pinnedRaw, result: result as unknown[] };
  return result;
}

function subscribePin(listener: () => void) {
  pinListeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener(COMMUNITY_PIN_CHANGED, listener);
  }
  return () => {
    pinListeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener(COMMUNITY_PIN_CHANGED, listener);
    }
  };
}

export function usePinnedCommunityMomentIds(): string[] {
  return useSyncExternalStore(subscribePin, readPinnedSnapshot, () => EMPTY_PINNED);
}
