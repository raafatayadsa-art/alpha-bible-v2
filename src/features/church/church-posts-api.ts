import type { ChurchPost, ChurchPostDetails, PostType } from "@/data/church-posts";
import { supabase } from "@/integrations/supabase/client";
import { assignPostImage } from "./post-image-engine";
import type { PostOverride } from "./post-store";

export const CHURCH_POSTS_CHANGED = "ab:church-posts";

export function notifyChurchPostsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHURCH_POSTS_CHANGED));
  }
}

export type ChurchPostRow = {
  id: string;
  church_id: string | number;
  type: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  image_url: string | null;
  author: string | null;
  created_by: string | null;
  pinned_until: string | null;
  expires_at: string | null;
  archived: boolean | null;
  closed: boolean | null;
  details: ChurchPostDetails | null;
  created_at: string;
};

export function mapRowToChurchPost(row: ChurchPostRow): ChurchPost {
  const type = (row.type as PostType) || "announcement";
  const id = String(row.id);
  return {
    id,
    type,
    title: row.title ?? "",
    excerpt: row.excerpt ?? row.body ?? "",
    body: row.body ?? row.excerpt ?? "",
    image: row.image_url ?? assignPostImage({ id, type, details: row.details ?? undefined }),
    date: row.created_at ? new Date(row.created_at).toLocaleDateString("ar-EG") : "",
    author: row.author ?? "",
    pinnedUntil: row.pinned_until ? new Date(row.pinned_until).getTime() : undefined,
    expiresAt: row.expires_at ? new Date(row.expires_at).getTime() : null,
    archived: !!row.archived,
    closed: !!row.closed,
    details: row.details ?? undefined,
  };
}

const POST_COLUMNS =
  "id, church_id, type, title, excerpt, body, image_url, created_at, author, created_by, pinned_until, expires_at, archived, closed, details";

export async function fetchChurchPosts(
  churchId: string,
  opts?: { archived?: boolean; limit?: number },
): Promise<ChurchPost[]> {
  let query = supabase
    .from("church_posts")
    .select(POST_COLUMNS)
    .eq("church_id", churchId)
    .order("created_at", { ascending: false });

  if (opts?.archived === true) {
    query = query.eq("archived", true);
  } else if (opts?.archived === false) {
    query = query.eq("archived", false);
  }

  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) {
    console.error("fetchChurchPosts", error);
    return [];
  }
  return (data ?? []).map((row) => mapRowToChurchPost(row as ChurchPostRow));
}

export async function fetchChurchPostById(id: string): Promise<ChurchPost | null> {
  const { data, error } = await supabase.from("church_posts").select(POST_COLUMNS).eq("id", id).maybeSingle();
  if (error || !data) {
    if (error) console.error("fetchChurchPostById", error);
    return null;
  }
  return mapRowToChurchPost(data as ChurchPostRow);
}

export type CreateChurchPostResult = { ok: true; post: ChurchPost } | { ok: false; error: string };

export async function createChurchPost(
  churchId: string,
  post: ChurchPost,
  createdBy?: string | null,
): Promise<CreateChurchPostResult> {
  const expiresAt =
    post.expiresAt != null && post.expiresAt > 0 ? new Date(post.expiresAt).toISOString() : null;

  const { data, error } = await supabase
    .from("church_posts")
    .insert({
      church_id: churchId,
      type: post.type,
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      image_url: post.image || null,
      author: post.author,
      created_by: createdBy ?? null,
      expires_at: expiresAt,
      details: post.details ?? {},
    })
    .select(POST_COLUMNS)
    .single();

  if (error || !data) {
    console.error("createChurchPost", error);
    return { ok: false, error: error?.message ?? "تعذّر حفظ المنشور" };
  }

  const saved = mapRowToChurchPost(data as ChurchPostRow);
  notifyChurchPostsChanged();
  return { ok: true, post: saved };
}

export async function patchChurchPost(id: string, patch: PostOverride): Promise<boolean> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if ("pinnedUntil" in patch) {
    payload.pinned_until =
      patch.pinnedUntil && patch.pinnedUntil > 0 ? new Date(patch.pinnedUntil).toISOString() : null;
  }
  if ("pinned" in patch && patch.pinned === false) {
    payload.pinned_until = null;
  }
  if ("expiresAt" in patch) {
    payload.expires_at =
      patch.expiresAt != null && patch.expiresAt > 0 ? new Date(patch.expiresAt).toISOString() : null;
  }
  if ("archived" in patch) payload.archived = patch.archived;
  if ("closed" in patch) payload.closed = patch.closed;

  const { error } = await supabase.from("church_posts").update(payload).eq("id", id);
  if (error) {
    console.error("patchChurchPost", error);
    return false;
  }
  notifyChurchPostsChanged();
  return true;
}

export async function deleteChurchPost(id: string): Promise<boolean> {
  const { error } = await supabase.from("church_posts").delete().eq("id", id);
  if (error) {
    console.error("deleteChurchPost", error);
    return false;
  }
  notifyChurchPostsChanged();
  return true;
}
