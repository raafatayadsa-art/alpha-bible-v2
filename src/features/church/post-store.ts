import { useEffect, useState, useSyncExternalStore } from "react";
import type { ChurchPost, PostType } from "@/data/church-posts";
import { ensurePostImageStored } from "./post-image-engine";
import { currentUserName } from "./current-user";
import { deleteChurchPost, patchChurchPost } from "./church-posts-api";
import {
  AUTH_CONTEXT_EVENT,
  alphaRoleToChurchRole,
  canManageChurchPosts,
  getAlphaRoleSync,
} from "@/features/auth";

const POSTS_KEY = "alpha:church:user-posts";
const OVERRIDES_KEY = "alpha:church:post-overrides"; // patches applied on top of any post (seed + user)
const ATT_KEY = "alpha:church:attendance";
const RES_KEY = "alpha:church:reservations";
const COND_KEY = "alpha:church:condolences";
const CONG_KEY = "alpha:church:congrats";
const PRAY_KEY = "alpha:church:post-prayers";
const PRAY_COUNT_KEY = "alpha:church:post-prayer-counts";
const SHARE_KEY = "alpha:church:post-shares";
const ROLE_KEY = "alpha:church:role"; // "priest" | "servant" | "admin" | "member"

export type Reply = { id: string; name: string; text: string; at: number };
type Reservations = Record<string, { count: number; mine: number }>;
type Attendance = Record<string, boolean>;
type RepliesMap = Record<string, Reply[]>;
export type PostOverride = Partial<
  Pick<ChurchPost, "pinned" | "pinnedUntil" | "expiresAt" | "archived" | "closed">
>;
type OverridesMap = Record<string, PostOverride>;

const EMPTY_USER_POSTS: ChurchPost[] = [];
const EMPTY_OVERRIDES: OverridesMap = {};
const listeners = new Set<() => void>();
function bumpVersion() {
  cache.clear();
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  migrateUserPostImagesOnce();
  const onStorage = () => {
    cache.clear();
    l();
  };
  const onAuth = () => {
    cache.clear();
    l();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_CONTEXT_EVENT, onAuth);
  }
  return () => {
    listeners.delete(l);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_CONTEXT_EVENT, onAuth);
    }
  };
}

const cache = new Map<string, unknown>();
function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  if (cache.has(key)) return cache.get(key) as T;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) {
      cache.set(key, fallback);
      return fallback;
    }
    const v = JSON.parse(raw) as T;
    cache.set(key, v);
    return v;
  } catch {
    cache.set(key, fallback);
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    cache.set(key, value);
    bumpVersion();
  } catch {}
}

/* ------------------------------- user posts ---------------------------------- */
let userPostImageMigrationDone = false;

/** One-time localStorage migration — must never run inside useSyncExternalStore getSnapshot. */
export function migrateUserPostImagesOnce() {
  if (userPostImageMigrationDone || typeof window === "undefined") return;
  userPostImageMigrationDone = true;

  const raw = read<ChurchPost[]>(POSTS_KEY, EMPTY_USER_POSTS);
  if (!raw.length) return;

  let changed = false;
  const next = raw.map((p) => {
    const fixed = ensurePostImageStored(p);
    if (fixed.image !== p.image) changed = true;
    return fixed;
  });
  if (changed) write(POSTS_KEY, next);
}

export function getUserPosts(): ChurchPost[] {
  return read<ChurchPost[]>(POSTS_KEY, EMPTY_USER_POSTS);
}
export function saveUserPost(post: ChurchPost) {
  const list = getUserPosts();
  const idx = list.findIndex((p) => p.id === post.id);
  if (idx >= 0) list[idx] = post;
  else list.unshift(post);
  write(POSTS_KEY, list);
}
export function deleteUserPost(id: string) {
  void deleteChurchPost(id);
  write(POSTS_KEY, getUserPosts().filter((p) => p.id !== id));
}

