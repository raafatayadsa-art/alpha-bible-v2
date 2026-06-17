# Alpha Connect — Trust Center Bottom Sheet Animation

**Date:** 2026-06-17  
**Scope:** Move Trust Center from side drawer to bottom-up sheet with smooth animation

---

## Executive Summary

Trust Center now opens as a bottom sheet sliding up from below (max 82dvh), with backdrop fade-in and spring easing — consistent across all Alpha Connect screens using `AlphaTrustShieldSheet`.

**Overall Status:** PASS

---

## Findings

| Before | After |
|--------|-------|
| Right-side drawer (`translateX`) | Bottom sheet (`translateY` from 105%) |
| Full height panel | `max-h-[min(82dvh,680px)]` · `rounded-t-3xl` |
| No drag handle | Top grab bar (white/20 pill) |
| Side shadow | Upward shadow `0_-16px_52px` |

### Animation
- Sheet: `connect-trust-center-sheet-in` · 0.4s · `cubic-bezier(0.32, 0.72, 0, 1)`
- Backdrop: `connect-trust-center-backdrop-in` · 0.28s fade

### Files
- `src/components/alpha/AlphaTrustShield.tsx`
- `src/components/alpha/styles.css`

---

## Warnings

Close is instant (no exit animation) — same pattern as other Connect sheets.

---

## Errors

None.

---

## Recommendations

Optional follow-up: swipe-down to dismiss on the grab handle.

---

## Overall Status

**PASS**
