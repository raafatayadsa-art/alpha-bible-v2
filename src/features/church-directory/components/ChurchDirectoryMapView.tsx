import { useEffect, useMemo, useRef } from "react";
import maplibregl, { type GeoJSONSource, type Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  flyToChurchCinematic,
  setupChurchMapGlobe,
  setupChurchMapTerrain,
} from "../church-map-3d-layer";
import { registerChurchMapImages } from "../church-map-images";
import { buildChurchNetworkGeoJson } from "../church-map-network";
import type { ChurchDirectoryMapPin } from "../types";
import { DEFAULT_MAP_CENTER, CHURCH_DIR } from "../tokens";
import {
  CHURCH_CLUSTER_PAINT,
  CHURCH_MAP_IMAGES,
  CHURCH_MAP_LABEL_FONT,
  CHURCH_MAP_LAYERS,
  CHURCH_MAP_NETWORK_SOURCE_ID,
  CHURCH_MAP_PROJECTION,
  CHURCH_MAP_SOURCE_ID,
  CHURCH_MAP_STYLE,
  CHURCH_MAP_STYLE_LIGHT,
  CHURCH_MAP_USER_SOURCE_ID,
  applyCustomMapColors,
} from "../maplibre-config";
import "../church-directory-map.css";

type Props = {
  churches: ChurchDirectoryMapPin[];
  selectedId: string | null;
  userLat: number | null;
  userLng: number | null;
  onSelect: (row: ChurchDirectoryMapPin) => void;
  className?: string;
  mapTheme?: "light" | "dark";
};

function churchesToGeoJson(
  churches: ChurchDirectoryMapPin[],
  selectedId: string | null,
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: churches.map((c) => ({
      type: "Feature",
      properties: {
        id: c.id,
        name: c.name,
        city: c.city ?? "",
        selected: c.id === selectedId ? 1 : 0,
      },
      geometry: {
        type: "Point",
        coordinates: [c.lng, c.lat],
      },
    })),
  };
}

function userLocationGeoJson(lat: number, lng: number): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: { type: "Point", coordinates: [lng, lat] },
      },
    ],
  };
}

function addNetworkLayers(map: MapLibreMap) {
  map.addSource(CHURCH_MAP_NETWORK_SOURCE_ID, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });

  map.addLayer({
    id: CHURCH_MAP_LAYERS.networkGlow,
    type: "line",
    source: CHURCH_MAP_NETWORK_SOURCE_ID,
    paint: {
      "line-color": CHURCH_DIR.gold,
      "line-width": 4,
      "line-opacity": 0.12,
      "line-blur": 2.5,
    },
  });

  map.addLayer({
    id: CHURCH_MAP_LAYERS.network,
    type: "line",
    source: CHURCH_MAP_NETWORK_SOURCE_ID,
    paint: {
      "line-color": CHURCH_DIR.gold,
      "line-width": 1.2,
      "line-opacity": 0.42,
    },
  });
}

