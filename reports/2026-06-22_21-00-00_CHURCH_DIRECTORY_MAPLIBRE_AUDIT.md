# Church Directory MapLibre — Runtime & Wiring Audit

**Date:** 2026-06-22  
**Task:** Audit-only — verify MapLibre is actually rendered vs. “successful install” reports  
**Code changes:** None (audit only)

---

## Executive Summary

MapLibre **is correctly wired** in source and production bundles. Leaflet is **fully removed**. The current Church Directory page **does render** `ChurchDirectoryMapView` (via lazy `ChurchDirectoryMapGate`), but **the default UI is list mode**, which hides the map (`opacity-0`). The basemap tiles are **identical** to the old Leaflet setup (same Carto URLs), and markers changed from animated HTML pins to simple circles — so even in map mode the visual delta is subtle. **No Leaflet remains mounted anywhere.**

This explains why migration reports say PASS but users perceive “no visible change.”

---

## Findings

### 1. Which page/component renders when opening Church Directory?

| Entry URL | Route file | Component rendered |
|-----------|------------|-------------------|
| `/church/directory` | `src/routes/church.directory.tsx` | **`ChurchDirectoryScreen`** |
| `/churches-directory` | `src/routes/churches-directory.tsx` | **`ChurchDirectoryScreen`** (same screen) |

**Render tree (directory screen):**

```
ChurchDirectoryScreen
├── ChurchDirectoryMapGate (lazy, client-only)
│   └── ChurchDirectoryMapView  ← MapLibre GL JS (lazy chunk)
├── ChurchDirectoryListView     ← DEFAULT visible layer
├── Search + filter chrome
├── ChurchDirectoryFloatingCard (map mode + selection)
└── List / Map toggle (bottom)
```

**Other related routes (NOT the map screen):**
- `/church/directory/$placeId` → `ChurchDirectoryFullDetailView` (detail page, no map)
- `/home` → `ChurchDirectoryHomeCard` (promo card only, links to directory — **not a map**)

**Entry points in app:**
- Home card → `/church/directory`
- Church screen “دليل الكنائس والأديرة” → `/churches-directory`
- Search → `/church/directory`

Both directory URLs mount the **same** `ChurchDirectoryScreen`.

---

### 2. Is `ChurchDirectoryMapView` actually mounted?

**Yes — when `mapFailed === false`.**

```tsx
// ChurchDirectoryScreen.tsx (lines 22, 87–101)
const [viewMode, setViewMode] = useState<DirectoryViewMode>("list"); // DEFAULT = list

{!mapFailed ? (
  <div className={`absolute inset-0 ${viewMode === "list" ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
    <ChurchDirectoryMapGate ... />
  </div>
) : null}
```

Important:
- Map **is mounted in the DOM** even in list mode (hidden, not unmounted).
- Map chunk loads lazily via `React.lazy` inside `ChurchDirectoryMapGate`.
- User must tap **«الخريطة»** in the bottom toggle to **see** the map.

---

### 3. Is old Leaflet still mounted anywhere?

**No.**

| Check | Result |
|-------|--------|
| `package.json` | `leaflet`, `react-leaflet`, `leaflet.markercluster` — **removed** |
| `maplibre-gl` | **present** (`^5.24.0`) |
| Source grep (`src/`) | **zero** Leaflet imports |
| Dev module served | `ChurchDirectoryMapView.tsx` → **MAPLIBRE_FOUND**, **LEAFLET_MISSING** |
| Production lazy chunk | `dist/client/assets/ChurchDirectoryMapView-CqkP2P8X.js` (~**1.06 MB**) — contains church map layer IDs; **no leaflet string** in client assets |

Leaflet is not in the dependency tree or bundles.

---

### 4. Is MapLibre successfully initializing?

**Static/code evidence: YES, init path is correct.**

```tsx
// ChurchDirectoryMapView.tsx
const map = new maplibregl.Map({
  container,
  style: CHURCH_MAP_STYLE,  // inline StyleSpecification object
  center: [centerLng, centerLat],
  zoom: 11,
});
map.on("load", () => { addChurchLayers(map); ... });
```

**Production bundle:** separate lazy chunk `ChurchDirectoryMapView-*.js` (~1 MB) confirms MapLibre ships with the map view (MapLibre core is large; old Leaflet chunk was much smaller).

**Runtime browser verification attempted:**
- Dev server: `http://localhost:8084/church/directory` → **HTTP 200**
- Playwright screenshot audit **blocked** — Chromium binary failed to install in this environment (`npx playwright install` hung after download). **Real UI screenshots could not be captured in this session.**

