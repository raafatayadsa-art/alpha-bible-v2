/** Maps the live `public.churches` directory schema to app-facing church records. */

export const CHURCHES_DIRECTORY_SELECT =
  "id, church_name, english_name, parish, governorate, city, country, formatted_address, phone, whatsapp, email, cover_image_url, hero_image, latitude, longitude, members_count, servants_count, priests, patron_saint, patron_feasts, church_url, website_url, facebook_url, youtube_url, church_code, description, is_verified, location_verified, is_active";

export type ChurchesTableRow = {
  id: number | string;
  church_name: string;
  english_name?: string | null;
  parish?: string | null;
  governorate?: string | null;
  city?: string | null;
  country?: string | null;
  formatted_address?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  cover_image_url?: string | null;
  hero_image?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  members_count?: number | null;
  servants_count?: number | null;
  priests?: string | null;
  patron_saint?: string | null;
  patron_feasts?: string | null;
  church_url?: string | null;
  website_url?: string | null;
  facebook_url?: string | null;
  youtube_url?: string | null;
  church_code?: string | null;
  description?: string | null;
  is_verified?: boolean | null;
  location_verified?: boolean | null;
  is_active?: boolean | null;
};

export type NormalizedChurchCore = {
  id: string;
  name: string;
  diocese: string | null;
  governorate: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  coverImageUrl: string | null;
  locationLat: number | null;
  locationLng: number | null;
  memberCount: number;
  servantCount: number;
  priestName: string | null;
};

export function normalizeChurchName(raw: string | null | undefined): string {
  return (raw ?? "").replace(/\s*\n+\s*/g, " ").replace(/\s+/g, " ").trim();
}

export function priestNameFromRow(row: Pick<ChurchesTableRow, "priests">): string | null {
  const raw = row.priests?.trim();
  if (!raw) return null;
  const first = raw.split(/[:：\n]/)[0]?.trim();
  return first || null;
}

export function coverImageFromRow(
  row: Pick<ChurchesTableRow, "cover_image_url" | "hero_image">,
): string | null {
  return row.cover_image_url?.trim() || row.hero_image?.trim() || null;
}

export function isChurchListed(row: Pick<ChurchesTableRow, "is_active">): boolean {
  return row.is_active !== false;
}

/** Unified verified flag: Alpha Control location verify or legacy is_verified. */
export function isChurchDirectoryVerified(
  row: Pick<ChurchesTableRow, "is_verified" | "location_verified">,
): boolean {
  return row.is_verified === true || row.location_verified === true;
}

export function mapChurchesTableRow(row: ChurchesTableRow): NormalizedChurchCore {
  return {
    id: String(row.id),
    name: normalizeChurchName(row.church_name),
    diocese: row.parish?.trim() || null,
    governorate: row.governorate?.trim() || null,
    city: row.city?.trim() || null,
    address: row.formatted_address?.trim() || null,
    phone: row.phone?.trim() || null,
    whatsapp: row.whatsapp?.trim() || null,
    coverImageUrl: coverImageFromRow(row),
    locationLat: row.latitude != null ? Number(row.latitude) : null,
    locationLng: row.longitude != null ? Number(row.longitude) : null,
    memberCount: row.members_count ?? 0,
    servantCount: row.servants_count ?? 0,
    priestName: priestNameFromRow(row),
  };
}
