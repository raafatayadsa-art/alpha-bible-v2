# Khoulagy Home Card & Screen Fix

**Date:** 2026-06-23  
**Scope:** Home card + `/kholagy` blank/blocked screen

---

## Executive Summary

Added a prominent **KholagyHomeCard** on `/home` and fixed platform-module gating that caused `/kholagy` to render blank (stale cache + loading gate). Build passes.

---

## Findings

1. **Root cause — blank `/kholagy`**
   - `PlatformModuleGate` returned `null` while modules were loading → white screen on first navigation.
   - `usePlatformModules` returned `isModuleEnabled = false` for all keys during fetch.
   - Stale `localStorage` cache (`ab:platform-modules-public`) missing the new `kholagy` key treated the module as disabled.

2. **Home visibility**
   - Khoulagy existed only in the journey carousel (`HomeJourneyDiscover`), not as a dedicated premium card like Church Directory.

3. **Data / routes**
   - Routes registered: `/kholagy/`, `/kholagy/$groupId`.
   - DB module `kholagy` enabled; `kholagy` table readable via RLS.

---

## Changes Made

| File | Change |
|------|--------|
| `src/lib/platform-modules/platform-modules-client.ts` | `mergePlatformModulesWithDefaults()` — missing keys default to enabled |
| `src/lib/platform-modules/usePlatformModules.ts` | `isModuleEnabled` uses cache immediately (no loading=false) |
| `src/lib/platform-modules/PlatformModuleGate.tsx` | Show route content while loading; redirect only when confirmed disabled |
| `src/components/home/KholagyHomeCard.tsx` | **New** premium card (purple/gold, hymn count, resume last) |
| `src/routes/home.tsx` | Insert card after Smart Context, gated by `isModuleEnabled("kholagy")` |

---

## Warnings

- Users with an old cache that explicitly disabled unknown modules are unaffected; only **missing** keys are merged as enabled.
- If platform admin disables `kholagy`, card and routes redirect to home as before.

---

## Errors

None. `npm run build` — **PASS** (exit 0).

---

## Recommendations

1. Hard-refresh or clear `ab:platform-modules-public` once if testing on a device that cached pre-kholagy state.
2. Optional: bump cache key version on future module additions to force refresh.

---

## Overall Status

**PASS**
