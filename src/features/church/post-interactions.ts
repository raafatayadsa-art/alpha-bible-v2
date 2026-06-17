import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { currentUserName, getCurrentUser } from "./current-user";

export type PostComment = { id: string; name: string; text: string; at: number };
export type ReactionKind = "amen" | "love" | "pray";

export const POST_INTERACTIONS_CHANGED = "ab:church-post-interactions";

const ANON_ID_KEY = "alpha:interaction-anon-id";
const LOCAL_COMMENTS_KEY = "alpha:church:post-comments-local";
const LOCAL_REACTIONS_KEY = "alpha:church:post-reactions-local";
const EMPTY_COMMENTS: Record<string, PostComment[]> = Object.freeze({});
const EMPTY_REACTS: Record<string, Record<ReactionKind, { count: number; mine: boolean }>> = Object.freeze({});

const listeners = new Set<() => void>();
let commentsByPost: Record<string, PostComment[]> = {};
let reactionsByPost: Record<string, Record<ReactionKind, { count: number; mine: boolean }>> = {};
let remoteAvailable: boolean | null = null;
const syncedPosts = new Set<string>();

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(POST_INTERACTIONS_CHANGED));
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  if (typeof window !== "undefined") {
    window.addEventListener(POST_INTERACTIONS_CHANGED, l);
  }
  return () => {
    listeners.delete(l);
    if (typeof window !== "undefined") window.removeEventListener(POST_INTERACTIONS_CHANGED, l);
  };
}

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function isMissingTableError(error: { code?: string; message?: string; status?: number } | null) {
  if (!error) return false;
  const code = error.code ?? "";
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.status === 404 ||
    code === "42P01" ||
    code === "PGRST205" ||
    code === "PGRST204" ||
    msg.includes("could not find the table") ||
    msg.includes("schema cache") ||
    (msg.includes("does not exist") &&
      (msg.includes("church_post_comments") || msg.includes("church_post_reactions")))
  );
}

function interactionUserId(): string {
  const user = getCurrentUser();
  if (user.id) return user.id;
  if (typeof window === "undefined") return "anon-guest";
  try {
    let id = window.localStorage.getItem(ANON_ID_KEY);
    if (!id) {
      id = `anon-${crypto.randomUUID()}`;
      window.localStorage.setItem(ANON_ID_KEY, id);
    }
    return id;
  } catch {
    return "anon-guest";
  }
}

function commentFromRow(row: Record<string, unknown>): PostComment {
  return {
    id: String(row.id),
    name: String(row.user_name ?? ""),
    text: String(row.body ?? row.text ?? ""),
    at: row.created_at ? new Date(String(row.created_at)).getTime() : Date.now(),
  };
}

function emptyReactions(): Record<ReactionKind, { count: number; mine: boolean }> {
  return {
    love: { count: 0, mine: false },
    amen: { count: 0, mine: false },
    pray: { count: 0, mine: false },
  };
}

function setComments(postId: string, list: PostComment[]) {
  commentsByPost = { ...commentsByPost, [postId]: list };
  notify();
}

function setReactions(postId: string, reactions: Record<ReactionKind, { count: number; mine: boolean }>) {
  reactionsByPost = { ...reactionsByPost, [postId]: reactions };
  notify();
}

function persistLocalComments(postId: string, list: PostComment[]) {
  const map = readLocal<Record<string, PostComment[]>>(LOCAL_COMMENTS_KEY, {});
  map[postId] = list;
  writeLocal(LOCAL_COMMENTS_KEY, map);
}

function persistLocalReactions(
  postId: string,
  reactions: Record<ReactionKind, { count: number; mine: boolean }>,
) {
  const map = readLocal<Record<string, Record<ReactionKind, { count: number; mine: boolean }>>>(
    LOCAL_REACTIONS_KEY,
    {},
  );
  map[postId] = reactions;
  writeLocal(LOCAL_REACTIONS_KEY, map);
}

function hydrateFromLocal(postId: string) {
  const localComments = readLocal<Record<string, PostComment[]>>(LOCAL_COMMENTS_KEY, {});
  const localReactions = readLocal<Record<string, Record<ReactionKind, { count: number; mine: boolean }>>>(
    LOCAL_REACTIONS_KEY,
    {},
  );
  if (localComments[postId]?.length) {
    setComments(postId, localComments[postId]);
  }
  if (localReactions[postId]) {
    setReactions(postId, localReactions[postId]);
  }
}