function addChurchLayers(map: MapLibreMap) {
  map.addSource(CHURCH_MAP_SOURCE_ID, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 54,
  });

  map.addLayer({
    id: CHURCH_MAP_LAYERS.clusters,
    type: "circle",
    source: CHURCH_MAP_SOURCE_ID,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        CHURCH_CLUSTER_PAINT.small,
        8,
        CHURCH_CLUSTER_PAINT.medium,
        24,
        CHURCH_CLUSTER_PAINT.large,
      ],
      "circle-radius": ["step", ["get", "point_count"], 20, 8, 24, 24, 30],
      "circle-stroke-width": 2.5,
      "circle-stroke-color": CHURCH_DIR.gold,
      "circle-opacity": 0.94,
    },
  });

  map.addLayer({
    id: CHURCH_MAP_LAYERS.clusterCount,
    type: "symbol",
    source: CHURCH_MAP_SOURCE_ID,
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": [...CHURCH_MAP_LABEL_FONT],
      "text-size": 12,
    },
    paint: {
      "text-color": CHURCH_DIR.beige,
    },
  });

  map.addLayer({
    id: CHURCH_MAP_LAYERS.unclustered,
    type: "symbol",
    source: CHURCH_MAP_SOURCE_ID,
    filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "selected"], 0]],
    layout: {
      "icon-image": CHURCH_MAP_IMAGES.building,
      "icon-size": ["interpolate", ["linear"], ["zoom"], 8, 0.45, 12, 0.62, 16, 0.82],
      "icon-anchor": "bottom",
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
    },
  });

  map.addLayer({
    id: CHURCH_MAP_LAYERS.unclusteredSelected,
    type: "symbol",
    source: CHURCH_MAP_SOURCE_ID,
    filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "selected"], 1]],
    layout: {
      "icon-image": CHURCH_MAP_IMAGES.buildingSelected,
      "icon-size": ["interpolate", ["linear"], ["zoom"], 8, 0.55, 12, 0.78, 16, 1],
      "icon-anchor": "bottom",
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
    },
  });

  const labelLayout = {
    "text-field": ["format", ["get", "name"], { "font-scale": 1 }, "\n", {}, ["get", "city"], { "font-scale": 0.85 }],
    "text-font": [...CHURCH_MAP_LABEL_FONT],
    "text-size": 11,
    "text-anchor": "top" as const,
    "text-offset": [0, 0.15],
    "text-allow-overlap": false,
    "text-optional": true,
    "text-max-width": 12,
  };

  map.addLayer({
    id: CHURCH_MAP_LAYERS.labels,
    type: "symbol",
    source: CHURCH_MAP_SOURCE_ID,
    filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "selected"], 0]],
    layout: labelLayout,
    paint: {
      "text-color": "#F5F2ED",
      "text-halo-color": "rgba(12, 16, 36, 0.88)",
      "text-halo-width": 1.4,
    },
  });

  map.addLayer({
    id: CHURCH_MAP_LAYERS.labelsSelected,
    type: "symbol",
    source: CHURCH_MAP_SOURCE_ID,
    filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "selected"], 1]],
    layout: {
      ...labelLayout,
      "text-size": 12,
      "text-offset": [0, 0.2],
    },
    paint: {
      "text-color": "#FFF6DC",
      "text-halo-color": "rgba(212, 175, 55, 0.55)",
      "text-halo-width": 1.8,
    },
  });

  map.addSource(CHURCH_MAP_USER_SOURCE_ID, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });

  map.addLayer({
    id: CHURCH_MAP_LAYERS.userPulse,
    type: "circle",
    source: CHURCH_MAP_USER_SOURCE_ID,
    paint: {
      "circle-radius": 18,
      "circle-color": "rgba(59, 130, 246, 0.22)",
      "circle-stroke-width": 0,
    },
  });

  map.addLayer({
    id: CHURCH_MAP_LAYERS.userDot,
    type: "circle",
    source: CHURCH_MAP_USER_SOURCE_ID,
    paint: {
      "circle-radius": 6,
      "circle-color": "#60a5fa",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });
}

