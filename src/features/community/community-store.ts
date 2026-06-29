import { useSyncExternalStore, useEffect } from "react";
import { getCurrentUser, isAuthenticated } from "@/features/church/current-user";
import { getCachedMemberChurch } from "@/features/church/member-church-api";
import {
  fetchCommunityRemote,
  insertCommunityCommentRemote,
  insertCommunityMomentRemote,
  toggleCommunityReactionRemote,
} from "./community-api";
import type {
  CommunityComment,
  CommunityMoment,
  CommunityReactionKind,
  ShareToCommunityInput,
} from "./community-types";
import { COMMUNITY_KIND_META } from "./community-types";
import { COMMUNITY_MODERATION_CHANGED, getBlockedCommunityUserIds } from "./community-moderation-store";
import { COMMUNITY_FRIENDS_CHANGED } from "./community-friends-store";

export const COMMUNITY_CHANGED = "ab:community-changed";

const STORAGE_KEY = "ab:community-hub-v1";
const MAX_MOMENTS = 200;

type CommunityBlob = {
  moments: CommunityMoment[];
  comments: Record<string, CommunityComment[]>;
  reactions: Record<string, Record<CommunityReactionKind, { count: number; mine: boolean }>>;
};

const listeners = new Set<() => void>();
let syncStarted = false;

const momentsListCache = new Map<string, CommunityMoment[]>();
const commentsListCache = new Map<string, CommunityComment[]>();
const reactionsSnapshotCache = new Map<
  string,
  Record<CommunityReactionKind, { count: number; mine: boolean }>
>();

function clearSnapshotCaches() {
  momentsListCache.clear();
  commentsListCache.clear();
  reactionsSnapshotCache.clear();
  userMomentsCache.clear();
  friendFeedCache = null;
}

let friendFeedCache: { key: string; list: CommunityMoment[] } | null = null;
const userMomentsCache = new Map<string, CommunityMoment[]>();

function emptyBlob(): CommunityBlob {
  return { moments: [], comments: {}, reactions: {} };
}

function readBlob(): CommunityBlob {
  if (typeof window === "undefined") return emptyBlob();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyBlob();
    const parsed = JSON.parse(raw) as CommunityBlob;
    return {
      moments: Array.isArray(parsed.moments) ? parsed.moments : [],
      comments: parsed.comments && typeof parsed.comments === "object" ? parsed.comments : {},
      reactions: parsed.reactions && typeof parsed.reactions === "object" ? parsed.reactions : {},
    };
  } catch {
    return emptyBlob();
  }
}

function writeBlob(blob: CommunityBlob) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
  } catch {
    /* ignore */
  }
}

function notify() {
  clearSnapshotCaches();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(COMMUNITY_CHANGED));
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener(COMMUNITY_CHANGED, listener);
    window.addEventListener(COMMUNITY_MODERATION_CHANGED, listener);
    window.addEventListener(COMMUNITY_FRIENDS_CHANGED, listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener(COMMUNITY_CHANGED, listener);
      window.removeEventListener(COMMUNITY_MODERATION_CHANGED, listener);
      window.removeEventListener(COMMUNITY_FRIENDS_CHANGED, listener);
    }
  };
}

/** Refresh lists after block/unblock without rewriting blob. */
export function refreshCommunityFeedCaches(): void {
  clearSnapshotCaches();
  listeners.forEach((l) => l());
}

const EMPTY_REACTIONS_BY_KIND: Record<
  CommunityMoment["kind"],
  Record<CommunityReactionKind, { count: number; mine: boolean }>
> = {
  reading: { amen: { count: 0, mine: false }, prayed_for: { count: 0, mine: false } },
  agpeya: { amen: { count: 0, mine: false }, prayed_for: { count: 0, mine: false } },
  prayer: { amen: { count: 0, mine: false }, prayed_for: { count: 0, mine: false } },
};

function emptyReactions(kind: CommunityMoment["kind"]) {
  return EMPTY_REACTIONS_BY_KIND[kind] ?? EMPTY_REACTIONS_BY_KIND.reading;
}

function isValidMomentKind(kind: unknown): kind is CommunityMoment["kind"] {
  return kind === "reading" || kind === "prayer" || kind === "agpeya";
}

