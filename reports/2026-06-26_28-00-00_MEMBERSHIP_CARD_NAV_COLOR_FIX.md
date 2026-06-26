# Membership Card Color + Screen Navigation Fix

**Date:** 2026-06-26

---

## Executive Summary

Fixed membership screen not opening (no navigation from profile card) and restyled the profile membership card to match the dark profile theme.

---

## Root Causes

1. **Screen not opening:** `MembershipBarcodeCard` was a static `<div>` with no `Link` to `/profile/membership` after IA revert.
2. **Wrong colors:** Cream/gold card clashed with dark profile page (`#0e0a06` background).

---

## Fixes

### Profile card (`MembershipBarcodeCard`)
- Wrapped in `Link` to `/profile/membership`
- Dark glass styling aligned with achievements/church cards
- Gold accents on text; emerald status pill
- Shield zone uses `preventDefault` so tap opens verification, not navigation
- Footer CTA: «عرض البطاقة»

### Membership screen (`profile.membership.tsx`)
- Lazy-load `AlphaMembershipQrScanner` so `@zxing/browser` does not block route chunk load

---

## Overall Status

**PASS** — `npm run build` succeeds
