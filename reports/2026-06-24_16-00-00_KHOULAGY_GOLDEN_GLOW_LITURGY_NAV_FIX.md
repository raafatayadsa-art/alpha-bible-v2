# Kholagy Golden Active Glow + Liturgy Card Navigation Fix

**Date:** 2026-06-24  
**Scope:** Scroll-centered golden frame glow; fix liturgy hub tile navigation

---

## Executive Summary

Reading cards now glow **golden only on the centered (active) block** during manual or auto-scroll. Liturgy hub tiles inside **القداسات** were switched to TanStack `Link` components with proper z-index and touch handling; reserved route segments are blocked on the hymn reader loader.

---

## Findings

### 1. Golden active glow (scroll-centered)
- Removed always-on purple pulse from all `.kholagy-verse-card` elements.
- Added `computeKholagyScrollState()` — picks the section whose **vertical center** is closest to the scroll viewport center.
- Active card gets class `kholagy-verse-card--active` with **golden** glow (`#e7c075` / `#f0d78c` dark mode).
- Inactive cards are slightly dimmed (opacity 0.88) with no frame animation.
- Applied to hymn reader (`kholagy.$groupId`) and liturgy reader (`kholagy.liturgy.$liturgyKey.$sectionId`).

### 2. Liturgy hub tiles not opening
- Replaced `button` + `navigate()` with `<Link to="/kholagy/liturgy/$liturgyKey">` on index hub tiles.
- Added `z-[5]`, `touch-manipulation`, `cursor-pointer`.
- Section list page also uses `Link` for each مقطع.
- Blocked reserved `$groupId` values `liturgy` and `category` in hymn loader to avoid route confusion.
- Registered `/kholagy` prefix in `MODULE_ROUTE_PREFIXES` for proper module gating.

---

## Warnings

- Glow follows scroll center; very short blocks at screen edges may briefly share focus with neighbors.
- Production users need redeploy to see liturgy navigation fix if testing remote URL.

---

## Errors

- None — `npm run build` **PASS**.

---

## Recommendations

1. Device QA: scroll hymn + liturgy readers — only one golden card at a time.
2. Tap each liturgy tile (كيرلس / باسيليوس / غريغوريوس) on index.

---

## Overall Status

**PASS**

---

## COPYABLE REPORT

```
KHOULAGY GLOW + LITURGY NAV — 2026-06-24 | PASS
- Golden frame glow only on viewport-centered reading card
- Liturgy hub tiles: Link-based navigation + route guards
- Build OK
```
