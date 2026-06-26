# Church Directory Map — Phase 3 (Globe, Terrain, 3D, Network)

**Date:** 2026-06-24  
**Scope:** Phase 3 premium map — globe projection, terrain, golden network lines, procedural Three.js church models

---

## Executive Summary

Phase 3 of the Church Directory map is implemented. The map now uses **globe projection** with atmospheric fog, **raster DEM terrain**, **golden network lines** between nearby verified churches, and **procedural 3D church meshes** (MapLibre custom layer + Three.js) at close zoom. 2D isometric SVG markers fade out as 3D models appear. Selecting a church triggers a **cinematic flyTo** with pitch ~58°. Build passes.

---

## Findings

| Item | Detail |
|------|--------|
| Globe | `CHURCH_MAP_PROJECTION = "globe"`; fog tuned to Alpha dark palette |
| Terrain | MapLibre demo DEM tiles, exaggeration 1.35 |
| Network | Haversine links ≤140 km, max 2 neighbors per church |
| 3D models | Procedural mesh (body, roof, dome, cross, windows) — no GLB pipeline yet |
| 2D ↔ 3D handoff | Sprites/labels fade from zoom 12.5 → 14; 3D visible ≥ 13.5 |
| Selection | `flyToChurchCinematic` — zoom ≥16, pitch 58°, 1.4s duration |
| Dependencies | `three@^0.184.0`, `@types/three` (already installed) |

### Files added

- `src/features/church-directory/church-map-network.ts` — GeoJSON line builder
- `src/features/church-directory/church-map-3d-layer.ts` — custom layer, globe/terrain helpers, cinematic flyTo

### Files updated

- `src/features/church-directory/maplibre-config.ts` — globe, network/terrain/3D constants
- `src/features/church-directory/components/ChurchDirectoryMapView.tsx` — full Phase 3 wiring
- `src/features/church-directory/components/ChurchDirectoryMapLegend.tsx` — network + 3D legend items

---

## Warnings

1. **3D click picking:** Clicks on procedural 3D models still go through to underlying 2D symbol layers at overlapping zoom; at full 3D zoom sprites are nearly invisible — consider raycast picking in a future pass.
2. **Terrain tiles:** Demo DEM host may be slow or unavailable in some regions; production may need self-hosted or paid terrain.
3. **Network density:** With ~12 verified pins, network lines may be sparse; algorithm is ready for growth.
4. **Performance:** Three.js custom layer repaints every frame when visible; monitor on low-end mobile.
5. **Supabase Phase 1 gaps** (from prior session): verify RPC lat/lng return + coord backfill may still be pending on remote DB.

---

## Errors

None during implementation. `npm run build` — **PASS** (exit 0).

---

## Recommendations

| Priority | Action |
|----------|--------|
| Medium | Add 3D model click/hover via MapLibre query or Three.js raycaster |
| Medium | Complete Supabase verify RPC + backfill for churches missing coords |
| Low | Replace procedural mesh with shared GLB asset for art parity with reference |
| Low | Self-host terrain tiles for reliability |

---

## Overall Status

**PASS** — Phase 3 client implementation complete; build verified.

---

## COPYABLE REPORT

```
CHURCH DIRECTORY MAP — PHASE 3
Status: PASS
Build: npm run build — OK

Delivered:
- Globe projection + fog
- Terrain (MapLibre demo DEM)
- Golden network lines (≤140km, max 2/church)
- Three.js procedural 3D churches at zoom ≥13.5
- 2D sprite fade + cinematic flyTo on select
- Legend updated

Report: reports/2026-06-24_26-00-00_CHURCH_DIRECTORY_MAP_PHASE3.md
```