export function ChurchDirectoryMapView({
  churches,
  selectedId,
  userLat,
  userLng,
  onSelect,
  className,
  mapTheme = "light",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const churchIndexRef = useRef<Map<string, ChurchDirectoryMapPin>>(new Map());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const geoJson = useMemo(
    () => churchesToGeoJson(churches, selectedId),
    [churches, selectedId],
  );
  const networkGeoJson = useMemo(() => buildChurchNetworkGeoJson(churches), [churches]);
  const geoJsonRef = useRef(geoJson);
  geoJsonRef.current = geoJson;
  const networkGeoJsonRef = useRef(networkGeoJson);
  networkGeoJsonRef.current = networkGeoJson;
  const churchesRef = useRef(churches);
  churchesRef.current = churches;
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  const userCoordsRef = useRef({ lat: userLat, lng: userLng });
  userCoordsRef.current = { lat: userLat, lng: userLng };

  useEffect(() => {
    churchIndexRef.current = new Map(churches.map((c) => [c.id, c]));
  }, [churches]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const centerLng = userLng ?? DEFAULT_MAP_CENTER.lng;
    const centerLat = userLat ?? DEFAULT_MAP_CENTER.lat;

    const map = new maplibregl.Map({
      container,
      style: mapTheme === "dark" ? CHURCH_MAP_STYLE : CHURCH_MAP_STYLE_LIGHT,
      center: [centerLng, centerLat],
      zoom: churches.length === 1 ? 14 : 10,
      attributionControl: false,
      cooperativeGestures: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      void (async () => {
        if (CHURCH_MAP_PROJECTION === "globe") {
          setupChurchMapGlobe(map);
        }

        applyCustomMapColors(map, mapTheme);
        setupChurchMapTerrain(map);
        addNetworkLayers(map);

        try {
          await registerChurchMapImages(map);
        } catch (error) {
          console.error("[ChurchDirectoryMap] marker images", error);
        }

        addChurchLayers(map);

        const pickChurch = (feature: GeoJSON.Feature) => {
          const id = feature.properties?.id;
          if (typeof id !== "string") return;
          const row = churchIndexRef.current.get(id);
          if (row) onSelectRef.current(row);
        };

        map.on("click", CHURCH_MAP_LAYERS.clusters, (e) => {
          const feature = e.features?.[0];
          if (!feature || feature.geometry.type !== "Point") return;
          const clusterId = feature.properties?.cluster_id;
          const source = map.getSource(CHURCH_MAP_SOURCE_ID) as GeoJSONSource | undefined;
          if (clusterId == null || !source) return;
          source.getClusterExpansionZoom(Number(clusterId), (err, zoom) => {
            const currentZoom = map.getZoom();
            const targetZoom = Math.max(zoom || currentZoom + 2, currentZoom + 2);
            map.easeTo({
              center: feature.geometry.coordinates as [number, number],
              zoom: targetZoom,
              duration: 500,
            });
          });
        });

        const pickLayers = [
          CHURCH_MAP_LAYERS.unclustered,
          CHURCH_MAP_LAYERS.unclusteredSelected,
          CHURCH_MAP_LAYERS.labels,
          CHURCH_MAP_LAYERS.labelsSelected,
        ];

        for (const layerId of pickLayers) {
          map.on("click", layerId, (e) => {
            const feature = e.features?.[0];
            if (feature) pickChurch(feature);
          });
          map.on("mouseenter", layerId, () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", layerId, () => {
            map.getCanvas().style.cursor = "";
          });
        }

        map.on("mouseenter", CHURCH_MAP_LAYERS.clusters, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", CHURCH_MAP_LAYERS.clusters, () => {
          map.getCanvas().style.cursor = "";
        });

        const source = map.getSource(CHURCH_MAP_SOURCE_ID) as GeoJSONSource | undefined;
        source?.setData(geoJsonRef.current);

        const networkSource = map.getSource(CHURCH_MAP_NETWORK_SOURCE_ID) as GeoJSONSource | undefined;
        networkSource?.setData(networkGeoJsonRef.current);

        const { lat, lng } = userCoordsRef.current;
        if (lat != null && lng != null) {
          const userSource = map.getSource(CHURCH_MAP_USER_SOURCE_ID) as GeoJSONSource | undefined;
          userSource?.setData(userLocationGeoJson(lat, lng));
        }

        if (churches.length > 1) {
          const bounds = new maplibregl.LngLatBounds();
          for (const c of churches) {
            bounds.extend([c.lng, c.lat]);
          }
          map.fitBounds(bounds, { padding: 72, maxZoom: 13, duration: 0 });
        }

        window.setTimeout(() => map.resize(), 120);
      })();
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map init once per mount
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    const source = map.getSource(CHURCH_MAP_SOURCE_ID) as GeoJSONSource | undefined;
    source?.setData(geoJson);
  }, [geoJson]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    const networkSource = map.getSource(CHURCH_MAP_NETWORK_SOURCE_ID) as GeoJSONSource | undefined;
    networkSource?.setData(networkGeoJson);
  }, [networkGeoJson]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    const userSource = map.getSource(CHURCH_MAP_USER_SOURCE_ID) as GeoJSONSource | undefined;
    if (userLat != null && userLng != null) {
      userSource?.setData(userLocationGeoJson(userLat, userLng));
    } else {
      userSource?.setData({ type: "FeatureCollection", features: [] });
    }
  }, [userLat, userLng]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    const selected = churches.find((c) => c.id === selectedId);
    if (!selected) return;
    flyToChurchCinematic(map, selected.lng, selected.lat);
  }, [selectedId, churches]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded() || churches.length === 0) return;

    if (churches.length === 1) {
      const only = churches[0]!;
      map.easeTo({ center: [only.lng, only.lat], zoom: 14, duration: 600 });
      return;
    }

    const bounds = new maplibregl.LngLatBounds();
    for (const c of churches) {
      bounds.extend([c.lng, c.lat]);
    }
    map.fitBounds(bounds, { padding: 72, maxZoom: 13, duration: 600 });
  }, [churches]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const onResize = () => map.resize();
    window.addEventListener("resize", onResize);
    const t = window.setTimeout(() => map.resize(), 120);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`church-directory-map maplibregl-map h-full w-full ${className ?? ""}`}
      aria-label="خريطة الكنائس الموثّقة"
    />
  );
}
