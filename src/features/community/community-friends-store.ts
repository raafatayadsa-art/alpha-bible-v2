import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { ResolvablePerson } from "@/features/profile/profile-people-resolve";

export const COMMUNITY_FRIENDS_CHANGED = "ab:community-friends-changed";

const STORAGE_KEY = "ab:community-friends-v1";

export type CommunityFriend = {
  id: string;
  linkedUserId?: string;
  name: string;
  avatarUrl?: string;
  alphaId?: string;
  role?: string;
  addedAt: string;
};

const listeners = new Set<() => void>();

let friendsSnapshotCache: CommunityFriend[] | null = null;

function invalidateFriendsSnapshot() {
  friendsSnapshotCache = null;
}

function readFriends(): CommunityFriend[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CommunityFriend[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFriends(list: CommunityFriend[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  invalidateFriendsSnapshot();
  window.dispatchEvent(new Event(COMMUNITY_FRIENDS_CHANGED));
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener(COMMUNITY_FRIENDS_CHANGED, listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener(COMMUNITY_FRIENDS_CHANGED, listener);
    }
  };
}

function isDuplicate(list: CommunityFriend[], person: Pick<CommunityFriend, "linkedUserId" | "alphaId" | "name">) {
  return list.some(
    (f) =>
      (person.linkedUserId && f.linkedUserId === person.linkedUserId) ||
      (person.alphaId && f.alphaId && f.alphaId === person.alphaId) ||
      f.name.trim() === person.name.trim(),
  );
}

export function getCommunityFriends(): CommunityFriend[] {
  if (friendsSnapshotCache) return friendsSnapshotCache;
  friendsSnapshotCache = readFriends();
  return friendsSnapshotCache;
}

export function getCommunityFriendUserIds(): string[] {
  return readFriends().map((f) => f.linkedUserId).filter(Boolean) as string[];
}

export function addCommunityFriend(
  person: Omit<CommunityFriend, "id" | "addedAt">,
): CommunityFriend | null {
  const list = readFriends();
  if (isDuplicate(list, person)) return null;
  const entry: CommunityFriend = {
    ...person,
    id: `cf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    addedAt: new Date().toISOString(),
  };
  writeFriends([entry, ...list]);
  return entry;
}

export function addCommunityFriendFromPerson(person: ResolvablePerson, role?: string): CommunityFriend | null {
  const entry = addCommunityFriend({
    linkedUserId: person.linkedUserId,
    name: person.name,
    avatarUrl: person.avatarUrl,
    alphaId: person.alphaId,
    role: role ?? person.churchName ?? "صديق",
  });
  if (entry?.linkedUserId) {
    void import("./community-friends-api").then(({ requestCommunityFriendConnection }) =>
      requestCommunityFriendConnection(entry.linkedUserId!),
    );
  }
  return entry;
}

export function removeCommunityFriend(id: string) {
  writeFriends(readFriends().filter((f) => f.id !== id));
}

const EMPTY_FRIENDS: CommunityFriend[] = [];

export function useCommunityFriends() {
  const friends = useSyncExternalStore(subscribe, getCommunityFriends, () => EMPTY_FRIENDS);
  const refresh = useCallback(() => {
    void import("./community-friends-api").then(({ syncCommunityFriendsFromRemote }) =>
      syncCommunityFriendsFromRemote(),
    );
  }, []);
  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);
  return { friends, refresh };
}
