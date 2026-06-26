import { supabase } from "@/integrations/supabase/client";
import type {
  PublisherContentKind,
  PublisherContentStatus,
  PublisherContentVisibility,
} from "@/features/publisher";

export type ContentReviewRow = {
  id: string;
  publisherId: string;
  publisherName: string;
  publisherType: string;
  contentKind: PublisherContentKind;
  title: string;
  description: string | null;
  coverUrl: string | null;
  mediaUrl: string | null;
  visibility: PublisherContentVisibility;
  allowDownload: boolean;
  durationSeconds: number | null;
  payload: Record<string, unknown>;
  status: PublisherContentStatus;
  createdAt: string;
  approvalId: string | null;
};

type Row = {
  id: string;
  publisher_id: string;
  content_kind: PublisherContentKind;
  title: string;
  description: string | null;
  cover_url: string | null;
  media_url: string | null;
  visibility: PublisherContentVisibility | null;
  allow_download: boolean | null;
  duration_seconds: number | null;
  payload: Record<string, unknown> | null;
  status: PublisherContentStatus;
  approval_id: string | null;
  created_at: string;
  publishers: {
    name: string;
    publisher_type: string;
  } | null;
};

export async function fetchPendingContentReviews(limit = 50): Promise<ContentReviewRow[]> {
  const { data, error } = await supabase
    .from("publisher_content_items")
    .select(
      "id, publisher_id, content_kind, title, description, cover_url, media_url, visibility, allow_download, duration_seconds, payload, status, approval_id, created_at, publishers(name, publisher_type)",
    )
    .eq("status", "pending_review")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[fetchPendingContentReviews]", error.message);
    return [];
  }

  return (data as unknown as Row[]).map((row) => ({
    id: row.id,
    publisherId: row.publisher_id,
    publisherName: (Array.isArray(row.publishers) ? row.publishers[0]?.name : row.publishers?.name) ?? "—",
    publisherType: (Array.isArray(row.publishers) ? row.publishers[0]?.publisher_type : row.publishers?.publisher_type) ?? "—",
    contentKind: row.content_kind,
    title: row.title,
    description: row.description,
    coverUrl: row.cover_url,
    mediaUrl: row.media_url,
    visibility: row.visibility ?? "private",
    allowDownload: row.allow_download ?? false,
    durationSeconds: row.duration_seconds ?? null,
    payload: row.payload ?? {},
    status: row.status,
    createdAt: row.created_at,
    approvalId: row.approval_id,
  }));
}

export async function patchContentReviewStatus(
  contentId: string,
  status: "approved" | "rejected" | "needs_changes",
  rejectionReason?: string,
): Promise<boolean> {
  const patch: Record<string, unknown> = {
    status,
    reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (rejectionReason) patch.rejection_reason = rejectionReason;

  const { error } = await supabase
    .from("publisher_content_items")
    .update(patch)
    .eq("id", contentId);

  if (error) {
    console.error("[patchContentReviewStatus]", error.message);
    return false;
  }

  if (status === "approved") {
    const { data: item } = await supabase
      .from("publisher_content_items")
      .select("publisher_id")
      .eq("id", contentId)
      .maybeSingle();

    if (item?.publisher_id) {
      await supabase.rpc("refresh_publisher_readiness", { p_id: item.publisher_id });
      const { count } = await supabase
        .from("publisher_content_items")
        .select("id", { count: "exact", head: true })
        .eq("publisher_id", item.publisher_id)
        .eq("status", "approved");

      await supabase
        .from("publishers")
        .update({ content_count: count ?? 0, updated_at: new Date().toISOString() })
        .eq("id", item.publisher_id);
    }
  }

  return true;
}

export async function patchPublisherTrusted(publisherId: string, isTrusted: boolean): Promise<boolean> {
  const { error } = await supabase
    .from("publishers")
    .update({ is_trusted: isTrusted, updated_at: new Date().toISOString() })
    .eq("id", publisherId);

  return !error;
}

export async function patchPublisherPublication(
  publisherId: string,
  status: "published" | "suspended" | "draft",
  isPublic?: boolean,
): Promise<boolean> {
  const patch: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === "published") {
    patch.is_public = isPublic ?? true;
    patch.published_at = new Date().toISOString();
  } else if (isPublic != null) {
    patch.is_public = isPublic;
  }

  const { error } = await supabase.from("publishers").update(patch).eq("id", publisherId);
  return !error;
}
