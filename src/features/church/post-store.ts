import { useEffect, useState, useSyncExternalStore } from "react";
import { CHURCH_POSTS, type ChurchPost, type PostType } from "@/data/church-posts";

const POSTS_KEY = "alpha:church:user-posts";
const OVERRIDES_KEY = "alpha:church:post-overrides"; // patches applied on top of any post (seed + user)
const ATT_KEY = "alpha:church:attendance";
const RES_KEY = "alpha:church:reservations";
const COND_KEY = "alpha:church:condolences";
const CONG_KEY = "alpha:church:congrats";
const ROLE_KEY = "alpha:church:role"; // "priest" | "servant" | "admin" | "member"

export type Reply = { id: string; name: string; text: string; at: number };
type Reservations = Record<string, { count: number; mine: number }>;
type Attendance = Record<string, boolean>;
type RepliesMap = Record<string, Reply[]>;
export type PostOverride = Partial<
  Pick<ChurchPost, "pinned" | "pinnedUntil" | "expiresAt" | "archived" | "closed">
>;
type OverridesMap = Record<string, PostOverride>;

/* ------------------------ tiny pub/sub on localStorage ------------------------ */
const listeners = new Set<() => void>();
function bumpVersion() {
  cache.clear();
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = () => {
    cache.clear();
    l();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

const cache = new Map<string, unknown>();
function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  if (cache.has(key)) return cache.get(key) as T;
  try {
    const raw = window.localStorage.getItem(key);
    const v = raw ? (JSON.parse(raw) as T) : fallback;
    cache.set(key, v);
    return v;
  } catch {
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
export function getUserPosts(): ChurchPost[] {
  return read<ChurchPost[]>(POSTS_KEY, []);
}
export function saveUserPost(post: ChurchPost) {
  const list = getUserPosts();
  const idx = list.findIndex((p) => p.id === post.id);
  if (idx >= 0) list[idx] = post;
  else list.unshift(post);
  write(POSTS_KEY, list);
}
export function deleteUserPost(id: string) {
  write(POSTS_KEY, getUserPosts().filter((p) => p.id !== id));
}

/* --------------------------------- overrides --------------------------------- */
export function getOverrides(): OverridesMap {
  return read<OverridesMap>(OVERRIDES_KEY, {});
}
export function patchPost(id: string, patch: PostOverride) {
  // For user-owned posts, persist on the post itself (so it survives clearing overrides).
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

/* ------------------------------- merged feed --------------------------------- */
const FEED_CACHE_KEY = "__feed__";
const SERVER_FEED: ChurchPost[] = [...CHURCH_POSTS];

function applyOverride(p: ChurchPost, ov?: PostOverride): ChurchPost {
  return ov ? { ...p, ...ov } : p;
}

export function getAllPosts(): ChurchPost[] {
  if (typeof window === "undefined") return SERVER_FEED;
  const user = getUserPosts();
  const ov = getOverrides();
  const cached = cache.get(FEED_CACHE_KEY) as
    | { user: ChurchPost[]; ov: OverridesMap; feed: ChurchPost[] }
    | undefined;
  if (cached && cached.user === user && cached.ov === ov) return cached.feed;
  const seedIds = new Set(user.map((p) => p.id));
  const feed = [
    ...user.map((p) => applyOverride(p, ov[p.id])),
    ...CHURCH_POSTS.filter((p) => !seedIds.has(p.id)).map((p) => applyOverride(p, ov[p.id])),
  ];
  cache.set(FEED_CACHE_KEY, { user, ov, feed });
  return feed;
}
export function getPost(id: string): ChurchPost | undefined {
  return getAllPosts().find((p) => p.id === id);
}

export function useAllPosts(): ChurchPost[] {
  return useSyncExternalStore(subscribe, getAllPosts, () => SERVER_FEED);
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

/* --------------------------------- roles ------------------------------------- */
export type ChurchRole = "priest" | "leader" | "servant" | "admin" | "member";
export function getRole(): ChurchRole {
  return read<ChurchRole>(ROLE_KEY, "priest"); // demo default: manager
}
export function setRole(role: ChurchRole) {
  write(ROLE_KEY, role);
}
export function canManagePosts(): boolean {
  const r = getRole();
  return r === "priest" || r === "servant" || r === "admin" || r === "leader";
}
export function useChurchRole(): ChurchRole {
  return useSyncExternalStore(
    subscribe,
    () => read<ChurchRole>(ROLE_KEY, "priest"),
    () => "priest" as ChurchRole,
  );
}
export function useCanManagePosts(): boolean {
  const r = useChurchRole();
  return r === "priest" || r === "servant" || r === "admin" || r === "leader";
}

/* --------------------------------- helpers ----------------------------------- */
export function newPostId(): string {
  return "u-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

export function useHydrated(): boolean {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
