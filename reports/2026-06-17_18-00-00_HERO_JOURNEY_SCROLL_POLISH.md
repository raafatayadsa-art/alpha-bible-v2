# Hero Swipe + Journey Scroll Polish

**Date:** 2026-06-17  
**Scope:** Smoother verse hero stack swipe; faster journey discover scroll with centered card lift + golden pulse.

---

## Executive Summary

Verse card stack drag is now GPU-friendly (CSS variable + rAF, no per-move React re-renders). Journey discover uses proximity snap, center padding, and a lifted center card with golden pulse animation.

---

## Findings

### Verse hero stack (`HomeVerseHeroStack.tsx`)
- Drag updates `--hero-stack-dx` via `requestAnimationFrame` — avoids heavy re-renders during swipe.
- Pointer events with capture replace separate touch/mouse handlers.
- Transition shortened: 300ms spring easing (was 480ms).
- Swipe threshold lowered: 32px / velocity 0.28 (was 48px / 0.45).
- Peek cards follow drag at 0.22× / 0.12× parallax.

### Journey discover (`HomeJourneyDiscover.tsx`)
- `scroll-snap-type: x proximity` + `snap-center` for lighter, faster horizontal scroll.
- Side padding centers cards in viewport.
- Scroll listener (rAF-throttled) detects center card.
- Center card: `-translate-y-3`, `scale(1.03)`, gold border/glow, infinite pulse ring.
- Extra top padding prevents clip on lift.

---

## Warnings

- Center-card detection runs on scroll/resize; very fast flings may update highlight one frame late (acceptable).

---

## Errors

None. Build PASS.

---

## Recommendations

- If hero inner buttons (share/save) steal swipe, add pointer target filter to ignore interactive elements.

---

## Overall Status

**PASS**