function mergeRemoteIntoLocal(remote: Awaited<ReturnType<typeof fetchCommunityRemote>>) {
  if (!remote) return;
  const blob = readBlob();
  const byId = new Map(blob.moments.map((m) => [m.id, m]));

  for (const m of remote.moments) {
    if (!isValidMomentKind(m.kind)) continue;
    if (!byId.has(m.id)) byId.set(m.id, m);
  }

  blob.moments = [...byId.values()]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_MOMENTS);

  for (const [momentId, list] of Object.entries(remote.comments)) {
    const local = blob.comments[momentId] ?? [];
    const merged = [...local];
    for (const c of list) {
      if (!merged.some((x) => x.id === c.id)) merged.push(c);
    }
    blob.comments[momentId] = merged;
  }

  for (const [momentId, rx] of Object.entries(remote.reactions)) {
    blob.reactions[momentId] = rx;
  }

  for (const m of blob.moments) {
    if (!blob.reactions[m.id]) blob.reactions[m.id] = emptyReactions(m.kind);
    if (!blob.comments[m.id]) blob.comments[m.id] = [];
  }

  writeBlob(blob);
  notify();
}

export async function syncCommunityFeed(churchId?: string | null): Promise<void> {
  const { getCommunityFriendUserIds } = await import("./community-friends-store");
  const friendIds = getCommunityFriendUserIds();
  const remote = await fetchCommunityRemote(churchId ?? getCachedMemberChurch()?.id, friendIds);
  mergeRemoteIntoLocal(remote);
}

type DemoPreviewPayload = {
  moments: CommunityMoment[];
  comments: Record<string, CommunityComment[]>;
  reactions: Record<string, Record<CommunityReactionKind, { count: number; mine: boolean }>>;
};

/** Merge fixed demo moments/comments/reactions for community UI preview. */
export function mergeDemoCommunityPreview(payload: DemoPreviewPayload): void {
  const blob = readBlob();
  const existingMomentIds = new Set(blob.moments.map((m) => m.id));
  const newMoments = payload.moments.filter((m) => !existingMomentIds.has(m.id));
  if (newMoments.length) {
    blob.moments = [...newMoments, ...blob.moments].slice(0, MAX_MOMENTS);
  }

  for (const [momentId, comments] of Object.entries(payload.comments)) {
    if (!blob.comments[momentId]?.length) {
      blob.comments[momentId] = comments;
    }
  }

  for (const [momentId, reactions] of Object.entries(payload.reactions)) {
    if (!blob.reactions[momentId]) {
      blob.reactions[momentId] = reactions;
    }
  }

  writeBlob(blob);
  notify();
}

export function bootstrapCommunityFeed() {
  if (syncStarted || typeof window === "undefined") return;
  syncStarted = true;
  void import("./community-realtime").then((m) => m.bootstrapCommunityRealtime());
  void import("./spiritual-record-store").then((m) => m.backfillSpiritualRecordFromMoments());
  void syncCommunityFeed();
}

/** Wipe local community feed cache — call on account switch / sign-out. */
export function resetCommunityLocalStore(): void {
  if (typeof window === "undefined") return;
  writeBlob(emptyBlob());
  syncStarted = false;
  notify();
}

function validateShareInput(input: ShareToCommunityInput): boolean {
  if (input.kind === "reading") {
    const r = input.reading;
    return Boolean(r.reference?.trim() && r.text?.trim());
  }
  if (input.kind === "prayer") {
    const p = input.prayer;
    return Boolean(p.title?.trim() && p.body?.trim());
  }
  if (input.kind === "agpeya") {
    const a = input.agpeya;
    return Boolean(a.prayerId?.trim() && a.title?.trim());
  }
  return false;
}

