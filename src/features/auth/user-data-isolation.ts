import {
  USER_SYNC_DYNAMIC_EXTRA_PREFIXES,
  USER_SYNC_EXTRA_KEYS,
  USER_SYNC_EXTRA_META_KEY,
  USER_SYNC_STORAGE_KEYS,
  USER_PROGRESS_SYNC_CHANGED,
} from "@/lib/user-progress-sync-types";
import { SAVED_VERSES_SYNC_CHANGED } from "@/lib/saved-verses-sync";
import { DEFAULT_PROFILE_USER, saveProfileUserState } from "@/features/profile/profile-user-store";
import { clearProfilePeopleLinks } from "@/features/profile/profile-people-store";
import { clearMemberChurchCache } from "@/features/church/member-church-api";
import { COMMUNITY_CHANGED } from "@/features/community/community-store";
import { COMMUNITY_FRIENDS_CHANGED } from "@/features/community/community-friends-store";
import { COMMUNITY_MODERATION_CHANGED } from "@/features/community/community-moderation-store";
import { SPIRITUAL_RECORD_CHANGED } from "@/features/community/spiritual-record-store";
import { VERSE_HIGHLIGHTS_CHANGED } from "@/lib/verse-highlights";
import { resetUserProgressSyncState } from "@/lib/user-progress-sync";

/** Tracks the last authenticated user bound to this browser profile. */
export const LAST_BOUND_AUTH_USER_KEY = "ab:last-bound-auth-user-id";

const COMMUNITY_KEYS = [
  "ab:community-hub-v1",
  "ab:community-friends-v1",
  "ab:community-spiritual-record-v1",
  "ab:community-demo-preview-v2",
  "ab:community-pinned-moments-v1",
  "ab:community-blocked-users-v1",
  "ab:community-reported-comments-v1",
  "alpha:profile-people-links:v1",
  "alpha:profile:publisher-reposts",
  "alpha:profile:content-reposts",
  "ab:saved:verses",
] as const;

export function readLastBoundAuthUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LAST_BOUND_AUTH_USER_KEY);
  } catch {
    return null;
  }
}

export function writeLastBoundAuthUserId(userId: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (userId) localStorage.setItem(LAST_BOUND_AUTH_USER_KEY, userId);
    else localStorage.removeItem(LAST_BOUND_AUTH_USER_KEY);
  } catch {
    /* ignore */
  }
}

function collectDynamicUserKeys(): string[] {
  if (typeof window === "undefined") return [];
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key || key === LAST_BOUND_AUTH_USER_KEY) continue;
    if (USER_SYNC_DYNAMIC_EXTRA_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      keys.push(key);
    }
  }
  return keys;
}

/** Remove all local caches tied to a single user account on this device. */
export function clearUserScopedLocalData(): void {
  if (typeof window === "undefined") return;

  const staticKeys = new Set<string>([
    ...Object.values(USER_SYNC_STORAGE_KEYS),
    ...USER_SYNC_EXTRA_KEYS,
    USER_SYNC_EXTRA_META_KEY,
    ...COMMUNITY_KEYS,
  ]);

  for (const key of collectDynamicUserKeys()) {
    staticKeys.add(key);
  }

  for (const key of staticKeys) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }

  clearProfilePeopleLinks();
  saveProfileUserState({ ...DEFAULT_PROFILE_USER });
  clearMemberChurchCache();
  void import("@/features/community/community-store").then(({ resetCommunityLocalStore }) => {
    resetCommunityLocalStore();
  });

  window.dispatchEvent(new CustomEvent("ab:profile-user", { detail: DEFAULT_PROFILE_USER }));
  window.dispatchEvent(new Event(COMMUNITY_CHANGED));
  window.dispatchEvent(new Event(COMMUNITY_FRIENDS_CHANGED));
  window.dispatchEvent(new Event(COMMUNITY_MODERATION_CHANGED));
  window.dispatchEvent(new Event(SPIRITUAL_RECORD_CHANGED));
  window.dispatchEvent(new Event(USER_PROGRESS_SYNC_CHANGED));
  window.dispatchEvent(new Event(VERSE_HIGHLIGHTS_CHANGED));
  window.dispatchEvent(new Event(SAVED_VERSES_SYNC_CHANGED));
  window.dispatchEvent(new CustomEvent("ab:storage", { detail: { key: USER_SYNC_STORAGE_KEYS.saved } }));
}

/**
 * Call whenever Supabase auth user id changes (login, logout, account switch).
 * Returns true when local user caches were wiped for isolation.
 */
export function handleAuthUserTransition(nextUserId: string | null): boolean {
  const previous = readLastBoundAuthUserId();
  if (previous === nextUserId) return false;

  clearUserScopedLocalData();
  resetUserProgressSyncState();

  writeLastBoundAuthUserId(nextUserId);
  return true;
}
