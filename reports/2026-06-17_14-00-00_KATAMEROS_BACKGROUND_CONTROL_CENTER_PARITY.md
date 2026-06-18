# Katameros Background — Control Center Parity Fix

**Date:** 2026-06-17  
**Scope:** Align Katameros full-screen background with Control Center pattern  
**Status:** PASS

---

## Executive Summary

`KatamerosScreenBackground` now mirrors `ControlCenterScreenBackground`: **fixed viewport cover** with PNG `object-cover object-center` and a light `#f5edd8` tint. Removed the old flat cap + offset PNG start that only filled the scroll column.

---

## Findings

| Before | After |
|--------|-------|
| `absolute inset-0 z-0` inside route shell | `fixed inset-0 -z-10` (full viewport) |
| Flat cream cap hiding top medallion | Full PNG visible edge-to-edge |
| PNG started below header (`calc(safe-area + 56px)`) | PNG covers entire screen |
| Side bands on tablet showed shell only | Parchment fills full width |

**Reference (unchanged):** `src/features/settings/components/ControlCenterScreenBackground.tsx`

**Updated:** `src/features/katameros/components/KatamerosScreenBackground.tsx`

**Dev preview:** `scope="absolute"` on `/dev/katameros-curve-preview` so phone mock clips correctly.

Preview `?katamerosBg=a` still shows flat `#f4ead8` only.

---

## Warnings

- Top medallion arc from `katameros-reading-bg.png` may show through transparent header (same as Control Center). Preview `katamerosBg=c` still adds opaque header for comparison.
- `katamerosBg=b` label still describes old crop behaviour; production no longer crops.

---

## Errors

None.

---

## Recommendations

- Visual check on `/katameros` on phone and iPad landscape.
- Remove temporary curve-preview query params when forensic work is complete.

---

## Overall Status

**PASS**
