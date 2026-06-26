# Kholagy Hub Cards + Liturgy Navigation Fix

**Date:** 2026-06-24  
**Scope:** Merge category grids into single hub cards; fix liturgy inner tile navigation

---

## Executive Summary

Refactored the Khoulagy index into hub cards: one **القداسات** card with three inner liturgy tiles, and one card each for **التسبحة**, **الأوشيات**, **الذكصولوجيات**, and **الختام**. Liturgy navigation now uses explicit `navigate()` buttons (not nested links). Category drill-down uses new route `/kholagy/category/$category`. Build passes.

---

## Findings

### User requests
1. Merge tasbeha / oroshiyat / doxology grids into single named hub cards.
2. Fix small liturgy tiles inside the liturgy card — they did not open.

### Root cause (liturgy)
- Liturgy tiles needed reliable tap targets inside a parent card container.
- Replaced inner `Link` components with `button` + `useNavigate()` and `z-[2]` stacking.
- Removed blocking route `loader` on liturgy section list; validation moved to component + `notFound()`.

### Layout
| Index card | Action |
|------------|--------|
| القداسات | 3 inner tiles → `/kholagy/liturgy/cyril|basil|gregory` |
| التسبحة | → `/kholagy/category/tasbeha` (2-col hymn grid) |
| الأوشيات | → `/kholagy/category/prayers` |
| الذكصولوجيات | → `/kholagy/category/doxology` |
| الختام | → `/kholagy/category/closing` (when items exist) |

---

## Warnings

- Hub cards hide individual hymn titles until user opens the category page (intended).
- Liturgy section list still depends on Supabase public read on `kholagy_liturgies`.

---

## Errors

- None — `npm run build` **PASS**.

---

## Recommendations

1. QA on device: tap each liturgy tile and confirm section list opens.
2. Deploy when ready.

---

## Overall Status

**PASS**

---

## COPYABLE REPORT

```
KHOULAGY HUB CARDS — 2026-06-24 | PASS
- Index: 1 liturgy hub + 1 card per hymn category
- New route: /kholagy/category/$category
- Liturgy tiles: button + navigate (fixed)
- Build OK
```
