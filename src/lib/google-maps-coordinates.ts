export type GoogleMapsCoordinates = {
  lat: number;
  lng: number;
  source: "3d4d" | "at" | "query" | "ll";
};

function parsePair(a: string, b: string): GoogleMapsCoordinates | null {
  const lat = Number.parseFloat(a);
  const lng = Number.parseFloat(b);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng, source: "at" };
}

/** Extract lat/lng from a Google Maps URL (no HTTP — string heuristics only). */
export function parseGoogleMapsCoordinates(raw: string | null | undefined): GoogleMapsCoordinates | null {
  const url = raw?.trim();
  if (!url) return null;

  const d4 = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/i);
  if (d4) {
    const pair = parsePair(d4[1]!, d4[2]!);
    if (pair) return { ...pair, source: "3d4d" };
  }

  const at = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i);
  if (at) {
    const pair = parsePair(at[1]!, at[2]!);
    if (pair) return { ...pair, source: "at" };
  }

  const q = url.match(/[?&](?:q|query)=(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/i);
  if (q) {
    const pair = parsePair(q[1]!, q[2]!);
    if (pair) return { ...pair, source: "query" };
  }

  const ll = url.match(/[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i);
  if (ll) {
    const pair = parsePair(ll[1]!, ll[2]!);
    if (pair) return { ...pair, source: "ll" };
  }

  return null;
}
