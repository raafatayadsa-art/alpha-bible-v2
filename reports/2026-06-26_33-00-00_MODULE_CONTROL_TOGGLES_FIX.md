# Module Control Toggles Visibility Fix

**Date:** 2026-06-26  
**Scope:** `/platform/modules` — إدارة الموديولات في Alpha Control (Platform)

---

## Executive Summary

Fixed missing/invisible module toggles in **إدارة الموديولات** by merging cached/DB module lists with shipped defaults (including `audio`, `kids`, `meditations`) and improving `CyberToggle` RTL layout.

---

## Findings

### Root cause
1. **Stale `localStorage` (`ab:mc-modules`)** — old array without new keys replaced the full list; no merge with defaults.
2. **DB fetch** returned only existing rows without merging missing keys from app code.
3. **CyberToggle RTL** — switch thumb used `right-*` positioning inside `dir="rtl"` shell, making toggles hard to see/misaligned.

### Fixes
| File | Change |
|------|--------|
| `owner-module-defaults.ts` | Central defaults + `mergeOwnerModuleStates()` |
| `platform-store.ts` | Merge on init, sync, and after remote fetch |
| `platform-api.ts` | `fetchModules()` returns merged list |
| `mission-control-ui.tsx` | `CyberToggle` RTL-safe layout (`dir="ltr"` on switch) |
| `mission-screens.tsx` | Module count + sync status + empty state |

### DB verification
Supabase `platform_modules` contains 13 rows including `audio`, `kids`, `meditations`.

---

## Warnings

- Path to screen: **الإعدادات → رمز المالك → `/platform` → إدارة الموديولات** (not user `/settings` alone).
- Hard refresh or clear `ab:mc-modules` once if an old empty cache persists.

---

## Errors

None. Build PASS.

---

## Recommendations

1. After deploy, open `/platform/modules` and confirm «13 موديول · متزامن مع قاعدة البيانات».
2. Optional: Realtime subscription on `platform_modules` for instant cross-tab sync.

---

## Overall Status

**PASS**
