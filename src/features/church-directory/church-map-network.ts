import type { ChurchDirectoryMapPin } from "./types";

const EARTH_RADIUS_KM = 6371;
const MAX_LINK_KM = 140;
const MAX_LINKS_PER_CHURCH = 2;

function haversineKm(a: ChurchDirectoryMapPin, b: ChurchDirectoryMapPin): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Golden network lines between nearby verified churches (reference map aesthetic). */
export function buildChurchNetworkGeoJson(
  churches: ChurchDirectoryMapPin[],
): GeoJSON.FeatureCollection {
  if (churches.length < 2) {
    return { type: "FeatureCollection", features: [] };
  }

  const used = new Set<string>();
  const features: GeoJSON.Feature[] = [];

  for (const origin of churches) {
    const neighbors = churches
      .filter((c) => c.id !== origin.id)
      .map((c) => ({ c, km: haversineKm(origin, c) }))
      .filter((n) => n.km <= MAX_LINK_KM)
      .sort((a, b) => a.km - b.km)
      .slice(0, MAX_LINKS_PER_CHURCH);

    for (const { c } of neighbors) {
      const key = [origin.id, c.id].sort().join(":");
      if (used.has(key)) continue;
      used.add(key);
      features.push({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [origin.lng, origin.lat],
            [c.lng, c.lat],
          ],
        },
      });
    }
  }

  return { type: "FeatureCollection", features };
}
