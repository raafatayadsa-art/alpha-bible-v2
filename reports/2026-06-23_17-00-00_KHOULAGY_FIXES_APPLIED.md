# Khoulagy & Home Fixes — Root Cause & Repair

**Date:** 2026-06-23  
**Status:** PASS (build)

---

## Executive Summary

User could not see Khoulagy UI changes. Root causes: **stale `localStorage` module cache** (pre-kholagy), **module gate hiding home card**, **hover-only effects invisible on touch**, and **uncommitted code not on production deploy**. Fixes applied: cache v2 + legacy purge, optimistic module enable while loading, always-visible home card, Bible-style card rings with touch `active` feedback, tighter grid gaps.

---

## Root Causes

| Issue | Impact |
|-------|--------|
| `ab:platform-modules-public` stale cache | `kholagy` treated disabled → redirect from `/kholagy`, home card hidden |
| `isModuleEnabled` strict timing | Brief false negatives during fetch |
| `@media (hover:hover)` only | Glow invisible on phone/tablet |
| Code uncommitted / not deployed | Production URL shows old worker without Khoulagy routes |
| Subtle `gap-2` vs `gap-3` | Spacing change hard to notice |

---

## Fixes Applied

### `src/lib/platform-modules/platform-modules-client.ts`
- Cache key → `ab:platform-modules-public-v2`
- Purge legacy key on read
- `isModuleEnabledInList` → strict `enabled === true` after merge

### `src/lib/platform-modules/usePlatformModules.ts`
- Optimistic `true` while `loading`
- One-time remove legacy cache key on mount

### `src/routes/home.tsx`
- `KholagyHomeCard` always rendered (not gated by module flag)

### `src/routes/kholagy.index.tsx`
- Grid `gap-1.5`, smaller cards
- CSS `.kholagy-grid-card` with permanent ring + hover/focus glow (Bible-style)
- `group-active` inset glow for touch press

---

## User Actions Required

1. **Local:** Stop dev server → `npm run dev` → hard refresh (`Ctrl+Shift+R`)
2. **Production:** `npm run build && npm run deploy` (code not in git remote yet)
3. **Phone:** Press/hold card to see glow (not hover)

---

## Errors

None. `npm run build` — PASS.

---

## Overall Status

**PASS**
