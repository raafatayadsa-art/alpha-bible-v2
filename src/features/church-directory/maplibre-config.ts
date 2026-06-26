import type { StyleSpecification } from "maplibre-gl";
import { CHURCH_DIR } from "./tokens";

/** Globe projection + terrain enabled in Phase 3. */
export type ChurchMapProjection = "mercator" | "globe";

export const CHURCH_MAP_PROJECTION: ChurchMapProjection = "globe";

export const CHURCH_MAP_SOURCE_ID = "church-directory-churches";
export const CHURCH_MAP_USER_SOURCE_ID = "church-directory-user";
export const CHURCH_MAP_NETWORK_SOURCE_ID = "church-directory-network";
export const CHURCH_MAP_TERRAIN_SOURCE_ID = "church-terrain";

export const CHURCH_MAP_IMAGES = {
  building: "church-building",
  buildingSelected: "church-building-selected",
} as const;

export const CHURCH_MAP_ASSETS = {
  building: "/church-directory/church-building.svg",
  buildingSelected: "/church-directory/church-building-selected.svg",
} as const;

export const CHURCH_MAP_LAYERS = {
  networkGlow: "church-network-glow",
  network: "church-network",
  clusters: "church-clusters",
  clusterCount: "church-cluster-count",
  unclustered: "church-unclustered",
  unclusteredSelected: "church-unclustered-selected",
  labels: "church-labels",
  labelsSelected: "church-labels-selected",
  userPulse: "church-user-pulse",
  userDot: "church-user-dot",
} as const;

export const CHURCH_MAP_STYLE_LIGHT = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";
export const CHURCH_MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export function applyCustomMapColors(map: import("maplibre-gl").Map, theme: "light" | "dark") {
  const isDark = theme === "dark";
  
  const setPaint = (layerId: string, prop: string, value: any) => {
    if (map.getLayer(layerId)) {
      map.setPaintProperty(layerId, prop, value);
    }
  };

  // Water
  const waterColor = isDark ? "#092e59" : "#a5cbf0";
  setPaint("water", "fill-color", waterColor);
  setPaint("waterway", "line-color", waterColor);
  
  // Landcover (Agriculture/Parks)
  const landColor = isDark ? "#0b2412" : "#cde6c5";
  setPaint("landcover", "fill-color", landColor);
  setPaint("park_national_park", "fill-color", landColor);
  setPaint("park_nature_reserve", "fill-color", landColor);

  // Roads
  const roadFill = isDark ? "#d4af37" : "#ffffff"; // Gold in dark, white in light
  const roadCase = isDark ? "#8a6e00" : "#d1d1d1"; // Dark gold in dark, gray in light
  
  const roadLayersFill = [
    "road_service_fill", "road_minor_fill", "road_pri_fill_ramp", "road_trunk_fill_ramp", 
    "road_mot_fill_ramp", "road_sec_fill_noramp", "road_pri_fill_noramp", 
    "road_trunk_fill_noramp", "road_mot_fill_noramp", "road_path"
  ];
  const roadLayersCase = [
    "road_service_case", "road_minor_case", "road_pri_case_ramp", "road_trunk_case_ramp", 
    "road_mot_case_ramp", "road_sec_case_noramp", "road_pri_case_noramp", 
    "road_trunk_case_noramp", "road_mot_case_noramp"
  ];

  for (const l of roadLayersFill) {
    setPaint(l, "line-color", roadFill);
    if (isDark) {
       setPaint(l, "line-opacity", 0.8);
    }
  }
  for (const l of roadLayersCase) {
    setPaint(l, "line-color", roadCase);
    if (isDark) {
       setPaint(l, "line-opacity", 0.5);
    }
  }

  // Text colors
  const textColor = isDark ? "#ffffff" : "#333333";
  const textHalo = isDark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)";
  
  const textLayers = [
    "place_continent", "place_country", "place_state", "place_city", "place_town", 
    "place_village", "place_neighborhood", "roadname_minor", "roadname_sec", 
    "roadname_pri", "roadname_major", "watername_ocean", "watername_sea", 
    "watername_lake", "watername_lake_line", "poi_label"
  ];

  for (const l of textLayers) {
    setPaint(l, "text-color", textColor);
    setPaint(l, "text-halo-color", textHalo);
    setPaint(l, "text-halo-width", 1.5);
  }
}

export const CHURCH_CLUSTER_PAINT = {
  small: CHURCH_DIR.purple,
  medium: "#7b4cb8",
  large: "#3d2066",
} as const;

export const CHURCH_MAP_LABEL_FONT = ["Open Sans Regular", "Noto Sans Regular"] as const;
