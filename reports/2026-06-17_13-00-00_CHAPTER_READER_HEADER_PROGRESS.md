# Chapter Reader Header & Progress Refinement

**Date:** 2026-06-17  
**Scope:** Header, title hierarchy, verse-level progress, scroll rail

---

## Executive Summary

Refined the Bible chapter reader header and progress system per spec — no visual redesign of verse cards, colors, toolbar, or navigation logic. Removed opaque header panel and chapter-dot progress rail. Added premium title hierarchy, in-chapter verse progress bar, and an improved custom scroll rail anchored to the content column.

---

## Findings

1. Sticky header used white/beige backdrop, border, and shadow — felt like a separate card on top of Katameros background.
2. Progress strip showed book-level chapter dots (5/50) — incorrect for reading progress within a chapter.
3. No custom scroll rail was present after prior layout work — reintroduced as `ChapterReadingScrollRail`.

---

## Changes Applied

| Area | Change |
|------|--------|
| Header | Transparent sticky block; controls sit directly on chapter background |
| Title | Small covenant label → large book name → ordinal chapter badge |
| Progress | Replaced chapter dots with gold horizontal bar + «الآية X من Y» + «N% مكتمل» |
| Progress logic | `articleScrollProgress()` — scroll position within current chapter article only |
| Scroll rail | New component: gold thumb, draggable, positioned from content column `getBoundingClientRect` |
| Layout | Full width with minimal responsive padding (`px-3 sm:px-4 md:px-5`) |

---

## Warnings

- Scroll rail sits at left edge of content column (+6px); on very narrow screens it may sit close to verse cards — unchanged card layout per constraint.
- Ordinal badges use Arabic ordinals 1–99; chapters above 99 fall back to numeric display.

---

## Errors

None. `npm run build` — PASS.

---

## Recommendations

1. Manually verify title/badge on Psalms (مزmور ordinals).
2. Confirm scroll rail drag feel on tablet landscape.
3. Optional: sync scroll rail thumb to `articleScrollProgress` instead of full-page scroll for visual parity with progress bar.

---

## Overall Status

**PASS**
