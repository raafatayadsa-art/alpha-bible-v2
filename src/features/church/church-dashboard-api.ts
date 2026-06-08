import { supabase } from "@/integrations/supabase/client";
import type { ContactRoleType } from "@/data/church-contacts";
import { getResidentUserId, readSetupRequestIdFromHub } from "./church-user-id";
import {
  backfillApprovedChurchSetupRequests,
  ensureCurrentUserApprovedChurchMembership,
} from "./church-provisioning";

export type ChurchDashboardRecord = {
  id: string;
  name: string;
  diocese: string | null;
  governorate: string | null;
  city: string | null;
  address: string | null;
  locationLat: number | null;
  locationLng: number | null;
  phone: string | null;
  whatsapp: string | null;
  coverImageUrl: string | null;
  memberCount: number;
  servantCount: number;
  primaryPriestName: string | null;
  primaryPriestInitials: string | null;
  primaryPriestAvatarUrl: string | null;
};

export type ChurchDashboardContact = {
  id: string;
  name: string;
  role: string;
  roleType: ContactRoleType;
  phone: string;
  whatsapp: string;
  initials: string;
  messagingAllowed: boolean;
};

export type ChurchDashboardPrayer = {
  id: string;
  title: string;
  request: string;
  category: string;
  status: "active" | "urgent" | "answered";
  prayers: number;
  time: string;
  anonymous: boolean;
  userName: string;
};

export type ChurchDashboardData = {
  church: ChurchDashboardRecord;
  contacts: ChurchDashboardContact[];
  prayers: ChurchDashboardPrayer[];
};

type ChurchRow = {
  id: string | number;
  name: string;
  diocese: string | null;
  governorate: string | null;
  city: string | null;
  address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  phone: string | null;
  whatsapp: string | null;
  cover_image_url: string | null;
  member_count: number;
  servant_count: number;
};

type RoleRow = {
  id: string | number;
  user_id?: string | null;
  role_type?: ContactRoleType;
  role_key?: string;
  display_name?: string;
  role_name?: string;
  title: string;
  phone: string;
  whatsapp: string;
  initials: string;
  messaging_allowed: boolean;
  is_primary_priest: boolean;
  sort_order: number;
};

