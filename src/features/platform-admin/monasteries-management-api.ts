import { supabase } from "@/integrations/supabase/client";
import type { ChurchPageStatus } from "@/features/church-page";

export type MonasteryManagementRow = {
  id: number;
  name: string;
  englishName: string | null;
  city: string | null;
  governorate: string | null;
  pageStatus: ChurchPageStatus;
  memberCount: number;
};

export type MonasteryManagementStats = Record<ChurchPageStatus, number> & { total: number };

const PAGE_STATUS_VALUES: ChurchPageStatus[] = ["inactive", "pending_claim", "verified", "suspended"];

function deriveStatus(raw: string | null | undefined): ChurchPageStatus {
  if (PAGE_STATUS_VALUES.includes(raw as ChurchPageStatus)) return raw as ChurchPageStatus;
  return "inactive";
}

export async function fetchMonasteryManagementStats(): Promise<MonasteryManagementStats | null> {
  const { data, error } = await supabase.from("monasteries").select("page_status, is_active");

  if (error) {
    console.warn("[fetchMonasteryManagementStats]", error.message);
    return null;
  }

  const stats: MonasteryManagementStats = {
    total: data?.length ?? 0,
    inactive: 0,
    pending_claim: 0,
    verified: 0,
    suspended: 0,
  };

  for (const row of data ?? []) {
    const status = row.is_active === false ? "suspended" : deriveStatus(row.page_status);
    stats[status] += 1;
  }

  return stats;
}

export async function fetchMonasteriesForManagement(limit = 40): Promise<MonasteryManagementRow[]> {
  const { data, error } = await supabase
    .from("monasteries")
    .select("id, monastery_name, english_name, city, governorate, page_status, members_count, is_active")
    .order("monastery_name", { ascending: true })
    .limit(limit);

  if (error) {
    console.warn("[fetchMonasteriesForManagement]", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: Number(row.id),
    name: String(row.monastery_name ?? ""),
    englishName: row.english_name ?? null,
    city: row.city ?? null,
    governorate: row.governorate ?? null,
    pageStatus: row.is_active === false ? "suspended" : deriveStatus(row.page_status),
    memberCount: Number(row.members_count ?? 0),
  }));
}
