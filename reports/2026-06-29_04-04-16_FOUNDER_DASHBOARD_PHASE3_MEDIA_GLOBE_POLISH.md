# Founder Dashboard — Phase 3: Media Badge + Globe Polish

**Date:** 2026-06-29  
**Scope:** Media stats lift, module badges, globe pin counts, attention/insights polish  
**Build:** PASS (`npm run build` · 25.15s)

---

## Executive Summary

Phase 3 wires **Media Manager** stats from the parent shell into the dashboard and module grid, adds live **church pin counts** on the globe map, and polishes attention/insights sections with 3D icons and larger typography. Build verified successfully.

---

## Findings

### 1. Media stats lifted to `AlphaMissionControl`
- `useFounderMediaStats(mediaReloadKey)` runs in parent.
- Props passed to `FounderMissionControlHome`: `mediaStats`, `mediaLoading`, `onMediaReload`.
- Single source of truth for pending media across header tools, attention list, insights, and module cards.

### 2. Media Manager module card
- `buildFounderModules(dash, mediaStats)` adds:
  - Gold badge when pending > 0 (vs red for other modules).
  - Metrics: Pending / Approved counts.
- Badge uses `module.to.includes("media")` for gold styling in `FounderModuleGrid`.

### 3. Globe map pin badge
- `FounderGlobeMap`: overlay badge `{N} كنيسة` (top-left, gold border, blur backdrop).
- Optional `showPinBadge` prop (default true).
- Loading state: Arabic placeholder «جاري تحميل خريطة الكنائس…».

### 4. Global Activity improvements
- Map **expanded by default** (`useState(true)`).
- Heights: 320px expanded · 220px collapsed.
- Header subtitle: live pin count + «Globe 3D».
- Third stat column: «على الخريطة» uses real `pins.length` (replaces static HOTSPOTS).
- Pin tap opens `DrillSheet` with church name, city, governorate.

### 5. Attention + Smart Insights polish
- `FounderAttentionList`: 3D icons, larger text, media-aware items via `buildAttentionItems`.
- `FounderSmartInsights`: media-aware second card when pending > 0; Brain icon via `FounderIcon3D`.

### 6. Quick Tools + Welcome
- Quick Tools: `mediaPending` badge on media route; reports → library; words → ai.
- Welcome card summary uses live users/churches/health from dash.

---

## Warnings

- `WorldMap.tsx` (dot-grid) is **unused** — safe to remove in a future cleanup pass; not deleted to minimize scope.
- Feature usage, growth trends, and some indicator deltas remain **derived** from dashboard totals (no `platform_analytics` table yet).
- MapLibre globe requires client-side load + network for Carto tiles.
- Smart Insights CTAs link to existing modules only (no real AI/campaign backend).

---

## Errors

None. Build completed with exit code 0.

---

## Recommendations

1. Add pending badge to **content-review** module card if it shares media queue.
2. Show map pin count on **Church Locations** module card for parity.
3. Remove dead `WorldMap.tsx` after confirming no external imports.
4. Wire real analytics when schema exists.
5. Manual QA on mobile: 2-col module grid, map height toggle, sticky section nav.

---

## Overall Status

**PASS**
