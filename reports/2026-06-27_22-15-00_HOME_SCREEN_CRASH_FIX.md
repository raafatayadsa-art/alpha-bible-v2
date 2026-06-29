# Home Screen Crash Fix — Missing Sparkles Import

**Date:** 2026-06-27  
**Scope:** `/home` — screen fails to open

---

## Executive Summary

The home screen crashed at runtime when rendering the church news section because `Sparkles` from `lucide-react` was used in `FeaturedNewsCard` (and legacy `HeroCardView`) without being imported. This caused `ReferenceError: Sparkles is not defined` and triggered the root error boundary.

---

## Findings

1. **Root cause:** `src/routes/home.tsx` lines 732 and 858 reference `<Sparkles />` but import list omitted `Sparkles` (likely removed when greeting icon was switched to `CopticCross`).
2. **Trigger:** Section "أخبار كنيستك" renders when `community` module is enabled (default: enabled).
3. **Symptom:** Home route shows load-failed / blank screen instead of content.

---

## Fix Applied

- Added `Sparkles` to the `lucide-react` import in `home.tsx`.

---

## Warnings

- `HeroStack`, `HeroCardView`, and related carousel helpers in `home.tsx` appear unused by current `HomeScreen` — consider cleanup in a separate pass (not changed here).

---

## Errors

- None after fix.

---

## Recommendations

1. Hard-refresh the app (`Ctrl+Shift+R`) after deploy.
2. Optional: replace news badge `Sparkles` with `CopticCross` for visual consistency with home DNA.

---

## Overall Status

**PASS** — build verified after fix.
