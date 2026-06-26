# Church Directory — MapLibre GL JS Migration

**Date:** 2026-06-22  
**Task:** Replace Leaflet with official `maplibre-gl` for church directory map screen

---

## Executive Summary

Installed **MapLibre GL JS** and rewrote the church directory map (`ChurchDirectoryMapView`) to use MapLibre instead of Leaflet/react-leaflet. All required features are preserved: user location, church markers, search-driven data sync, clustering, and a configurable projection flag for future globe mode. Leaflet packages were removed. Production build passes.

---

## Findings

### Package changes
- **Added:** `maplibre-gl` (official npm package)
- **Removed:** `leaflet`, `leaflet.markercluster`, `react-leaflet`, `@types/leaflet`, `@types/leaflet.markercluster`

### New / updated files
| File | Change |
|------|--------|
| `src/features/church-directory/maplibre-config.ts` | Map style (Carto light raster), layer IDs, cluster colors, `CHURCH_MAP_PROJECTION` |
| `src/features/church-directory/components/ChurchDirectoryMapView.tsx` | Full MapLibre implementation |
| `src/features/church-directory/church-directory-map.css` | MapLibre container styles |
| `src/features/church-directory/index.ts` | Export `CHURCH_MAP_PROJECTION` |
| `vite.config.ts` | `optimizeDeps.include: ["maplibre-gl"]` |

### Feature mapping

| Requirement | Implementation |
|-------------|----------------|
| **User location** | GeoJSON source `church-directory-user` with pulse + dot circle layers; synced from `userLat`/`userLng` props |
| **Church markers** | GeoJSON source with unclustered circle layers (purple/gold Alpha styling); selected state via `selected` property filter |
| **Search support** | Screen search/filters update `rows` → map receives new `churches` prop → GeoJSON `setData()` refresh |
| **Clustering** | Built-in MapLibre GeoJSON clustering (`clusterMaxZoom: 14`, `clusterRadius: 52`); click expands cluster |
| **Future globe** | `CHURCH_MAP_PROJECTION` in `maplibre-config.ts` — set to `"globe"` to enable `map.setProjection({ type: "globe" })` |

### Unchanged
- `ChurchDirectoryMapGate.tsx` — lazy load + error boundary (still valid)
- `ChurchDirectoryScreen.tsx` — search, filters, list/map toggle unchanged

---

## Warnings

- Cluster count labels use generic fonts (`Open Sans Bold`) — may fall back on some devices; counts still visible via circle size.
- Globe mode is **off by default** (`mercator`); enable when product-ready.
- Carto raster tiles require network; offline not supported.

---

## Errors

None. `npm run build` — **PASS**.

---

## Recommendations

1. Manual QA: map view, cluster tap-to-expand, church tap → floating card, locate button, search filter → marker refresh.
2. When enabling globe: set `CHURCH_MAP_PROJECTION = "globe"` and add UI toggle + atmosphere/sky layer if desired.
3. Consider vector style (MapTiler/OpenFreeMap) for sharper labels at high zoom.

---

## Overall Status

**PASS**