export function shareToCommunity(
  input: ShareToCommunityInput,
  opts?: {
    churchId?: string;
    churchName?: string;
    churchPostId?: string;
    source?: CommunityMoment["source"];
  },
): CommunityMoment | null {
  if (!isAuthenticated()) return null;
  if (!validateShareInput(input)) return null;

  const user = getCurrentUser();
  const blob = readBlob();
  const cachedChurch = getCachedMemberChurch();
  const churchId = opts?.churchId ?? cachedChurch?.id;
  const churchName = opts?.churchName ?? cachedChurch?.name;

  const payload =
    input.kind === "reading"
      ? { reading: input.reading }
      : input.kind === "prayer"
        ? { prayer: input.prayer }
        : { agpeya: input.agpeya };

  const moment: CommunityMoment = {
    id: crypto.randomUUID(),
    kind: input.kind,
    userId: user.id,
    userName: user.name || "عضو Alpha",
    userAvatarUrl: user.avatarUrl || undefined,
    churchId,
    churchName,
    payload,
    createdAt: new Date().toISOString(),
    churchPostId: opts?.churchPostId,
    source:
      opts?.source ??
      (input.kind === "reading" && input.reading.auto
        ? "auto_chapter"
        : input.kind === "agpeya" && input.agpeya.auto
          ? "auto_agpeya"
          : "manual"),
  };

  blob.moments = [moment, ...blob.moments].slice(0, MAX_MOMENTS);
  blob.reactions[moment.id] = emptyReactions(moment.kind);
  blob.comments[moment.id] = blob.comments[moment.id] ?? [];
  writeBlob(blob);
  notify();
  void insertCommunityMomentRemote(moment);
  return moment;
}

