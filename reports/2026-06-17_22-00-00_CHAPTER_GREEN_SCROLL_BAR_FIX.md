# Chapter Reader Green Scroll Bar Fix

**Date:** 2026-06-17  
**Overall Status:** PASS

---

## Executive Summary

Fixed chapter screen (removed broken vertical rail props), enabled green bottom reading control bar with autoscroll on `scrollRoot`, 5s hide synced with bottom menu, slightly thicker bar with larger buttons.

---

## Changes (scoped only)

| File | Change |
|------|--------|
| `$book.$chapter.tsx` | Removed incomplete `ChapterReadingScrollRail`; `AutoScrollControls` with `hidden={chromeHidden}`, `barSize="comfort"` |
| `AutoScrollControls.tsx` | `hidden` prop (5s chrome), `barSize="comfort"` (non-compact + extra padding), autoscroll via `scrollContainer` |

---

## Behavior

- Green bar uses `useReadingAutoscroll(scrollRoot)` — scrolls `.alpha-viewport-scroll`
- Hides with `BottomDock` after **5s** idle (`chromeHidden`)
- **Comfort** size: standard buttons (`compact={false}`) + `px-2.5 py-1.5`
- Agpeya unchanged (default `compact`)

---

## Overall Status

**PASS**