type PrayerRow = {
  id: string;
  user_name: string;
  title: string;
  body: string;
  category: string;
  status: "active" | "urgent" | "answered";
  anonymous: boolean;
  prayer_count: number;
  created_at: string;
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

function mapChurch(
  row: ChurchRow,
  primaryPriest: RoleRow | undefined,
  currentUserId: string | null,
  currentUserAvatar: string | null,
): ChurchDashboardRecord {
  const priestName = primaryPriest?.role_name ?? primaryPriest?.display_name ?? null;
  const priestUserId = primaryPriest?.user_id ?? null;
  const priestAvatar =
    priestUserId && currentUserId && priestUserId === currentUserId ? currentUserAvatar : null;

  return {
    id: String(row.id),
    name: row.name,
    diocese: row.diocese,
    governorate: row.governorate,
    city: row.city,
    address: row.address,
    locationLat: row.location_lat != null ? Number(row.location_lat) : null,
    locationLng: row.location_lng != null ? Number(row.location_lng) : null,
    phone: row.phone,
    whatsapp: row.whatsapp,
    coverImageUrl: row.cover_image_url,
    memberCount: row.member_count,
    servantCount: row.servant_count,
    primaryPriestName: priestName,
    primaryPriestInitials: primaryPriest?.initials ?? (priestName?.trim().charAt(0) || "✚"),
    primaryPriestAvatarUrl: priestAvatar,
  };
}

function mapContact(row: RoleRow): ChurchDashboardContact {
  const roleKey = (row.role_key ?? row.role_type ?? "servant") as ContactRoleType;
  return {
    id: String(row.id),
    name: row.role_name ?? row.display_name ?? row.title ?? "",
    role: row.title,
    roleType: roleKey,
    phone: row.phone,
    whatsapp: row.whatsapp,
    initials: row.initials,
    messagingAllowed: row.messaging_allowed,
  };
}

function mapPrayer(row: PrayerRow): ChurchDashboardPrayer {
  return {
    id: row.id,
    title: row.title,
    request: row.body,
    category: row.category,
    status: row.status,
    prayers: row.prayer_count,
    time: formatRelativeTime(row.created_at),
    anonymous: row.anonymous,
    userName: row.anonymous ? "طلب صلاة مجهول" : row.user_name,
  };
}

async function churchIdBySetupRequest(setupRequestId: string): Promise<string | null> {
  const { data: bySetup } = await supabase
    .from("churches")
    .select("id")
    .eq("setup_request_id", setupRequestId)
    .eq("status", "approved")
    .maybeSingle();
  return bySetup?.id != null ? String(bySetup.id) : null;
}

async function findSingletonApprovedChurchId(): Promise<string | null> {
  const { data: setups } = await supabase
    .from("church_setup_requests")
    .select("id")
    .eq("status", "approved");
  if (!setups || setups.length !== 1) return null;
  return churchIdBySetupRequest(setups[0].id);
}

async function resolveChurchId(userId: string | null): Promise<string | null> {
  if (userId) {
    const { data: memberships } = await supabase
      .from("church_memberships")
      .select("church_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1);

    const memberChurchId = memberships?.[0]?.church_id;
    if (memberChurchId != null) {
      const { data: approved } = await supabase
        .from("churches")
        .select("id")
        .eq("id", memberChurchId)
        .eq("status", "approved")
        .maybeSingle();
      if (approved?.id != null) return String(approved.id);
    }

    return null;
  }

  const setupRequestId = readSetupRequestIdFromHub();
  if (setupRequestId) {
    const churchId = await churchIdBySetupRequest(setupRequestId);
    if (churchId) return churchId;
  }

  return findSingletonApprovedChurchId();
}

export type ChurchProfileContext = {
  hasApprovedChurch: boolean;
  setupStatus: "none" | "pending" | "needs_info";
  adminNotes?: string;
};

export type ChurchHubDashboardAccess = {
  canOpenDashboard: boolean;
};

/** /profile/church gate — membership + approved church only (no setup_requests). */
export async function resolveChurchHubDashboardAccess(): Promise<ChurchHubDashboardAccess> {
  const { waitForAuthUserId } = await import("@/features/auth");
  const userId = await waitForAuthUserId();
  if (!userId) return { canOpenDashboard: false };

  const { data: membership } = await supabase
    .from("church_memberships")
    .select("church_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .eq("membership_status", "approved")
    .limit(1)
    .maybeSingle();

  if (!membership?.church_id) return { canOpenDashboard: false };

  const { data: church } = await supabase
    .from("churches")
    .select("id")
    .eq("id", membership.church_id)
    .eq("status", "approved")
    .maybeSingle();

  return { canOpenDashboard: church?.id != null };
}

async function hasActiveApprovedMembership(userId: string): Promise<boolean> {
  const { data: membership } = await supabase
    .from("church_memberships")
    .select("church_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!membership?.church_id) return false;

  const { data: church } = await supabase
    .from("churches")
    .select("id")
    .eq("id", membership.church_id)
    .eq("status", "approved")
    .maybeSingle();

  return church?.id != null;
}

export async function fetchChurchProfileContext(): Promise<ChurchProfileContext> {
  const { waitForAuthUserId } = await import("@/features/auth");
  const userId = (await waitForAuthUserId()) ?? (await getResidentUserId());
  console.log("[fetchChurchProfileContext:start]", { userId });

  if (userId) {
    await ensureCurrentUserApprovedChurchMembership(userId);
  }

  await backfillApprovedChurchSetupRequests(userId);
  console.log("[fetchChurchProfileContext:backfill done]", { userId });

  if (userId && (await hasActiveApprovedMembership(userId))) {
    return { hasApprovedChurch: true, setupStatus: "none" };
  }

  if (userId) {
    const { data: setup } = await supabase
      .from("church_setup_requests")
      .select("id, status, notes")
      .eq("submitted_by", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (setup) {
      if (setup.status === "needs_info") {
        return {
          hasApprovedChurch: false,
          setupStatus: "needs_info",
          adminNotes: setup.notes ?? undefined,
        };
      }
      if (setup.status === "pending" || setup.status === "under_review") {
        return { hasApprovedChurch: false, setupStatus: "pending" };
      }
    }
  }

  const hubSetupId = readSetupRequestIdFromHub();
  if (hubSetupId) {
    const { data: setup } = await supabase
      .from("church_setup_requests")
      .select("status, notes")
      .eq("id", hubSetupId)
      .maybeSingle();

    if (setup?.status === "needs_info") {
      return {
        hasApprovedChurch: false,
        setupStatus: "needs_info",
        adminNotes: setup.notes ?? undefined,
      };
    }
    if (setup?.status === "pending" || setup?.status === "under_review") {
      return { hasApprovedChurch: false, setupStatus: "pending" };
    }
  }

  return { hasApprovedChurch: false, setupStatus: "none" };
}

export async function fetchChurchDashboard(): Promise<ChurchDashboardData | null> {
  const { waitForAuthUserId } = await import("@/features/auth");
  const userId = (await waitForAuthUserId()) ?? (await getResidentUserId());
  if (userId) {
    await ensureCurrentUserApprovedChurchMembership(userId);
  }
  await backfillApprovedChurchSetupRequests(userId);
  const churchId = await resolveChurchId(userId);
  if (!churchId) return null;

  const [churchRes, rolesRes, prayersRes] = await Promise.all([
    supabase.from("churches").select("*").eq("id", churchId).eq("status", "approved").maybeSingle(),
    supabase
      .from("church_roles")
      .select("*")
      .eq("church_id", churchId)
      .eq("visible_to_members", true)
      .order("sort_order"),
    supabase
      .from("prayer_requests")
      .select("*")
      .eq("church_id", churchId)
      .eq("visibility", "community")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  if (churchRes.error || !churchRes.data) {
    console.error("fetchChurchDashboard: church", churchRes.error);
    return null;
  }

  const roles = (rolesRes.data ?? []) as RoleRow[];
  const primaryPriest =
    roles.find((r) => r.is_primary_priest) ??
    roles.find((r) => r.role_key === "priest" || r.role_type === "priest");

  const { getAuthUserSync } = await import("@/features/auth");
  const authUser = getAuthUserSync();

  return {
    church: mapChurch(
      churchRes.data as ChurchRow,
      primaryPriest,
      authUser?.id ?? null,
      authUser?.avatarUrl ?? null,
    ),
    contacts: roles.map(mapContact),
    prayers: ((prayersRes.data ?? []) as PrayerRow[]).map(mapPrayer),
  };
}

export async function fetchChurchRoleById(roleId: string): Promise<ChurchDashboardContact | null> {
  const { data, error } = await supabase
    .from("church_roles")
    .select("*")
    .eq("id", roleId)
    .eq("visible_to_members", true)
    .maybeSingle();

  if (error || !data) return null;
  return mapContact(data as RoleRow);
}

export function prayerStatsFromDashboard(prayers: ChurchDashboardPrayer[]) {
  const active = prayers.filter((p) => p.status === "active" || p.status === "urgent").length;
  const peoplePrayed = prayers.reduce((s, p) => s + p.prayers, 0);
  return { active, peoplePrayed };
}
