import type { ChurchSetupFormData } from "./types";

export function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

const ZOOM_PADS = [0.003, 0.006, 0.01, 0.016, 0.026] as const;
const DEFAULT_ZOOM_INDEX = 2;

export function openStreetMapEmbedUrl(lat: number, lng: number, zoomIndex = DEFAULT_ZOOM_INDEX): string {
  const idx = Math.max(0, Math.min(zoomIndex, ZOOM_PADS.length - 1));
  const pad = ZOOM_PADS[idx];
  const bbox = `${lng - pad},${lat - pad},${lng + pad},${lat + pad}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function parseLocationDisplay(label: string): { city: string; governorate: string } {
  const parts = label.split(" - ").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { city: parts[0], governorate: parts.slice(1).join(" - ") };
  }
  if (parts.length === 1) {
    return { city: parts[0], governorate: "" };
  }
  return { city: "", governorate: "" };
}

export function hasChurchLocation(
  form: Pick<ChurchSetupFormData, "latitude" | "longitude">,
): boolean {
  return typeof form.latitude === "number" && typeof form.longitude === "number";
}

export function formatCoord(value: number): string {
  return value.toFixed(6);
}

type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
  county?: string;
  state?: string;
  region?: string;
  country?: string;
};

export async function resolveLocationLabel(lat: number, lng: number): Promise<string> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("format", "json");
    url.searchParams.set("accept-language", "ar");

    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "Accept-Language": "ar",
      },
    });
    if (!res.ok) throw new Error("reverse geocode failed");

    const data = (await res.json()) as {
      display_name?: string;
      address?: NominatimAddress;
    };
    const a = data.address ?? {};
    const city = a.city || a.town || a.village || a.suburb || a.county;
    const region = a.state || a.region || a.country;

    if (city && region) return `${city} - ${region}`;
    if (city) return city;
    if (region) return region;
    if (data.display_name) {
      const parts = data.display_name.split(",").map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) return `${parts[0]} - ${parts[1]}`;
      return parts[0] ?? "موقع محدد على الخريطة";
    }
    return "موقع محدد على الخريطة";
  } catch {
    return "موقع محدد على الخريطة";
  }
}
