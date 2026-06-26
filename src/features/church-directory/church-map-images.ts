import type { Map as MapLibreMap } from "maplibre-gl";
import { CHURCH_MAP_ASSETS, CHURCH_MAP_IMAGES } from "./maplibre-config";

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load map image: ${url}`));
    img.src = url;
  });
}

/** Register isometric church marker sprites on the map. */
export async function registerChurchMapImages(map: MapLibreMap): Promise<void> {
  const [normal, selected] = await Promise.all([
    loadImageElement(CHURCH_MAP_ASSETS.building),
    loadImageElement(CHURCH_MAP_ASSETS.buildingSelected),
  ]);

  if (!map.hasImage(CHURCH_MAP_IMAGES.building)) {
    map.addImage(CHURCH_MAP_IMAGES.building, normal, { pixelRatio: 2 });
  }
  if (!map.hasImage(CHURCH_MAP_IMAGES.buildingSelected)) {
    map.addImage(CHURCH_MAP_IMAGES.buildingSelected, selected, { pixelRatio: 2 });
  }
}
