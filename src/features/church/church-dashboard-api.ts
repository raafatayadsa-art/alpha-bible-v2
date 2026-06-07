import { supabase } from "@/integrations/supabase/client";
import type { ContactRoleType } from "@/data/church-contacts";
import { getResidentUserId, readSetupRequestIdFromHub } from "./church-user-id";

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
  memberCount: number;
  servantCount: number;
  primaryPriestName: string | null;
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
  member_count: number;
  servant_count: number;
};

type RoleRow = {
  id: string;
  role_type: ContactRoleType;
  display_name: string;
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

function mapChurch(row: ChurchRow, primaryPriestName: string | null): ChurchDashboardRecord {
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
    memberCount: row.member_count,
    servantCount: row.servant_count,
    primaryPriestName,
  };
}

function mapContact(row: RoleRow): ChurchDashboardContact {
  return {
    id: row.id,
    name: row.display_name,
    role: row.title,
    roleType: row.role_type,
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

async function resolveChurchId(userId: string | null): Promise<string | null> {
  if (!userId) return null;

  const { data: memberships } = await supabase
    .from("church_memberships")
    .select("church_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1);

  const memberChurchId = memberships?.[0]?.church_id as string | undefined;
  if (memberChurchId) {
    const { data: approved } = await supabase
      .from("churches")
      .select("id")
      .eq("id", memberChurchId)
      .eq("status", "approved")
      .maybeSingle();
    if (approved?.id) return String(approved.id);
  }

  const setupRequestId = readSetupRequestIdFromHub();
  if (!setupRequestId) return null;

  const { data: bySetup } = await supabase
    .from("churches")
    .select("id")
    .eq("setup_request_id", setupRequestId)
    .eq("status", "approved")
    .maybeSingle();

  return bySetup?.id != null ? String(bySetup.id) : null;
}

export async function fetchChurchDashboard(): Promise<ChurchDashboardData | null> {
  const userId = await getResidentUserId();
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
  const primaryPriest = roles.find((r) => r.is_primary_priest) ?? roles.find((r) => r.role_type === "priest");

  return {
    church: mapChurch(churchRes.data as ChurchRow, primaryPriest?.display_name ?? null),
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