export async function syncPostInteractions(postId: string): Promise<void> {
  if (!postId) return;

  hydrateFromLocal(postId);
  if (remoteAvailable === false) return;

  const uid = interactionUserId();

  const [commentsRes, reactionsRes] = await Promise.all([
    supabase
      .from("church_post_comments")
      .select("id, user_name, body, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: false }),
    supabase
      .from("church_post_reactions")
      .select("id, user_id, kind")
      .eq("post_id", postId),
  ]);

  if (isMissingTableError(commentsRes.error) || isMissingTableError(reactionsRes.error)) {
    remoteAvailable = false;
    hydrateFromLocal(postId);
    return;
  }

  remoteAvailable = true;
  syncedPosts.add(postId);

  if (!commentsRes.error) {
    const remote = (commentsRes.data ?? []).map((r) => commentFromRow(r as Record<string, unknown>));
    const local = readLocal<Record<string, PostComment[]>>(LOCAL_COMMENTS_KEY, {})[postId] ?? [];
    const merged = [...remote];
    for (const c of local) {
      if (!merged.some((x) => x.id === c.id)) merged.unshift(c);
    }
    setComments(postId, merged);
    persistLocalComments(postId, merged);
  }

  if (!reactionsRes.error) {
    const base = emptyReactions();
    for (const row of reactionsRes.data ?? []) {
      const kind = String((row as { kind?: string }).kind ?? "love") as ReactionKind;
      if (kind !== "love" && kind !== "amen" && kind !== "pray") continue;
      base[kind].count += 1;
      if (String((row as { user_id?: string }).user_id) === uid) base[kind].mine = true;
    }
    const local = readLocal<Record<string, Record<ReactionKind, { count: number; mine: boolean }>>>(
      LOCAL_REACTIONS_KEY,
      {},
    )[postId];
    if (local) {
      for (const kind of ["love", "amen", "pray"] as ReactionKind[]) {
        if (local[kind].mine && !base[kind].mine) {
          base[kind].mine = true;
          base[kind].count += 1;
        }
      }
    }
    setReactions(postId, base);
    persistLocalReactions(postId, base);
  }
}

export async function prefetchPostInteractions(postIds: string[]): Promise<void> {
  const pending = postIds.filter((id) => id && !syncedPosts.has(id));
  await Promise.all(pending.map((id) => syncPostInteractions(id)));
}

export function addComment(postId: string, name: string, text: string) {
  const t = text.trim();
  if (!t || !postId) return;
  void addCommentRemote(postId, name, t);
}

export function addCommentAsCurrentUser(postId: string, text: string) {
  addComment(postId, currentUserName(), text);
}

async function addCommentRemote(postId: string, name: string, text: string) {
  const uid = interactionUserId();
  const optimistic: PostComment = {
    id: `local-${Date.now()}`,
    name,
    text,
    at: Date.now(),
  };
  const prev = commentsByPost[postId] ?? [];
  const next = [optimistic, ...prev];
  setComments(postId, next);
  persistLocalComments(postId, next);

  if (remoteAvailable === false) return;

  const { data, error } = await supabase
    .from("church_post_comments")
    .insert({
      post_id: postId,
      user_id: uid,
      user_name: name,
      body: text,
    })
    .select("id, user_name, body, created_at")
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      remoteAvailable = false;
      return;
    }
    console.error("addComment", error);
    return;
  }

  const saved = commentFromRow(data as Record<string, unknown>);
  const merged = [saved, ...prev.filter((c) => c.id !== optimistic.id)];
  setComments(postId, merged);
  persistLocalComments(postId, merged);
}

export function toggleReaction(postId: string, kind: ReactionKind): boolean {
  void toggleReactionRemote(postId, kind);
  const cur = reactionsByPost[postId]?.[kind] ?? { count: 0, mine: false };
  return !cur.mine;
}

async function toggleReactionRemote(postId: string, kind: ReactionKind) {
  const uid = interactionUserId();
  const prev = reactionsByPost[postId] ?? emptyReactions();
  const cur = prev[kind] ?? { count: 0, mine: false };
  const next = {
    ...prev,
    [kind]: {
      count: Math.max(0, cur.count + (cur.mine ? -1 : 1)),
      mine: !cur.mine,
    },
  };
  setReactions(postId, next);
  persistLocalReactions(postId, next);

  if (remoteAvailable === false) return;

  if (cur.mine) {
    const { error } = await supabase
      .from("church_post_reactions")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", uid)
      .eq("kind", kind);
    if (error) {
      if (isMissingTableError(error)) {
        remoteAvailable = false;
        return;
      }
      console.error("toggleReaction delete", error);
      setReactions(postId, prev);
      persistLocalReactions(postId, prev);
    }
    return;
  }

  const { error } = await supabase.from("church_post_reactions").insert({
    post_id: postId,
    user_id: uid,
    kind,
  });
  if (error) {
    if (isMissingTableError(error)) {
      remoteAvailable = false;
      return;
    }
    console.error("toggleReaction insert", error);
    setReactions(postId, prev);
    persistLocalReactions(postId, prev);
  }
}

export function useComments(postId: string): PostComment[] {
  useEffect(() => {
    if (postId) void syncPostInteractions(postId);
  }, [postId]);

  const map = useSyncExternalStore(
    subscribe,
    () => commentsByPost,
    () => EMPTY_COMMENTS,
  );
  return map[postId] ?? [];
}

export function useReactions(postId: string) {
  useEffect(() => {
    if (postId) void syncPostInteractions(postId);
  }, [postId]);

  const map = useSyncExternalStore(
    subscribe,
    () => reactionsByPost,
    () => EMPTY_REACTS,
  );
  const r = map[postId] || {};
  return {
    amen: r.amen ?? { count: 0, mine: false },
    love: r.love ?? { count: 0, mine: false },
    pray: r.pray ?? { count: 0, mine: false },
  };
}
