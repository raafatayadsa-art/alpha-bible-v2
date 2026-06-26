import { supabase } from "@/integrations/supabase/client";
import type { ChurchPageStatus } from "@/features/church-page";

export type ChurchPageStatusFilter = ChurchPageStatus | "all";

export type ChurchManagementRow = {
  id: number;
  name: string;
  city: string | null;
  governorate: string | null;
  pageStatus: ChurchPageStatus;
  isVerified: boolean;
  memberCount: number;
};

export type ChurchManagementStats = Record<ChurchPageStatus, number> & { total: number };

const PAGE_STATUS_VALUES: ChurchPageStatus[] = ["inactive", "pending_claim", "verified", "suspended"];

function deriveStatus(row: {
  page_status?: string | null;
  is_verified?: boolean | null;
  is_active?: boolean | null;
}): ChurchPageStatus {
  const raw = row.page_status?.trim();
  if (PAGE_STATUS_VALUES.includes(raw as ChurchPageStatus)) return raw as ChurchPageStatus;
  if (row.is_active === false) return "suspended";
  if (row.is_verified) return "verified";
  return "inactive";
}

export async function fetchChurchManagementStats(): Promise<ChurchManagementStats | null> {
  const { data, error } = await supabase
    .from("churches")
    .select("page_status, is_verified, is_active");

  if (error || !data) {
    console.warn("[fetchChurchManagementStats]", error?.message);
    return null;
  }

  const stats: ChurchManagementStats = {
    total: data.length,
    inactive: 0,
    pending_claim: 0,
    verified: 0,
    suspended: 0,
  };

  for (const row of data) {
    const status = deriveStatus(row);
    stats[status] += 1;
  }

  return stats;
}

export async function fetchChurchesForManagement(
  filter: ChurchPageStatusFilter,
  limit = 40,
): Promise<ChurchManagementRow[]> {
  let query = supabase
    .from("churches")
    .select("id, church_name, city, governorate, page_status, is_verified, is_active, members_count")
    .order("church_name", { ascending: true })
    .limit(limit);

  if (filter !== "all") {
    query = query.eq("page_status", filter);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.warn("[fetchChurchesForManagement]", error?.message);
    return [];
  }

  return data.map((row) => ({
    id: Number(row.id),
    name: String(row.church_name ?? ""),
    city: row.city ?? null,
    governorate: row.governorate ?? null,
    pageStatus: deriveStatus(row),
    isVerified: Boolean(row.is_verified),
    memberCount: Number(row.members_count ?? 0),
  }));
}

export async function patchChurchPageStatus(
  churchId: number,
  pageStatus: ChurchPageStatus,
): Promise<boolean> {
  const patch: Record<string, unknown> = {
    page_status: pageStatus,
    updated_at: new Date().toISOString(),
  };
  if (pageStatus === "verified") patch.is_verified = true;
  if (pageStatus === "inactive") patch.is_verified = false;
  if (pageStatus === "suspended") patch.is_active = false;
  if (pageStatus !== "suspended") patch.is_active = true;

  const { error } = await supabase.from("churches").update(patch).eq("id", churchId);
  if (error) {
    console.error("[patchChurchPageStatus]", error.message);
    return false;
  }
  return true;
}