/* --------------------------------- overrides --------------------------------- */
export function getOverrides(): OverridesMap {
  return read<OverridesMap>(OVERRIDES_KEY, EMPTY_OVERRIDES);
}
export function patchPost(id: string, patch: PostOverride) {
  void patchChurchPost(id, patch);
  const user = getUserPosts();
  const idx = user.findIndex((p) => p.id === id);
  if (idx >= 0) {
    user[idx] = { ...user[idx], ...patch };
    write(POSTS_KEY, user);
    return;
  }
  const map = getOverrides();
  map[id] = { ...(map[id] || {}), ...patch };
  write(OVERRIDES_KEY, map);
}

/* ------------------------------- merged feed (legacy local — prefer Supabase) --------------------------------- */
const FEED_CACHE_KEY = "__feed__";

function applyOverride(p: ChurchPost, ov?: PostOverride): ChurchPost {
  return ov ? { ...p, ...ov } : p;
}

export function getAllPosts(): ChurchPost[] {
  if (typeof window === "undefined") return [];
  const user = getUserPosts();
  const ov = getOverrides();
  const cached = cache.get(FEED_CACHE_KEY) as
    | { user: ChurchPost[]; ov: OverridesMap; feed: ChurchPost[] }
    | undefined;
  if (cached && cached.user === user && cached.ov === ov) return cached.feed;
  const feed = user.map((p) => applyOverride(p, ov[p.id]));
  cache.set(FEED_CACHE_KEY, { user, ov, feed });
  return feed;
}

const USER_FEED_CACHE_KEY = "__user_feed__";

function getUserPostsSnapshot(): ChurchPost[] {
  if (typeof window === "undefined") return [];
  const user = getUserPosts();
  const ov = getOverrides();
  const cached = cache.get(USER_FEED_CACHE_KEY) as
    | { user: ChurchPost[]; ov: OverridesMap; feed: ChurchPost[] }
    | undefined;
  if (cached && cached.user === user && cached.ov === ov) return cached.feed;
  const feed = user.map((p) => applyOverride(p, ov[p.id]));
  cache.set(USER_FEED_CACHE_KEY, { user, ov, feed });
  return feed;
}

export function getPost(id: string): ChurchPost | undefined {
  return getAllPosts().find((p) => p.id === id);
}

export function usePost(id: string): ChurchPost | undefined {
  const all = useAllPosts();
  const key = (id ?? "").trim();
  if (!key) return undefined;
  return all.find((p) => p.id === key);
}

export function useAllPosts(): ChurchPost[] {
  return useSyncExternalStore(subscribe, getAllPosts, () => [] as ChurchPost[]);
}

/* ----------------- expiration / pinning derived helpers ---------------------- */
export function isPinned(p: ChurchPost, now: number = Date.now()): boolean {
  if (p.pinnedUntil && p.pinnedUntil > now) return true;
  if (p.pinned && !p.pinnedUntil) return true;
  return false;
}
export function isExpired(p: ChurchPost, now: number = Date.now()): boolean {
  if (p.archived) return true;
  // Prayer requests never auto-expire unless closed
  if (p.type === "prayer") return !!p.closed;
  if (p.expiresAt != null && p.expiresAt > 0 && p.expiresAt <= now) return true;
  return false;
}

export function useActivePosts(): ChurchPost[] {
  const all = useAllPosts();
  const now = Date.now();
  return all
    .filter((p) => !isExpired(p, now))
    .sort((a, b) => Number(isPinned(b, now)) - Number(isPinned(a, now)));
}

/** Dashboard feed — user-created posts only (no seed/mock posts). */
export function useActiveUserPosts(): ChurchPost[] {
  const userOnly = useSyncExternalStore(subscribe, getUserPostsSnapshot, () => [] as ChurchPost[]);
  const now = Date.now();
  return userOnly
    .filter((p) => !isExpired(p, now))
    .sort((a, b) => Number(isPinned(b, now)) - Number(isPinned(a, now)));
}
export function useArchivedPosts(): ChurchPost[] {
  const all = useAllPosts();
  const now = Date.now();
  return all.filter((p) => isExpired(p, now));
}

