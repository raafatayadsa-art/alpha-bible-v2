# Alpha Connect — Security Button Solid Background Fix (v2)

**Date:** 2026-06-17  
**Scope:** Trust shield header button only

---

## Executive Summary

Security button now uses the **original opaque `--gradient-mic` surface** with `!important` and no blur — replacing the semi-transparent glass look that persisted after prior fixes.

---

## Root Cause

- Tailwind utility classes on the button competed with CSS.
- Previous solid color `oklch(0.22…)` was too close to page background and still felt transparent.
- `glass` / blur was removed from markup but surface was not forced strongly enough.

---

## Fix

**`AlphaTrustShield.tsx`**
- Stripped `border`, `shadow-*` Tailwind classes; styling owned by CSS class only.

**`styles.css`**
- Secure: `background: var(--gradient-mic) !important` + `backdrop-filter: none !important`
- Classic: same gradient token (theme redefines it to sage solid) + forest border/text

---

## Overall Status

**PASS**
