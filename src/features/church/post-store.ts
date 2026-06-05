import { useEffect, useState, useSyncExternalStore } from "react";
import { CHURCH_POSTS, type ChurchPost } from "@/data/church-posts";

const POSTS_KEY = "alpha:church:user-posts";
const ATT_KEY = "alpha:church:attendance"; // { [postId]: boolean }
const RES_KEY = "alpha:church:reservations"; // { [postId]: { count: number, mine: number } }
const COND_KEY = "alpha:church:condolences"; // { [postId]: Reply[] }
const CONG_KEY = "alpha:church:congrats"; // { [postId]: Reply[] }

export type Reply = { id: string; name: string; text: string; at: number };
type Reservations = Record<string, { count: number; mine: number }>;
type Attendance = Record<string, boolean>;
type RepliesMap = Record<string, Reply[]>;

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

/** Cache parsed snapshots so useSyncExternalStore gets stable references. */
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
  } catch {
    /* quota / disabled storage */
  }
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

/** Merged feed (cached by user-posts reference): user posts first, then seed. */
const FEED_CACHE_KEY = "__feed__";
const SERVER_FEED: ChurchPost[] = [...CHURCH_POSTS];
export function getAllPosts(): ChurchPost[] {
  if (typeof window === "undefined") return SERVER_FEED;
  const user = getUserPosts();
  const cached = cache.get(FEED_CACHE_KEY) as { user: ChurchPost[]; feed: ChurchPost[] } | undefined;
  if (cached && cached.user === user) return cached.feed;
  const seedIds = new Set(user.map((p) => p.id));
  const feed = [...user, ...CHURCH_POSTS.filter((p) => !seedIds.has(p.id))];
  cache.set(FEED_CACHE_KEY, { user, feed });
  return feed;
}
export function getPost(id: string): ChurchPost | undefined {
  return getAllPosts().find((p) => p.id === id);
}

export function useAllPosts(): ChurchPost[] {
  return useSyncExternalStore(subscribe, getAllPosts, () => SERVER_FEED);
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
export function useAttendance(postId: string) {
  const map = useSyncExternalStore(
    subscribe,
    () => read<Attendance>(ATT_KEY, {}),
    () => ({}) as Attendance,
  );
  const count = Object.keys(map).filter((k) => k === postId || k.startsWith(postId + ":")).length;
  // Demo baseline count so cards never look empty.
  return { going: !!map[postId], count: count + 12 };
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
    () => read<Reservations>(RES_KEY, {}),
    () => ({}) as Reservations,
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
    () => read<RepliesMap>(key, {}),
    () => ({}) as RepliesMap,
  );
  return map[postId] || [];
}

/* --------------------------------- helpers ----------------------------------- */
export function newPostId(): string {
  return "u-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

/** Hydration guard for components that read localStorage before mount. */
export function useHydrated(): boolean {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
