import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { normalizeDirectoryName } from "./normalize";
import type { ChurchDirectoryMapPin } from "./types";

type MapPinRow = {
  id: number | string;
  church_name: string;
  patron_saint: string | null;
  city: string | null;
  governorate: string | null;
  latitude: number | null;
  longitude: number | null;
};

function mapPinRow(row: MapPinRow): ChurchDirectoryMapPin {
  return {
    id: String(row.id),
    name: normalizeDirectoryName(row.church_name),
    patronSaint: row.patron_saint?.trim() || null,
    city: row.city?.trim() || null,
    governorate: row.governorate?.trim() || null,
    lat: row.latitude != null ? Number(row.latitude) : null,
    lng: row.longitude != null ? Number(row.longitude) : null,
  };
}

/** All Alpha Control verified churches with coordinates — for map only. */
export async function fetchChurchDirectoryMapPins(): Promise<ChurchDirectoryMapPin[]> {
  const { data, error } = await supabase.rpc("church_directory_map_pins");

  if (error) {
    console.error("[fetchChurchDirectoryMapPins]", error);
    return [];
  }

  return ((data ?? []) as MapPinRow[])
    .map(mapPinRow)
    .filter((p) => p.lat != null && p.lng != null);
}

export const churchDirectoryMapPinsQueryOptions = () =>
  queryOptions({
    queryKey: ["church-directory", "map-pins"],
    queryFn: fetchChurchDirectoryMapPins,
    staleTime: 1000 * 60 * 5,
  });

export function useChurchDirectoryMapPins() {
  return useQuery(churchDirectoryMapPinsQueryOptions());
}

export function mapPinToDirectoryRow(pin: ChurchDirectoryMapPin) {
  return {
    id: pin.id,
    name: pin.name,
    patronSaint: pin.patronSaint,
    city: pin.city,
    governorate: pin.governorate,
    country: null,
    logoUrl: null,
    isVerified: true,
    lat: pin.lat,
    lng: pin.lng,
    distanceKm: null,
  };
}