**Manual verification steps (for you or QA):**
1. Open `/church/directory`
2. Open DevTools → Console
3. Tap bottom **«الخريطة»**
4. In Elements, search: `.maplibregl-canvas` or `.church-directory-map`
5. Expected: `<canvas class="maplibregl-canvas">` present; **no** `.leaflet-container`

---

### 5. Valid style URL for MapLibre?

**Not a remote style JSON URL — an inline `StyleSpecification` object (valid).**

File: `src/features/church-directory/maplibre-config.ts`

```ts
export const CHURCH_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    "carto-light": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
    },
  },
  layers: [{ id: "carto-light", type: "raster", source: "carto-light", ... }],
};
```

**Tile URL health check:** `https://a.basemaps.cartocdn.com/light_all/11/1234/851.png` → **HTTP 200**

**Note:** This is the **same Carto light basemap** the Leaflet version used. The map background will look the same.

**Likely console warning/error (non-fatal):** cluster count layer uses `text-field` but the inline style defines **no `glyphs` URL**. MapLibre may log glyph/text errors; **purple cluster circles should still render**, but numeric labels inside clusters may be missing.

---

### 6. Expected runtime console messages

| Severity | Likely message | Impact |
|----------|----------------|--------|
| Warning/Error | Missing glyphs / unable to render `church-cluster-count` text | Cluster **circles** OK; **numbers** may be absent |
| Info | Supabase RPC errors if offline | List empty; map still loads |
| Error | WebGL unavailable (rare old devices) | `MapErrorBoundary` → «تعذّر تحميل الخريطة», forced list mode |

No evidence of Leaflet Strict Mode double-init errors (previous Leaflet issue) — that path is gone.

---

## Why there is no visible change

### Primary reasons (ordered by impact)

1. **Default view is LIST, not map**  
   Opening Church Directory shows `ChurchDirectoryListView` on a beige background. The map exists but is `opacity-0` until the user switches tabs.

2. **Identical basemap tiles**  
   Leaflet and MapLibre both use Carto `light_all` PNG tiles → same roads, colors, labels.

3. **Marker visual change is subtle**  
   - **Before (Leaflet):** animated HTML shield pins with halo  
   - **After (MapLibre):** flat purple/gold **circle** layers  
   Difference only visible in **map mode**, and easy to miss without side-by-side comparison.

4. **Home screen card is not the map**  
   `ChurchDirectoryHomeCard` on `/home` is a link card only. Installing MapLibre does not change the home screen appearance.

5. **Possible stale deploy**  
   If testing a hosted build not redeployed after migration, the live site may still serve an older bundle. Local dev/source and latest `npm run build` output include MapLibre.

---

## Screenshots

**Not available from this audit session.** Playwright Chromium could not be installed (sandbox download stalled).  

To obtain proof locally in ~30 seconds:
- Switch to map mode → screenshot showing Carto basemap + purple cluster circles
- DevTools screenshot of DOM: `canvas.maplibregl-canvas`

Audit helper script (optional, already in repo): `reports/audit-maplibre-runtime.mjs` — run after `npx playwright install chromium`.

---

## Warnings

- Cluster count labels may fail silently due to missing `glyphs` in style spec.
- Two URLs (`/church/directory` vs `/churches-directory`) can confuse testing but render the same screen.
- Map hidden in list mode can look like “map not working” during casual testing.

---

## Errors

- Playwright runtime audit: **blocked** (browser binary unavailable).
- No code defects found that would prevent MapLibre from mounting when map tab is selected.

---

## Recommendations (for a future fix pass — not applied in this audit)

1. Default `viewMode` to `"map"` or show a visible “open map” affordance on first visit.
2. Add `glyphs` to `CHURCH_MAP_STYLE` (or remove text layer and rely on circle size/color only).
3. Differentiate markers visually (custom symbol/icon) so migration is obvious.
4. Redeploy if testing production URL.
5. Unify entry links to one canonical path (`/church/directory`).

---

## Overall Status

**PARTIAL** — Wiring and bundle audit **PASS**; visual/runtime proof **PARTIAL** (screenshots blocked; user must toggle map mode to see MapLibre).