/* ---------------------------- pin / expire / archive ------------------------- */
export function pinForDays(id: string, days: number) {
  patchPost(id, { pinnedUntil: Date.now() + days * 24 * 3600 * 1000, pinned: true });
}
export function pinUntil(id: string, untilMs: number) {
  patchPost(id, { pinnedUntil: untilMs, pinned: true });
}
export function unpinPost(id: string) {
  patchPost(id, { pinnedUntil: 0, pinned: false });
}
export function setExpiration(id: string, expiresAt: number | null) {
  patchPost(id, { expiresAt });
}
export function archivePost(id: string) {
  patchPost(id, { archived: true });
}
export function restorePost(id: string) {
  patchPost(id, { archived: false, expiresAt: null });
}
export function closePrayer(id: string, closed = true) {
  patchPost(id, { closed });
}

/* ------------------------------ default expiry ------------------------------- */
/** Compute the default expiration timestamp for a new post based on type + details. */
export function computeDefaultExpiry(
  type: PostType,
  details?: { date?: string; time?: string; returnDate?: string }
): number | null {
  const sevenDays = 7 * 24 * 3600 * 1000;
  const parse = (d?: string, t?: string) => {
    if (!d) return null;
    const time = t && /^\d{2}:\d{2}/.test(t) ? t : "23:59";
    const ms = Date.parse(`${d}T${time}:00`);
    return Number.isFinite(ms) ? ms : null;
  };
  switch (type) {
    case "liturgy":
    case "meeting": {
      const t = parse(details?.date, details?.time);
      // Expire 3h after start so the post stays during the event.
      return t ? t + 3 * 3600 * 1000 : null;
    }
    case "trip": {
      const ret = parse(details?.returnDate || details?.date, "23:59");
      return ret ? ret + 6 * 3600 * 1000 : null;
    }
    case "wedding":
    case "condolence":
      return Date.now() + sevenDays;
    case "prayer":
      return null; // never auto-expires
    case "announcement":
    case "news":
    case "report":
    case "event":
    default:
      return null; // optional
  }
}

/* ------------------------------- attendance ---------------------------------- */
export function toggleAttendance(postId: string): boolean {
  const map = read<Attendance>(ATT_KEY, {});
  const next = !map[postId];
  if (next) map[postId] = true;
  else delete map[postId];
  write(ATT_KEY, map);
  return next;
}
const EMPTY_ATT: Attendance = Object.freeze({}) as Attendance;
const EMPTY_RES: Reservations = Object.freeze({}) as Reservations;
const EMPTY_REPLIES: RepliesMap = Object.freeze({}) as RepliesMap;
const EMPTY_REPLY_LIST: Reply[] = Object.freeze([]) as unknown as Reply[];

export function useAttendance(postId: string) {
  const map = useSyncExternalStore(
    subscribe,
    () => read<Attendance>(ATT_KEY, EMPTY_ATT),
    () => EMPTY_ATT,
  );
  const going = !!map[postId];
  return { going, count: 12 + (going ? 1 : 0) };
}

/* ------------------------------ reservations --------------------------------- */
export function reserveSeats(postId: string, seats: number, totalSeats?: number): boolean {
  const map = read<Reservations>(RES_KEY, {});
  const cur = map[postId] || { count: 0, mine: 0 };
  if (totalSeats != null && cur.count + seats > totalSeats) return false;
  map[postId] = { count: cur.count + seats, mine: cur.mine + seats };
  write(RES_KEY, map);
  return true;
}
export function useReservations(postId: string, totalSeats?: number) {
  const map = useSyncExternalStore(
    subscribe,
    () => read<Reservations>(RES_KEY, EMPTY_RES),
    () => EMPTY_RES,
  );
  const cur = map[postId] || { count: 0, mine: 0 };
  return {
    reserved: cur.count,
    mine: cur.mine,
    remaining: totalSeats != null ? Math.max(0, totalSeats - cur.count) : undefined,
  };
}

