# Chapter Reader — Agpeya Alignment Fix

**Date:** 2026-06-17  
**Scope:** Bible chapter reader header, progress, background, scroll rail, saved state

---

## Executive Summary

Applied targeted fixes to align the Bible chapter reader with Agpeya screen patterns: solid premium header (no transparency bleed), Agpeya parchment + Coptic watermark background, purple/gold in-chapter progress bar, top action buttons (bookmark/share/listen), chapter saved badge, prev/next chapter controls, full-width layout, and improved custom scroll rail.

---

## Findings

1. Transparent sticky header allowed verse text to show through while scrolling.
2. Katameros background differed visually from Agpeya reader.
3. Progress bar used gold-only design, not Agpeya purple progress rail style.
4. Missing Agpeya-style header actions and chapter bookmark state.
5. Scroll rail used fixed viewport positioning; thumb size not content-adaptive.

---

## Changes Applied

| Area | Fix |
|------|-----|
| Header | Solid `bg-[#fbf3e1]` / `bg-[#0b1a2c]` sticky container, Agpeya border — no transparency |
| Title hierarchy | Covenant label → book name → «الإصحاح N» + optional «محفوظ» badge |
| Toolbar | Search, prev/next chapter, listen, share, bookmark, back, home preserved |
| Progress | Agpeya-style 3px purple/gold gradient bar; in-chapter only via `articleScrollProgress` |
| Actions | Bookmark (chapter), Share (native/copy), Listen (scaffold toast) |
| Saved state | `useSavedChapters()` in `reading-state.ts`; purple «محفوظ» badge beside chapter title |
| Background | `CopticWatermark` + `#f4ead8` / `#08131f` (matches Agpeya) |
| Width | Full `w-full max-w-full`; minimal `px-3` padding |
| Scroll rail | Content-anchored position, adaptive thumb height, purple/gold thumb |

---

## Warnings

- Chapter audio is scaffold-only (toast «قريباً») — same pattern as Agpeya audio scaffolding.
- Scroll rail remains in left content gutter (+6px from column edge).

---

## Errors

None. `npm run build` — PASS.

---

## Recommendations

1. Wire chapter listen button to Bible audio when API exists.
2. Add saved-chapters list screen if not already present in Bible saved routes.

---

## Overall Status

**PASS**
