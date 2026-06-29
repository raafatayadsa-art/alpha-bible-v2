import { supabase } from "@/integrations/supabase/client";
import { currentUserName, getCurrentUser } from "@/features/church/current-user";
import type {
  CommunityComment,
  CommunityMoment,
  CommunityMomentKind,
  CommunityReactionKind,
  ShareToCommunityInput,
} from "./community-types";

export const COMMUNITY_REMOTE_CHANGED = "ab:community-remote-changed";

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
    msg.includes("community_moments")
  );
}

function momentFromRow(row: Record<string, unknown>): CommunityMoment {
  return {
    id: String(row.id),
    kind: String(row.kind) as CommunityMomentKind,
    userId: String(row.user_id),
    userName: String(row.user_name ?? ""),
    userAvatarUrl: row.user_avatar_url ? String(row.user_avatar_url) : undefined,
    churchId: row.church_id ? String(row.church_id) : undefined,
    churchName: row.church_name ? String(row.church_name) : undefined,
    payload: (row.payload as CommunityMoment["payload"]) ?? {},
    createdAt: String(row.created_at ?? new Date().toISOString()),
    churchPostId: row.church_post_id ? String(row.church_post_id) : undefined,
    source: row.source
      ? (String(row.source) as CommunityMoment["source"])
      : undefined,
  };
}

