# Card Title Text Visibility Fix

**Date:** 2026-06-27  
**Scope:** CSS typography cascade (no component restructure)

---

## Executive Summary

Restored visible card titles (الكتاب المقدس، الخولاجي، journey cards) by fixing CSS specificity where `.alpha-type-h2` overrode `text-white` on dark image cards. Build: **PASS**.

---

## Findings

**Root cause:** `.alpha-type-h2` (and sibling type classes) set `color: var(--alpha-text-primary)` (#3a2a18) with equal/higher cascade priority than Tailwind `text-white`, making titles dark-on-dark — appearing invisible.

**Fix:**
1. Wrapped typography classes in `:where()` so explicit color utilities (`text-white`, `text-alpha-heading`, etc.) win.
2. Added safety rules for cinematic home cards (`.alpha-home-daily-card`, `.journey-discover-article`, etc.) forcing white titles/descriptions.

---

## Warnings

- Light-surface cards using only `alpha-type-h2` without a color class still default to `--alpha-text-primary` (intended).

---

## Errors

None in build.

---

## Recommendations

- Prefer pairing `alpha-type-*` with explicit color utilities on mixed light/dark surfaces.

---

## Overall Status

**PASS**
