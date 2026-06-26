import { supabase } from "@/integrations/supabase/client";
import { isChurchDirectoryVerified } from "@/features/church/churches-table";
import { deriveChurchPageStatus } from "@/features/church-page";
import { normalizeDirectoryName } from "./normalize";
import type {
  ChurchDirectoryFacets,
  ChurchDirectoryFilterState,
  ChurchDirectoryFullDetails,
  ChurchDirectoryRow,
  ChurchDirectorySearchResult,
} from "./types";
import { CHURCH_DIR_PAGE_SIZE, NEARBY_RADIUS_KM } from "./tokens";

type RpcRow = {
  id: number | string;
  church_name: string;
  patron_saint: string | null;
  city: string | null;
  governorate: string | null;
  country: string | null;
  church_logo: string | null;
  is_verified: boolean | null;
  latitude: number | null;
  longitude: number | null;
  distance_km: number | null;
  total_count: number | string | null;
};

const CHURCH_DETAIL_SELECT =
  "id, church_name, english_name, parish, patron_saint, patron_feasts, governorate, city, country, formatted_address, description, priests, phone, whatsapp, email, hero_image, cover_image_url, website_url, facebook_url, youtube_url, church_url, church_code, is_verified, location_verified, verified_location_url, latitude, longitude, members_count, servants_count, page_status, is_active";

function mapRpcRow(row: RpcRow): ChurchDirectoryRow {
  return {
    id: String(row.id),
    name: normalizeDirectoryName(row.church_name),
    patronSaint: row.patron_saint?.trim() || null,
    city: row.city?.trim() || null,
    governorate: row.governorate?.trim() || null,
    country: row.country?.trim() || null,
    logoUrl: row.church_logo?.trim() || null,
    isVerified: row.is_verified === true,
    lat: row.latitude != null ? Number(row.latitude) : null,
    lng: row.longitude != null ? Number(row.longitude) : null,
    distanceKm: row.distance_km != null ? Number(row.distance_km) : null,
  };
}

function priestNameFromText(raw: string | null | undefined): string | null {
  const text = raw?.trim();
  if (!text) return null;
  return text.split(/[:：\n]/)[0]?.trim() || null;
}

export async function searchChurchDirectoryPage(
  filters: ChurchDirectoryFilterState,
  page: number,
  userLat: number | null,
  userLng: number | null,
): Promise<ChurchDirectorySearchResult> {
  const offset = page * CHURCH_DIR_PAGE_SIZE;
  const { data, error } = await supabase.rpc("search_church_directory", {
    p_query: filters.query.trim() || null,
    p_governorate: filters.governorate.trim() || null,
    p_city: filters.city.trim() || null,
    p_patron_saint: filters.patronSaint.trim() || null,
    p_verified_only: filters.verifiedOnly,
    p_nearby_only: filters.nearbyOnly,
    p_user_lat: userLat,
    p_user_lng: userLng,
    p_nearby_km: NEARBY_RADIUS_KM,
    p_limit: CHURCH_DIR_PAGE_SIZE,
    p_offset: offset,
  });

  if (error) {
    console.error("[searchChurchDirectoryPage]", error);
    return { rows: [], totalCount: 0 };
  }

  const rows = (data ?? []) as RpcRow[];
  const totalCount = rows[0]?.total_count != null ? Number(rows[0].total_count) : 0;
  return {
    rows: rows.map(mapRpcRow),
    totalCount,
  };
}

export async function fetchChurchDirectoryFacets(): Promise<ChurchDirectoryFacets> {
  const { data, error } = await supabase.rpc("church_directory_facets");
  if (error || !data) {
    console.error("[fetchChurchDirectoryFacets]", error);
    return { governorates: [], cities: [], patronSaints: [], verifiedCount: 0, totalCount: 0 };
  }
  const payload = data as {
    governorates?: string[];
    cities?: string[];
    patronSaints?: string[];
    verifiedCount?: number;
    totalCount?: number;
  };
  return {
    governorates: payload.governorates ?? [],
    cities: payload.cities ?? [],
    patronSaints: payload.patronSaints ?? [],
    verifiedCount: payload.verifiedCount ?? 0,
    totalCount: payload.totalCount ?? 0,
  };
}

/** Full church record — detail page only (never list/map). */
export async function fetchChurchDirectoryFullDetails(
  id: string,
): Promise<ChurchDirectoryFullDetails | null> {
  const { data, error } = await supabase
    .from("churches")
    .select(CHURCH_DETAIL_SELECT)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[fetchChurchDirectoryFullDetails]", error);
    return null;
  }

  const row = data as Record<string, unknown>;
  const isVerified = isChurchDirectoryVerified({
    is_verified: row.is_verified as boolean | null,
    location_verified: row.location_verified as boolean | null,
  });
  return {
    id: String(row.id),
    name: normalizeDirectoryName(row.church_name as string),
    englishName: (row.english_name as string | null)?.trim() || null,
    patronSaint: (row.patron_saint as string | null)?.trim() || null,
    patronFeasts: (row.patron_feasts as string | null)?.trim() || null,
    diocese: (row.parish as string | null)?.trim() || null,
    governorate: (row.governorate as string | null)?.trim() || null,
    city: (row.city as string | null)?.trim() || null,
    country: (row.country as string | null)?.trim() || null,
    address: (row.formatted_address as string | null)?.trim() || null,
    description: (row.description as string | null)?.trim() || null,
    priestsFull: (row.priests as string | null)?.trim() || null,
    priestName: priestNameFromText(row.priests as string | null),
    phone: (row.phone as string | null)?.trim() || null,
    whatsapp: (row.whatsapp as string | null)?.trim() || null,
    email: (row.email as string | null)?.trim() || null,
    websiteUrl: (row.website_url as string | null)?.trim() || null,
    facebookUrl: (row.facebook_url as string | null)?.trim() || null,
    youtubeUrl: (row.youtube_url as string | null)?.trim() || null,
    churchUrl: (row.church_url as string | null)?.trim() || null,
    churchCode: (row.church_code as string | null)?.trim() || null,
    heroImageUrl: (row.hero_image as string | null)?.trim() || null,
    coverImageUrl: (row.cover_image_url as string | null)?.trim() || null,
    isVerified,
    pageStatus: deriveChurchPageStatus({
      pageStatus: row.page_status as string | null,
      isVerified,
      isActive: row.is_active as boolean | null,
    }),
    verifiedLocationUrl: (row.verified_location_url as string | null)?.trim() || null,
    lat: row.latitude != null ? Number(row.latitude) : null,
    lng: row.longitude != null ? Number(row.longitude) : null,
    memberCount: Number(row.members_count ?? 0),
    servantCount: Number(row.servants_count ?? 0),
  };
}

export function pushRecentChurchId(id: string) {
  const RECENT_KEY = "alpha:church-directory:recent";
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    const next = [id, ...(Array.isArray(parsed) ? parsed : []).filter((x) => x !== id)].slice(0, 8);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
