# Founder Dashboard — Drill Sheets, Map Restore, Settings

**Date:** 2026-06-29  
**Scope:** Drill sheet parity, remove Operational strip, health ring drill, settings button, glowing world map  
**Build:** PASS (`npm run build` · 27.15s)

---

## Executive Summary

Drill-down sheets now match reference screenshots (title, large metric, delta, chart, breakdown rows, close button). Removed **Operational · Live** sync strip. Health ring opens platform status sheet. Header settings button navigates to `/platform/settings`. Global Activity restored glowing dark **WorldMap** with country labels and top cities list.

---

## Findings

### 1. DrillSheet redesign
- Gold close button (X), drag handle, larger typography (34px value).
- Breakdown rows: label right, value left, optional hint with green/red tone.
- 14-day area charts with gold gradient fill.
- `cityRows` for global map drill city list.

### 2. Rich indicator drill data
- Users, churches, retention, DAU, countries, crash rate, comments — all match screenshot structure.
- Derived breakdowns from live dashboard totals where no analytics table exists.

### 3. Health ring → platform status
- Clicking **100%** ring opens `buildHealthDrill`: الخوادم, API, DB, notifications, crashes.

### 4. Removed Operational · Live
- `FounderSyncStrip` removed from home (entire strip including metrics row).

### 5. Settings button enabled
- Header avatar replaced with **Settings** icon → `/platform/settings`.

### 6. Glowing world map restored
- `WorldMap` enhanced: darker gradient, purple dot continents, gold glowing hotspots with country name labels (EG مصر, etc.).
- `FounderGlobalActivity` uses WorldMap (not MapLibre globe).
- Inline top cities list + title tap opens full map drill sheet.

---

## Warnings

- Map activity counts and country breakdowns are **derived/placeholder** until real analytics schema exists.
- `FounderGlobeMap.tsx` remains in repo but unused on home — safe for church-locations reuse.
- `FounderSyncStrip.tsx` file kept but unused.

---

## Errors

None. Build exit code 0.

---

## Recommendations

1. Wire real geo analytics when `platform_analytics` exists.
2. Optional: delete unused `FounderSyncStrip.tsx` / `FounderGlobeMap.tsx` in cleanup pass.
3. Manual QA: tap each indicator + health ring + map hotspots on mobile.

---

## Overall Status

**PASS**
