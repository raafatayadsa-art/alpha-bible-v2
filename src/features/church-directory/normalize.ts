export function normalizeDirectoryName(raw: string | null | undefined): string {
  return (raw ?? "").replace(/\s*\n+\s*/g, " ").replace(/\s+/g, " ").trim();
}

export function directoryLocationLine(row: {
  city?: string | null;
  governorate?: string | null;
  country?: string | null;
}): string {
  return [row.city, row.governorate, row.country ?? "مصر"].filter(Boolean).join(" · ");
}

export function formatDistanceKm(km: number | null | undefined): string | null {
  if (km == null || Number.isNaN(km)) return null;
  if (km < 1) return `${Math.round(km * 1000).toLocaleString("ar-EG")} م`;
  return `${km.toFixed(km < 10 ? 1 : 0).toLocaleString("ar-EG")} كم`;
}

export function directionsUrlForRow(row: {
  name: string;
  lat: number | null;
  lng: number | null;
  city?: string | null;
  governorate?: string | null;
  verifiedLocationUrl?: string | null;
}): string {
  const verified = row.verifiedLocationUrl?.trim();
  if (verified) return verified;
  if (row.lat != null && row.lng != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${row.lat},${row.lng}`;
  }
  const label = [row.name, row.city, row.governorate, "مصر"].filter(Boolean).join("، ");
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(label)}`;
}

export function shareUrlForChurch(id: string): string {
  if (typeof window === "undefined") return `/church/directory/${id}`;
  return `${window.location.origin}/church/directory/${id}`;
}
