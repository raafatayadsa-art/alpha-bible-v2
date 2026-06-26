import { supabase } from "@/integrations/supabase/client";
import type { ChurchDashboardRecord } from "./church-dashboard-api";
import { resolveActiveChurchId } from "./church-dashboard-api";
import {
  CHURCHES_DIRECTORY_SELECT,
  mapChurchesTableRow,
  type ChurchesTableRow,
} from "./churches-table";

export type MemberChurchRecord = {
  id: string;
  name: string;
  diocese: string | null;
  governorate: string | null;
  city: string | null;
  address: string | null;
  coverImageUrl: string | null;
  locationLine: string;
  joinedAt: string | null;
  joinLabel: string | null;
};

let cache: MemberChurchRecord | null = null;

export function getCachedMemberChurch(): MemberChurchRecord | null {
  return cache;
}

export function clearMemberChurchCache() {
  cache = null;
}

export function resolvedMemberChurchName(fallback = "—"): string {
  return cache?.name?.trim() || fallback;
}

export function formatMembershipJoinLabel(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return `عضو منذ ${new Date(iso).toLocaleDateString("ar-EG", { month: "long", year: "numeric" })}`;
  } catch {
    return null;
  }
}

function locationLineFromParts(
  city: string | null | undefined,
  governorate: string | null | undefined,
  diocese: string | null | undefined,
): string {
  return [city, governorate, diocese].filter(Boolean).join(" · ");
}

export function seedMemberChurchCache(
  church: ChurchDashboardRecord,
  joinedAt: string | null = cache?.id === church.id ? cache.joinedAt : null,
) {
  cache = {
    id: church.id,
    name: church.name,
    diocese: church.diocese,
    governorate: church.governorate,
    city: church.city,
    address: church.address,
    coverImageUrl: church.coverImageUrl,
    locationLine: locationLineFromParts(church.city, church.governorate, church.diocese),
    joinedAt,
    joinLabel: formatMembershipJoinLabel(joinedAt),
  };
}

async function membershipJoinedAt(churchId: string, userId: string | null): Promise<string | null> {
  if (!userId) return null;
  const { data } = await supabase
    .from("church_memberships")
    .select("joined_at")
    .eq("user_id", userId)
    .eq("church_id", churchId)
    .eq("status", "active")
    .maybeSingle();
  return data?.joined_at ?? null;
}

/** Same church resolution as /church dashboard + directory. */
export async function fetchMemberChurchRecord(): Promise<MemberChurchRecord | null> {
  const churchId = await resolveActiveChurchId();
  if (!churchId) {
    cache = null;
    return null;
  }

  const { waitForAuthUserId } = await import("@/features/auth");
  const userId = await waitForAuthUserId();

  const { data, error } = await supabase
    .from("churches")
    .select(CHURCHES_DIRECTORY_SELECT)
    .eq("id", churchId)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    console.error("[fetchMemberChurchRecord]", error);
    cache = null;
    return null;
  }

  const core = mapChurchesTableRow(data as ChurchesTableRow);
  const joinedAt = await membershipJoinedAt(churchId, userId);
  cache = {
    id: core.id,
    name: core.name,
    diocese: core.diocese,
    governorate: core.governorate,
    city: core.city,
    address: core.address,
    coverImageUrl: core.coverImageUrl,
    locationLine: locationLineFromParts(core.city, core.governorate, core.diocese),
    joinedAt,
    joinLabel: formatMembershipJoinLabel(joinedAt),
  };
  return cache;
}
