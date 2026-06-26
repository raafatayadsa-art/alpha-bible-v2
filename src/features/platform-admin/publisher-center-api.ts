import { supabase } from "@/integrations/supabase/client";
import type { PublisherStatus, PublisherType } from "@/features/publisher/types";
import {
  PUBLISHER_COPYRIGHT_REPORT_KIND_LABELS,
  PUBLISHER_COPYRIGHT_REPORT_STATUS_LABELS,
  type PublisherCopyrightReportKind,
  type PublisherCopyrightReportStatus,
} from "@/features/publisher/publisher-legal";

export type PublisherAdminRow = {
  id: string;
  name: string;
  publisherType: PublisherType;
  status: PublisherStatus;
  isTrusted: boolean;
  isPublic: boolean;
  contentCount: number;
  likesCount: number;
  ownerUserId: string | null;
  updatedAt: string;
};

export type CopyrightReportRow = {
  id: string;
  contentId: string;
  publisherId: string;
  publisherName: string;
  contentTitle: string;
  reportKind: PublisherCopyrightReportKind;
  description: string;
  status: PublisherCopyrightReportStatus;
  createdAt: string;
};

export async function fetchPublishersAdmin(limit = 80): Promise<PublisherAdminRow[]> {
  const { data, error } = await supabase
    .from("publishers")
    .select(
      "id, name, publisher_type, status, is_trusted, is_public, content_count, likes_count, owner_user_id, updated_at",
    )
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[fetchPublishersAdmin]", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    publisherType: row.publisher_type as PublisherType,
    status: row.status as PublisherStatus,
    isTrusted: row.is_trusted ?? false,
    isPublic: row.is_public ?? false,
    contentCount: row.content_count ?? 0,
    likesCount: (row as { likes_count?: number }).likes_count ?? 0,
    ownerUserId: row.owner_user_id,
    updatedAt: row.updated_at,
  }));
}

export async function fetchCopyrightReportsAdmin(limit = 50): Promise<CopyrightReportRow[]> {
  const { data, error } = await supabase
    .from("publisher_copyright_reports")
    .select(
      "id, content_id, publisher_id, report_kind, description, status, created_at, publishers(name), publisher_content_items(title)",
    )
    .in("status", ["pending", "under_investigation"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[fetchCopyrightReportsAdmin]", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const pub = row.publishers as { name?: string } | { name?: string }[] | null;
    const item = row.publisher_content_items as { title?: string } | { title?: string }[] | null;
    const pubName = Array.isArray(pub) ? pub[0]?.name : pub?.name;
    const itemTitle = Array.isArray(item) ? item[0]?.title : item?.title;
    return {
      id: row.id,
      contentId: row.content_id,
      publisherId: row.publisher_id,
      publisherName: pubName ?? "—",
      contentTitle: itemTitle ?? "—",
      reportKind: row.report_kind as PublisherCopyrightReportKind,
      description: row.description,
      status: row.status as PublisherCopyrightReportStatus,
      createdAt: row.created_at,
    };
  });
}

export async function resolveCopyrightReportAdmin(
  reportId: string,
  action: "remove" | "keep" | "dismiss",
  adminNotes?: string,
): Promise<boolean> {
  const { error } = await supabase.rpc("resolve_publisher_copyright_report", {
    p_report_id: reportId,
    p_action: action,
    p_admin_notes: adminNotes ?? null,
  });
  if (error) {
    console.error("[resolveCopyrightReportAdmin]", error.message);
    return false;
  }
  return true;
}

export async function togglePublisherTrustedAdmin(publisherId: string, isTrusted: boolean): Promise<boolean> {
  const { error } = await supabase
    .from("publishers")
    .update({ is_trusted: isTrusted, updated_at: new Date().toISOString() })
    .eq("id", publisherId);
  return !error;
}

export { PUBLISHER_COPYRIGHT_REPORT_KIND_LABELS, PUBLISHER_COPYRIGHT_REPORT_STATUS_LABELS };