export function listCommunityMoments(filter?: CommunityMoment["kind"] | "all"): CommunityMoment[] {
  const cacheKey = filter ?? "all";
  const cached = momentsListCache.get(cacheKey);
  if (cached) return cached;

  const { moments } = readBlob();
  const blocked = new Set(getBlockedCommunityUserIds());
  const sorted = [...moments]
    .filter((m) => isValidMomentKind(m.kind) && !blocked.has(m.userId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const list = !filter || filter === "all" ? sorted : sorted.filter((m) => m.kind === filter);
  momentsListCache.set(cacheKey, list);
  return list;
}

export function listCommunityMomentsForUser(userId: string): CommunityMoment[] {
  const cacheKey = userId.trim();
  const cached = userMomentsCache.get(cacheKey);
  if (cached) return cached;

  const list = listCommunityMoments("all").filter((m) => m.userId === cacheKey);
  userMomentsCache.set(cacheKey, list);
  return list;
}

export function listCommunityFriendFeed(friendUserIds: string[], selfUserId?: string): CommunityMoment[] {
  const key = `${selfUserId ?? ""}::${[...friendUserIds].sort().join(",")}`;
  if (friendFeedCache?.key === key) return friendFeedCache.list;

  const allow = new Set(friendUserIds.filter(Boolean));
  if (selfUserId) allow.add(selfUserId);
  const blocked = new Set(getBlockedCommunityUserIds());
  const all = listCommunityMoments("all").filter((m) => !blocked.has(m.userId));
  const filtered = friendUserIds.length === 0 ? all : all.filter((m) => allow.has(m.userId));
  const list = filtered.length > 0 ? filtered : all;
  friendFeedCache = { key, list };
  return list;
}

export function useCommunityFriendFeed(friendUserIds: string[]) {
  const selfId = getCurrentUser().id;

  useEffect(() => {
    bootstrapCommunityFeed();
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => listCommunityFriendFeed(friendUserIds, selfId),
    () => [],
  );
}

export function useCommunityUserMoments(userId: string) {
  useEffect(() => {
    bootstrapCommunityFeed();
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => listCommunityMomentsForUser(userId),
    () => [],
  );
}

export function getCommunityComments(momentId: string): CommunityComment[] {
  const cached = commentsListCache.get(momentId);
  if (cached) return cached;

  const blocked = new Set(getBlockedCommunityUserIds());
  const list = (readBlob().comments[momentId] ?? []).filter((c) => !blocked.has(c.userId));
  commentsListCache.set(momentId, list);
  return list;
}

export function getCommunityReactions(momentId: string, kind: CommunityMoment["kind"]) {
  const cacheKey = `${momentId}:${kind}`;
  const cached = reactionsSnapshotCache.get(cacheKey);
  if (cached) return cached;

  const blob = readBlob();
  const snapshot = blob.reactions[momentId] ?? emptyReactions(kind);
  reactionsSnapshotCache.set(cacheKey, snapshot);
  return snapshot;
}

export function addCommunityComment(momentId: string, text: string): CommunityComment | null {
  const trimmed = text.trim();
  if (!trimmed || !isAuthenticated()) return null;

  const user = getCurrentUser();
  const blob = readBlob();
  if (!blob.moments.some((m) => m.id === momentId)) return null;

  const comment: CommunityComment = {
    id: crypto.randomUUID(),
    momentId,
    userId: user.id,
    userName: user.name || "عضو Alpha",
    userAvatarUrl: user.avatarUrl || undefined,
    text: trimmed.slice(0, 500),
    createdAt: new Date().toISOString(),
  };

  const list = [...(blob.comments[momentId] ?? []), comment];
  blob.comments[momentId] = list;
  writeBlob(blob);
  notify();
  void insertCommunityCommentRemote(comment);
  return comment;
}

export function updateCommunityComment(momentId: string, commentId: string, text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || !isAuthenticated()) return false;

  const user = getCurrentUser();
  const blob = readBlob();
  const list = blob.comments[momentId] ?? [];
  const idx = list.findIndex((c) => c.id === commentId);
  if (idx < 0 || list[idx].userId !== user.id) return false;

  const updated: CommunityComment = {
    ...list[idx],
    text: trimmed.slice(0, 500),
    updatedAt: new Date().toISOString(),
  };
  list[idx] = updated;
  blob.comments[momentId] = list;
  writeBlob(blob);
  notify();
  void import("./community-api").then(({ updateCommunityCommentRemote }) =>
    updateCommunityCommentRemote(updated),
  );
  return true;
}

export function deleteCommunityComment(momentId: string, commentId: string): boolean {
  if (!isAuthenticated()) return false;

  const user = getCurrentUser();
  const blob = readBlob();
  const list = blob.comments[momentId] ?? [];
  const target = list.find((c) => c.id === commentId);
  if (!target || target.userId !== user.id) return false;

  blob.comments[momentId] = list.filter((c) => c.id !== commentId);
  writeBlob(blob);
  notify();
  void import("./community-api").then(({ deleteCommunityCommentRemote }) =>
    deleteCommunityCommentRemote(commentId),
  );
  return true;
}

export function deleteCommunityMoment(momentId: string): boolean {
  if (!isAuthenticated()) return false;

  const user = getCurrentUser();
  const blob = readBlob();
  const target = blob.moments.find((m) => m.id === momentId);
  if (!target || target.userId !== user.id) return false;

  blob.moments = blob.moments.filter((m) => m.id !== momentId);
  delete blob.comments[momentId];
  delete blob.reactions[momentId];
  writeBlob(blob);
  notify();

  void import("./community-moment-actions").then(({ getPinnedCommunityMomentIds }) => {
    const pinned = getPinnedCommunityMomentIds().filter((id) => id !== momentId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ab:community-pinned-moments-v1", JSON.stringify(pinned));
      window.dispatchEvent(new Event("ab:community-pin-changed"));
    }
  });

  return true;
}

export function toggleCommunityReaction(momentId: string, kind: CommunityMoment["kind"]): boolean {
  if (!isAuthenticated()) return false;

  const blob = readBlob();
  if (!blob.moments.some((m) => m.id === momentId)) return false;

  const reactionKind = COMMUNITY_KIND_META[kind].reaction;
  const current = blob.reactions[momentId] ?? emptyReactions(kind);
  const row = current[reactionKind];
  const nextMine = !row.mine;
  const nextCount = Math.max(0, row.count + (nextMine ? 1 : -1));

  blob.reactions[momentId] = {
    ...current,
    [reactionKind]: { count: nextCount, mine: nextMine },
  };
  writeBlob(blob);
  notify();
  void toggleCommunityReactionRemote(momentId, reactionKind, nextMine);
  return nextMine;
}

export function useCommunityMoments(filter?: CommunityMoment["kind"] | "all") {
  useEffect(() => {
    bootstrapCommunityFeed();
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => listCommunityMoments(filter),
    () => [],
  );
}

export function useCommunityComments(momentId: string) {
  return useSyncExternalStore(
    subscribe,
    () => getCommunityComments(momentId),
    () => [],
  );
}

export function useCommunityReactions(momentId: string, kind: CommunityMoment["kind"]) {
  return useSyncExternalStore(
    subscribe,
    () => getCommunityReactions(momentId, kind),
    () => emptyReactions(kind),
  );
}

export function formatCommunityTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} د`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} س`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `منذ ${days} ي`;
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
}