/* ------------------------ condolences & congratulations ---------------------- */
function addReply(key: string, postId: string, reply: Reply) {
  const map = read<RepliesMap>(key, {});
  map[postId] = [reply, ...(map[postId] || [])];
  write(key, map);
}
export function addCondolence(postId: string, name: string, text: string) {
  addReply(COND_KEY, postId, { id: String(Date.now()), name, text, at: Date.now() });
}
export function addCongrats(postId: string, name: string, text: string) {
  addReply(CONG_KEY, postId, { id: String(Date.now()), name, text, at: Date.now() });
}
export function useReplies(kind: "condolence" | "congrats", postId: string): Reply[] {
  const key = kind === "condolence" ? COND_KEY : CONG_KEY;
  const map = useSyncExternalStore(
    subscribe,
    () => read<RepliesMap>(key, EMPTY_REPLIES),
    () => EMPTY_REPLIES,
  );
  return map[postId] ?? EMPTY_REPLY_LIST;
}

/* ------------------------------ comments & reactions (Supabase) ------------------------- */
export type { PostComment, ReactionKind } from "./post-interactions";
export {
  addComment,
  addCommentAsCurrentUser,
  useComments,
  toggleReaction,
  useReactions,
  prefetchPostInteractions,
} from "./post-interactions";

const EMPTY_PRAY: Record<string, boolean> = Object.freeze({});

export function togglePrayed(postId: string): boolean {
  const map = read<Record<string, boolean>>(PRAY_KEY, {});
  const counts = read<Record<string, number>>(PRAY_COUNT_KEY, {});
  const next = !map[postId];
  const cur = counts[postId] ?? 0;
  if (next) {
    map[postId] = true;
    counts[postId] = cur + 1;
  } else {
    delete map[postId];
    counts[postId] = Math.max(0, cur - 1);
  }
  write(PRAY_KEY, map);
  write(PRAY_COUNT_KEY, counts);
  return next;
}

const EMPTY_PRAY_COUNTS: Record<string, number> = Object.freeze({});

export function usePrayed(postId: string) {
  const map = useSyncExternalStore(
    subscribe,
    () => read<Record<string, boolean>>(PRAY_KEY, EMPTY_PRAY),
    () => EMPTY_PRAY,
  );
  const counts = useSyncExternalStore(
    subscribe,
    () => read<Record<string, number>>(PRAY_COUNT_KEY, EMPTY_PRAY_COUNTS),
    () => EMPTY_PRAY_COUNTS,
  );
  const mine = !!map[postId];
  return { mine, count: counts[postId] ?? 0 };
}

const EMPTY_SHARE: Record<string, number> = Object.freeze({});

export function recordShare(postId: string) {
  const map = read<Record<string, number>>(SHARE_KEY, {});
  map[postId] = (map[postId] ?? 0) + 1;
  write(SHARE_KEY, map);
}

export function useShareCount(postId: string) {
  const map = useSyncExternalStore(
    subscribe,
    () => read<Record<string, number>>(SHARE_KEY, EMPTY_SHARE),
    () => EMPTY_SHARE,
  );
  return map[postId] ?? 0;
}

/* --------------------------------- roles ------------------------------------- */
export type ChurchRole = "priest" | "leader" | "servant" | "admin" | "member";
export function getRole(): ChurchRole {
  return alphaRoleToChurchRole(getAlphaRoleSync());
}
export function setRole(role: ChurchRole) {
  write(ROLE_KEY, role);
}
export function canManagePosts(): boolean {
  return canManageChurchPosts(getAlphaRoleSync());
}
export function useChurchRole(): ChurchRole {
  return useSyncExternalStore(
    subscribe,
    () => alphaRoleToChurchRole(getAlphaRoleSync()),
    () => "member" as ChurchRole,
  );
}
export function isChurchAdmin(role?: ChurchRole): boolean {
  const r = role ?? getRole();
  return r === "priest" || r === "admin";
}
export function useIsChurchAdmin(): boolean {
  const r = useChurchRole();
  return r === "priest" || r === "admin";
}
export function useCanManagePosts(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => canManageChurchPosts(getAlphaRoleSync()),
    () => false,
  );
}

/* --------------------------------- helpers ----------------------------------- */
export function newPostId(): string {
  return "u-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

export function isUserOwnedPost(id: string): boolean {
  return getUserPosts().some((p) => p.id === id);
}

export function useHydrated(): boolean {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
