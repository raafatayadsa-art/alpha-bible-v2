# Home Page Entry Fix

**Date:** 2026-06-24  
**Scope:** Restore home page navigation from onboarding and app root

---

## Executive Summary

The home page appeared broken because onboarding finish buttons did not navigate anywhere, and `/` always redirected to `/intro` even after onboarding was completed.

---

## Root Cause

1. `AlphaOnboarding.finish()` was stubbed to `goTo(0)` — clicking «تصفح كضيف» / register / login reset slide 0 instead of navigating.
2. `routes/index.tsx` forced `<Navigate to="/intro" />` regardless of `hasSeenOnboarding()`.

---

## Fixes

| File | Change |
|------|--------|
| `AlphaOnboarding.tsx` | `finish()` calls `markOnboardingDone()`, fade-out, then `navigate({ to: dest })` |
| `routes/index.tsx` | `/` → `/intro` first time, `/home` when onboarding already seen |

---

## Verification

- `npm run build` — PASS

---

## Warnings

- Users who already have `alpha.onboarding.v1` in localStorage go straight to `/home` on `/`.
- Reset onboarding in console: `resetAlphaOnboarding()`.

---

## Overall Status

**PASS**
