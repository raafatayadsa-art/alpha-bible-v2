# Katameros Top Cap / Mini Frame Fix

**Date:** 2026-06-17  
**Route:** `/katameros`  
**Status:** PASS

---

## Executive Summary

The “small screen” above the cross and header on Katameros was **not a separate UI component** — it was the **top ornamental cross medallion** baked into `katameros-reading-bg.png`, shown via a `fixed inset-0` full-screen background in the safe-area zone above the header.

---

## Findings

| Item | Detail |
|------|--------|
| Visible artifact | Circular ornate cross pattern above header buttons |
| Source | `src/assets/katameros-reading-bg.png` top-center artwork |
| Trigger | `KatamerosScreenBackground` used `fixed inset-0` + `object-cover object-center` |
| Not caused by | AlphaHeader, SearchOverlay, viewport shell gradient |

---

## Fix

**File:** `src/features/katameros/components/KatamerosScreenBackground.tsx`

1. `fixed` → `absolute` (scoped to page, no duplicate viewport layer)
2. Flat `#f4ead8` cap for `calc(max(env(safe-area-inset-top), 14px) + 56px)`
3. Parchment image starts **below** that line with `objectPosition: center top`

Header (`AlphaHeaderShell` + cross + title + buttons) unchanged.

---

## Warnings

- Other screens using similar full-bleed decorative PNGs may need the same top clip pattern.
- Dark pill at very top in browser preview = device Dynamic Island mock (not app UI).

---

## Errors

None. Build PASS.

---

## Recommendations

Hard-refresh `/katameros` on device. Top should be flat cream; cross in header only.

---

## Overall Status

**PASS**
