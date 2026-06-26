import { supabase } from "@/integrations/supabase/client";
import cardChurch from "@/assets/home/card-church.jpg";
import {
  CHURCHES_DIRECTORY_SELECT,
  isChurchDirectoryVerified,
  mapChurchesTableRow,
  type ChurchesTableRow,
} from "./churches-table";

export type DirectoryChurch = {
  id: string;
  name: string;
  englishName: string | null;
  diocese: string | null;
  governorate: string | null;
  city: string | null;
  country: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  coverImageUrl: string | null;
  priestName: string | null;
  priestsFull: string | null;
  patronSaint: string | null;
  patronFeasts: string | null;
  churchUrl: string | null;
  websiteUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  churchCode: string | null;
  description: string | null;
  isVerified: boolean;
  locationLat: number | null;
  locationLng: number | null;
  memberCount: number;
  servantCount: number;
};

type RoleRow = {
  church_id: string | number;
  role_name?: string;
  display_name?: string;
  is_primary_priest: boolean;
  role_key?: string;
  role_type?: string;
};

function mapDirectoryChurch(row: ChurchesTableRow, priestOverride: string | null): DirectoryChurch {
  const core = mapChurchesTableRow(row);
  return {
    id: core.id,
    name: core.name,
    englishName: row.english_name?.trim() || null,
    diocese: core.diocese,
    governorate: core.governorate,
    city: core.city,
    country: row.country?.trim() || null,
    address: core.address,
    phone: core.phone,
    whatsapp: core.whatsapp,
    email: row.email?.trim() || null,
    coverImageUrl: core.coverImageUrl,
    priestName: priestOverride ?? core.priestName,
    priestsFull: row.priests?.trim() || null,
    patronSaint: row.patron_saint?.trim() || null,
    patronFeasts: row.patron_feasts?.trim() || null,
    churchUrl: row.church_url?.trim() || null,
    websiteUrl: row.website_url?.trim() || null,
    facebookUrl: row.facebook_url?.trim() || null,
    youtubeUrl: row.youtube_url?.trim() || null,
    churchCode: row.church_code?.trim() || null,
    description: row.description?.trim() || null,
    isVerified: isChurchDirectoryVerified(row),
    locationLat: core.locationLat,
    locationLng: core.locationLng,
    memberCount: core.memberCount,
    servantCount: core.servantCount,
  };
}

export function directoryChurchImage(church: DirectoryChurch): string {
  return church.coverImageUrl?.trim() || cardChurch;
}

export function directoryChurchLocation(church: DirectoryChurch): string {
  return [church.city, church.governorate, church.diocese].filter(Boolean).join(" · ");
}

export function churchHasMapTarget(church: DirectoryChurch): boolean {
  if (church.locationLat != null && church.locationLng != null) return true;
  return Boolean(
    church.address?.trim() ||
      church.name?.trim() ||
      church.city?.trim() ||
      church.governorate?.trim(),
  );
}

export function mapsQueryLabel(church: DirectoryChurch): string {
  if (church.address?.trim()) return church.address.trim();
  return [church.name, church.city, church.governorate, church.diocese, church.country ?? "مصر"]
    .filter(Boolean)
    .join("، ");
}

/** Opens Google Maps directions using DB coordinates or textual location. */
export function mapsDirectionsUrlForChurch(church: DirectoryChurch): string {
  if (church.locationLat != null && church.locationLng != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${church.locationLat},${church.locationLng}`;
  }
  const label = mapsQueryLabel(church);
  return label
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(label)}`
    : "#";
}

/** Opens Google Maps search / pin view. */
export function mapsUrlForChurch(church: DirectoryChurch): string {
  if (church.locationLat != null && church.locationLng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${church.locationLat},${church.locationLng}`;
  }
  const label = mapsQueryLabel(church);
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
    .select(CHURCHES_DIRECTORY_SELECT)
    .eq("is_active", true)
    .order("church_name");

  if (error) {
    console.error("fetchApprovedChurches", error);
    return [];
  }

  const rows = (data ?? []) as ChurchesTableRow[];
  const priestMap = await priestNamesByChurchIds(rows.map((r) => String(r.id)));
  return rows.map((row) => mapDirectoryChurch(row, priestMap.get(String(row.id)) ?? null));
}

export async function fetchApprovedChurchById(id: string): Promise<DirectoryChurch | null> {
  const { data, error } = await supabase
    .from("churches")
    .select(CHURCHES_DIRECTORY_SELECT)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("fetchApprovedChurchById", error);
    return null;
  }

  const priestMap = await priestNamesByChurchIds([String(data.id)]);
  return mapDirectoryChurch(data as ChurchesTableRow, priestMap.get(String(data.id)) ?? null);
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
