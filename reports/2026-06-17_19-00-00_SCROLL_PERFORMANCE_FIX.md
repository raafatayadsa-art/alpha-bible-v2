# Hero + Journey Scroll Performance Fix

**Date:** 2026-06-17  
**Scope:** Eliminate drag/scroll stutter on verse hero stack and journey discover center lift.

---

## Executive Summary

Fixed jank by removing React re-renders during gestures, applying GPU `translate3d` directly, and moving journey center styling to pure CSS class toggles.

---

## Findings

### Verse hero stack
- **Root cause:** CSS-variable + rAF drag pipeline added frame latency; dataset toggles each move triggered style recalc.
- **Fix:** Direct `translate3d` on front/peek refs; `hero-stack-dragging` class only on start/end.
- Pointer capture gated to active capture; ignores buttons/links/ledger.
- `touch-action: pan-x` for horizontal priority.
- `pointer-events: none` on card children while dragging.
- Snap-back uses transition when release without advance.

### Journey discover
- **Root cause:** `setState(centerKey)` re-rendered all 9 cards on every scroll frame; box-shadow transitions/animations are expensive.
- **Fix:** DOM `classList.toggle('is-centered')` only when center card changes — zero React updates during scroll.
- `memo()` on card component.
- Lift via `translate3d` only (240ms cinematic ease).
- Gold pulse uses opacity + scale on ring overlay (not animating box-shadow).
- Static box-shadow changes via CSS class (no transition).

---

## Warnings

- `color-mix()` used for accent tints; requires modern browsers (iOS 16.2+, Chrome 111+).

---

## Errors

None. Build PASS.

---

## Recommendations

- If hero still heavy on low-end devices, consider lazy-mounting peek card content.

---

## Overall Status

**PASS**
