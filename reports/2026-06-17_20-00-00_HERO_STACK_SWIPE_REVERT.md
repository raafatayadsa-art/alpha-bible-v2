# Hero Stack Swipe Revert

**Date:** 2026-06-17  
**Scope:** Restore original verse hero swipe logic after broken performance refactor.

---

## Executive Summary

Reverted `HomeVerseHeroStack.tsx` to the first working swipe implementation: React `dx`/`dragging` state, touch + mouse handlers, 480ms easing, and inline parallax transforms.

---

## Findings

- Removed: pointer capture, ref-based `translate3d`, CSS drag classes, rAF batching, lowered thresholds.
- Restored: `useStackSwipe` with `useState(dx)`, `touch-pan-y`, touch/mouse events, `STACK_EASE cubic-bezier(0.32, 0.72, 0, 1)`, 48px / 0.45 velocity threshold, peek parallax 0.18× / 0.1×.
- Kept: `HeroDailyCard`, `useHeroStackData`, `HeroProgressRail`, `PEEK_LAYOUT` data wiring.
- Build: PASS.

---

## Warnings

- Drag may re-render on each move (original behavior). Performance polish deferred per user request.

---

## Errors

None.

---

## Recommendations

- Future smoothness fixes should be incremental on this baseline, not replace layout/transform model.

---

## Overall Status

**PASS**
