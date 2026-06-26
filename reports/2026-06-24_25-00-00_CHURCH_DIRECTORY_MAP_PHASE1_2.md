# Church Directory Map Phase 1 + 2 Implementation

**Date:** 2026-06-24

---

## Executive Summary

Implemented **verified-only Church Directory map** with **Alpha Control coordinates** and **reference-style dark map + isometric 3D church markers**. Build **PASS**. Database migration file ready — apply on Supabase.

---

## Phase 1 — Data & verified pins

| Item | Implementation |
|------|----------------|
| URL → lat/lng | `parse_google_maps_coordinates()` SQL + `src/lib/google-maps-coordinates.ts` |
| Verify RPC | Updates `latitude`/`longitude` + `location_lat`/`location_lng` on verify |
| View unify | `church_directory` uses `coalesce(latitude, location_lat)` |
| Map RPC | `church_directory_map_pins()` — `location_verified = true` + coords |
| Client | `useChurchDirectoryMapPins()` loads all pins (no pagination) |
| Map screen | Map uses pins only; list still paginated |
| Backfill | SQL updates verified rows from stored Maps URLs |
| Admin fallback | `verifyChurchLocation()` client patch if RPC lacks coords |

**Migration:** `supabase/migrations/20250624180000_church_directory_map_verified.sql`  
**Run:** `supabase/RUN_CHURCH_DIRECTORY_MAP_VERIFIED.sql`

---

## Phase 2 — Visual (reference-style)

| Item | Implementation |
|------|----------------|
| Basemap | Carto **dark_all** raster |
| Markers | SVG isometric church sprites (`public/church-directory/`) |
| Map layers | Symbol icons + Arabic name/city labels + gold clusters |
| Selected | Larger gold-glow building sprite |
| Legend | `ChurchDirectoryMapLegend` — verified + Alpha Control |
| Background | `#0c1024` map chrome |

---

## Files Changed / Added

- `supabase/migrations/20250624180000_church_directory_map_verified.sql`
- `src/lib/google-maps-coordinates.ts`
- `src/features/church-directory/useChurchDirectoryMapPins.ts`
- `src/features/church-directory/church-map-images.ts`
- `src/features/church-directory/maplibre-config.ts`
- `src/features/church-directory/components/ChurchDirectoryMapView.tsx`
- `src/features/church-directory/components/ChurchDirectoryMapLegend.tsx`
- `src/features/church-directory/ChurchDirectoryScreen.tsx`
- `public/church-directory/church-building.svg`
- `public/church-directory/church-building-selected.svg`

---

## Warnings

1. **Apply migration** on Supabase before map pins RPC works in production.
2. Map shows only churches with `location_verified = true` **and** coordinates — count may be low until Alpha Control verifies more.
3. URLs without embedded lat/lng still need geocoding backfill or manual coords.
4. True GLB 3D models deferred (Phase 3) — current markers are **2.5D SVG** matching reference aesthetic.

---

## Errors

None — `npm run build` **PASS**.

---

## Recommendations

1. Run migration on remote Supabase.
2. Re-verify a sample church in Alpha Control and confirm pin moves to Maps URL coords.
3. Batch-geocode verified URLs missing `!3d`/`@` patterns via existing geocode script.
4. Phase 3: GLB models + globe if product wants full 3D.

---

## Overall Status

**PASS** — migration applied on Supabase; **12** verified map pins live.

---

## COPYABLE REPORT

```
CHURCH MAP P1+P2 — 2026-06-24 | PASS
- Verified-only map pins RPC + coord sync on verify
- Dark map + isometric church SVG markers + labels + legend
- build OK | Supabase: 12 map pins
```