function commentFromRow(row: Record<string, unknown>): CommunityComment {
  return {
    id: String(row.id),
    momentId: String(row.moment_id),
    userId: String(row.user_id),
    userName: String(row.user_name ?? ""),
    userAvatarUrl: row.user_avatar_url ? String(row.user_avatar_url) : undefined,
    text: String(row.body ?? ""),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export type RemoteCommunitySnapshot = {
  moments: CommunityMoment[];
  comments: Record<string, CommunityComment[]>;
  reactions: Record<string, Record<CommunityReactionKind, { count: number; mine: boolean }>>;
};

let remoteAvailable: boolean | null = null;

const EMPTY_REACTIONS_BY_KIND: Record<
  CommunityMomentKind,
  Record<CommunityReactionKind, { count: number; mine: boolean }>
> = {
  reading: { amen: { count: 0, mine: false }, prayed_for: { count: 0, mine: false } },
  agpeya: { amen: { count: 0, mine: false }, prayed_for: { count: 0, mine: false } },
  prayer: { amen: { count: 0, mine: false }, prayed_for: { count: 0, mine: false } },
};

function emptyReactions(kind: CommunityMomentKind) {
  return EMPTY_REACTIONS_BY_KIND[kind] ?? EMPTY_REACTIONS_BY_KIND.reading;
}

function isValidMomentKind(kind: unknown): kind is CommunityMomentKind {
  return kind === "reading" || kind === "prayer" || kind === "agpeya";
}

export async function fetchCommunityRemote(
  churchId?: string | null,
  friendUserIds?: string[] | null,
): Promise<RemoteCommunitySnapshot | null> {
  if (remoteAvailable === false) return null;

  const selfId = getCurrentUser().id;
  const filterIds = friendUserIds?.length
    ? [...new Set([...friendUserIds.filter(Boolean), ...(selfId ? [selfId] : [])])]
    : null;

  let query = supabase
    .from("community_moments")
    .select("id, kind, user_id, user_name, user_avatar_url, church_id, church_name, payload, church_post_id, created_at, source")
    .order("created_at", { ascending: false })
    .limit(100);

  if (filterIds?.length) {
    query = query.in("user_id", filterIds);
  } else if (churchId) {
    query = query.or(`church_id.eq.${churchId},church_id.is.null`);
  }

  const { data: momentRows, error: momentsError } = await query;

  if (momentsError) {
    if (isMissingTableError(momentsError)) remoteAvailable = false;
    return null;
  }

  remoteAvailable = true;
  const moments = (momentRows ?? [])
    .map((r) => momentFromRow(r as Record<string, unknown>))
    .filter((m) => isValidMomentKind(m.kind));
  const momentIds = moments.map((m) => m.id);
  if (!momentIds.length) {
    return { moments: [], comments: {}, reactions: {} };
  }

  const uid = getCurrentUser().id;

  const [commentsRes, reactionsRes] = await Promise.all([
    supabase
      .from("community_moment_comments")
      .select("id, moment_id, user_id, user_name, body, created_at")
      .in("moment_id", momentIds)
      .order("created_at", { ascending: true }),
    supabase
      .from("community_moment_reactions")
      .select("id, moment_id, user_id, kind")
      .in("moment_id", momentIds),
  ]);

  const comments: Record<string, CommunityComment[]> = {};
  if (!commentsRes.error) {
    for (const row of commentsRes.data ?? []) {
      const c = commentFromRow(row as Record<string, unknown>);
      comments[c.momentId] = [...(comments[c.momentId] ?? []), c];
    }
  }

  const reactions: RemoteCommunitySnapshot["reactions"] = {};
  for (const m of moments) {
    reactions[m.id] = emptyReactions(m.kind);
  }
  if (!reactionsRes.error) {
    for (const row of reactionsRes.data ?? []) {
      const momentId = String((row as { moment_id?: string }).moment_id);
      const kind = String((row as { kind?: string }).kind) as CommunityReactionKind;
      const base = reactions[momentId];
      if (!base || (kind !== "amen" && kind !== "prayed_for")) continue;
      base[kind].count += 1;
      if (String((row as { user_id?: string }).user_id) === uid) base[kind].mine = true;
    }
  }

  return { moments, comments, reactions };
}

export async function insertCommunityMomentRemote(moment: CommunityMoment): Promise<void> {
  if (remoteAvailable === false) return;

  const { error } = await supabase.from("community_moments").insert({
    id: moment.id,
    kind: moment.kind,
    user_id: moment.userId,
    user_name: moment.userName,
    user_avatar_url: moment.userAvatarUrl ?? null,
    church_id: moment.churchId && /^\d+$/.test(moment.churchId) ? Number(moment.churchId) : null,
    church_name: moment.churchName ?? null,
    payload: moment.payload,
    church_post_id: moment.churchPostId ?? null,
    created_at: moment.createdAt,
    source: moment.source ?? (moment.payload.reading?.auto ? "auto_chapter" : "manual"),
  });

  if (isMissingTableError(error)) {
    remoteAvailable = false;
  }
}

export async function insertCommunityCommentRemote(comment: CommunityComment): Promise<void> {
  if (remoteAvailable === false) return;

  const { error } = await supabase.from("community_moment_comments").insert({
    id: comment.id,
    moment_id: comment.momentId,
    user_id: comment.userId,
    user_name: comment.userName,
    body: comment.text,
    created_at: comment.createdAt,
  });

  if (isMissingTableError(error)) remoteAvailable = false;
}

export async function updateCommunityCommentRemote(comment: CommunityComment): Promise<void> {
  if (remoteAvailable === false) return;

  const { error } = await supabase
    .from("community_moment_comments")
    .update({
      body: comment.text,
      updated_at: comment.updatedAt ?? new Date().toISOString(),
    })
    .eq("id", comment.id)
    .eq("user_id", getCurrentUser().id);

  if (isMissingTableError(error)) remoteAvailable = false;
}

export async function deleteCommunityCommentRemote(commentId: string): Promise<void> {
  if (remoteAvailable === false) return;

  const { error } = await supabase
    .from("community_moment_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", getCurrentUser().id);

  if (isMissingTableError(error)) remoteAvailable = false;
}

export async function toggleCommunityReactionRemote(
  momentId: string,
  reactionKind: CommunityReactionKind,
  active: boolean,
): Promise<void> {
  if (remoteAvailable === false) return;

  const uid = getCurrentUser().id;
  if (!uid) return;

  if (active) {
    const { error } = await supabase.from("community_moment_reactions").insert({
      moment_id: momentId,
      user_id: uid,
      kind: reactionKind,
    });
    if (isMissingTableError(error)) remoteAvailable = false;
    return;
  }

  const { error } = await supabase
    .from("community_moment_reactions")
    .delete()
    .eq("moment_id", momentId)
    .eq("user_id", uid)
    .eq("kind", reactionKind);

  if (isMissingTableError(error)) remoteAvailable = false;
}

export function payloadFromShareInput(input: ShareToCommunityInput): CommunityMoment["payload"] {
  if (input.kind === "reading") return { reading: input.reading };
  if (input.kind === "prayer") return { prayer: input.prayer };
  return { agpeya: input.agpeya };
}

export function displayNameForShare(): string {
  return currentUserName();
}
