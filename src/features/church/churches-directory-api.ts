import { supabase } from "@/integrations/supabase/client";
import cardChurch from "@/assets/home/card-church.jpg";

export type DirectoryChurch = {
  id: string;
  name: string;
  diocese: string | null;
  governorate: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  coverImageUrl: string | null;
  priestName: string | null;
  locationLat: number | null;
  locationLng: number | null;
  memberCount: number;
  servantCount: number;
};

type ChurchRow = {
  id: string;
  name: string;
  diocese: string | null;
  governorate: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  cover_image_url: string | null;
  location_lat: number | null;
  location_lng: number | null;
  member_count: number;
  servant_count: number;
  status: string;
};

type RoleRow = {
  church_id: string;
  role_name?: string;
  display_name?: string;
  is_primary_priest: boolean;
  role_key?: string;
  role_type?: string;
};

function mapChurchRow(row: ChurchRow, priestName: string | null): DirectoryChurch {
  return {
    id: String(row.id),
    name: row.name,
    diocese: row.diocese,
    governorate: row.governorate,
    city: row.city,
    address: row.address,
    phone: row.phone,
    whatsapp: row.whatsapp,
    coverImageUrl: row.cover_image_url,
    priestName,
    locationLat: row.location_lat != null ? Number(row.location_lat) : null,
    locationLng: row.location_lng != null ? Number(row.location_lng) : null,
    memberCount: row.member_count ?? 0,
    servantCount: row.servant_count ?? 0,
  };
}

export function directoryChurchImage(church: DirectoryChurch): string {
  return church.coverImageUrl?.trim() || cardChurch;
}

export function directoryChurchLocation(church: DirectoryChurch): string {
  return [church.city, church.governorate, church.diocese].filter(Boolean).join(" · ");
}

export function mapsUrlForChurch(church: DirectoryChurch): string {
  if (church.locationLat != null && church.locationLng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${church.locationLat},${church.locationLng}`;
  }
  const label = church.address ?? [church.name, church.city].filter(Boolean).join("، ");
  return label
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`
    : "#";
}

async function priestNamesByChurchIds(churchIds: string[]): Promise<Map<string, string>> {
  if (!churchIds.length) return new Map();

  const { data, error } = await supabase
    .from("church_roles")
    .select("church_id, role_name, display_name, is_primary_priest, role_key, role_type")
    .in("church_id", churchIds)
    .eq("visible_to_members", true);

  if (error) {
    console.error("priestNamesByChurchIds", error);
    return new Map();
  }

  const map = new Map<string, string>();
  for (const row of (data ?? []) as RoleRow[]) {
    const id = String(row.church_id);
    if (map.has(id)) continue;
    const isPriest =
      row.is_primary_priest || row.role_key === "priest" || row.role_type === "priest";
    if (!isPriest) continue;
    const name = row.role_name ?? row.display_name;
    if (name) map.set(id, name);
  }
  return map;
}

export async function fetchApprovedChurches(): Promise<DirectoryChurch[]> {
  const { data, error } = await supabase
    .from("churches")
    .select(
      "id, name, diocese, governorate, city, address, phone, whatsapp, cover_image_url, location_lat, location_lng, member_count, servant_count, status",
    )
    .eq("status", "approved")
    .order("name");

  if (error) {
    console.error("fetchApprovedChurches", error);
    return [];
  }

  const rows = (data ?? []) as ChurchRow[];
  const priestMap = await priestNamesByChurchIds(rows.map((r) => String(r.id)));
  return rows.map((row) => mapChurchRow(row, priestMap.get(String(row.id)) ?? null));
}

export async function fetchApprovedChurchById(id: string): Promise<DirectoryChurch | null> {
  const { data, error } = await supabase
    .from("churches")
    .select(
      "id, name, diocese, governorate, city, address, phone, whatsapp, cover_image_url, location_lat, location_lng, member_count, servant_count, status",
    )
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("fetchApprovedChurchById", error);
    return null;
  }

  const priestMap = await priestNamesByChurchIds([String(data.id)]);
  return mapChurchRow(data as ChurchRow, priestMap.get(String(data.id)) ?? null);
}

const RECENT_KEY = "alpha:church-directory:recent";

export function getRecentChurchIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
  } catch {
    return [];
  }
}

export function pushRecentChurchId(id: string) {
  if (typeof window === "undefined") return;
  const next = [id, ...getRecentChurchIds().filter((x) => x !== id)].slice(0, 8);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}
