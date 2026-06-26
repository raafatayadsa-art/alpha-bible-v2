import { type Map as MapLibreMap } from "maplibre-gl";
import { CHURCH_MAP_TERRAIN_SOURCE_ID } from "./maplibre-config";

export function setupChurchMapGlobe(map: any) {
  map.setProjection({ type: "globe" });
  map.setFog({
    color: "rgb(12, 16, 36)",
    "high-color": "rgb(138, 110, 193)",
    "horizon-blend": 0.08,
    "space-color": "rgb(8, 10, 24)",
    "star-intensity": 0.42,
  });
}

export function setupChurchMapTerrain(map: MapLibreMap) {
  if (map.getSource(CHURCH_MAP_TERRAIN_SOURCE_ID)) return;
  map.addSource(CHURCH_MAP_TERRAIN_SOURCE_ID, {
    type: "raster-dem",
    url: "https://demotiles.maplibre.org/terrain-tiles/tiles.json",
    tileSize: 256,
  });
  map.setTerrain({ source: CHURCH_MAP_TERRAIN_SOURCE_ID, exaggeration: 1.35 });
}

export function flyToChurchCinematic(map: MapLibreMap, lng: number, lat: number) {
  map.flyTo({
    center: [lng, lat],
    zoom: Math.max(map.getZoom(), 16),
    pitch: 58,
    bearing: map.getBearing(),
    duration: 1400,
    essential: true,
  });
}
