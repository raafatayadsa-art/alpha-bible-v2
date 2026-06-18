# Chapter Reader Layout Responsiveness Fix

**Date:** 2026-06-17  
**Scope:** `src/routes/$book.$chapter.tsx`, `src/lib/chapter-scroll.ts`, `src/components/alpha/alpha-responsive.css`

---

## Executive Summary

Fixed Bible chapter reader layout and scroll behavior without visual redesign. Header is now in normal document flow with SafeArea padding (sticky, not fixed/absolute). Reading column uses full available frame width. All scroll logic binds to the Alpha viewport scroll container (`.alpha-viewport-scroll`) instead of `window`. Single scroll owner with hidden inner scrollbar. Progress strip fill, session restore, active-verse tracking, and auto-scroll controls all use the same scroll root.

---

## Findings

1. **Fixed header clipped** — Top chrome used `position: fixed` with a spacer hack; header could render outside SafeArea and clip on some devices.
2. **Width mismatch** — Header and content used `readingWidthStyle()` (~640px cap) while outer frame was full viewport width.
3. **Broken scroll metrics** — Progress fill, session save/restore, and active-verse detection listened to `window.scrollY`, but the app scrolls inside `.alpha-viewport-scroll` via `AlphaScreenFrame`.
4. **Nested scrollbar** — `min-h-screen` on `<main>` plus viewport scroll could produce a visible inner scrollbar.
5. **Auto-scroll not wired** — `AutoScrollControls` supports `scrollContainer` but chapter route did not pass it.

---

## Changes Applied

| Area | Fix |
|------|-----|
| Header | Replaced fixed chrome with **sticky in-flow** block; SafeArea top padding; full column width via `--alpha-content-padding-x` |
| Width | Removed `readingWidthStyle` / `readingWidth` layout constraints; `w-full min-w-0` on column, article, verse cards, nav |
| Scroll root | Added `src/lib/chapter-scroll.ts` helpers: `resolveScrollRoot`, `scrollMetrics`, `scrollToY`, `bindScroll` |
| Progress strip | `ChapterProgressStrip` now accepts `scrollRoot` and uses shared scroll metrics |
| Session | Save/restore uses scroll container `scrollTop`; reset restore flag on book/chapter change |
| Active verse | Viewport height from scroll root `clientHeight` |
| Auto-scroll | `scrollContainer={scrollRoot}` passed to `AutoScrollControls` |
| Scrollbar UX | `.alpha-viewport-scroll--chapter-reader` class: smooth scroll + hidden scrollbar |
| Verse cards | Added `w-full min-w-0` for natural stretch |

---

## Warnings

- Sticky header relies on `.alpha-viewport-scroll` as scroll parent — correct for all routes using `AlphaScreenFrame` in flow mode.
- `KatamerosScreenBackground` remains `fixed` (decorative layer only; unchanged per no-redesign rule).
- Reading toolbar (`AutoScrollControls`) remains viewport-fixed for bottom placement — unchanged DNA.

---

## Errors

None. Production build (`npm run build`) completed successfully.

---

## Recommendations

1. Manually verify on mobile portrait/landscape and tablet portrait/landscape in dev tools or device.
2. Consider binding `AutoScrollControls` idle-kick to scroll container scroll events (currently still listens on `window`).
3. If chapter reader should break out of `--alpha-frame-max-width` on tablet/desktop, that would be a separate shell-level change.

---

## Overall Status

**PASS** — Layout, responsiveness, and scroll wiring fixes applied; build green; no visual redesign.
