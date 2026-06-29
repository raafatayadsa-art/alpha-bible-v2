# Profile Edit & Membership Card — Alpha Beige Color Restyle

**Date:** 2026-06-27  
**Scope:** Profile edit screen + membership card visual DNA alignment

---

## Executive Summary

Restyled the profile edit screen and membership card components to match Alpha's approved beige/parchment DNA (same family as settings/control center), replacing dark brown and purple themes with warm ivory, gold, and burgundy accents.

---

## Findings

1. **Profile edit** used hardcoded dark gradient (`#0e0a06`) and dark glass cards — inconsistent with Alpha beige.
2. **Membership barcode card** had emerald status pill and dark QR frame on light card.
3. **Full membership page** (`/profile/membership`) used full purple theme — off-brand vs Alpha ivory/gold.
4. **MembershipCompactStrip** used dark brown card styling.

---

## Changes

| File | Update |
|------|--------|
| `ProfileEditScreen.tsx` | Parchment background, glass ivory sections, gold/burgundy accents, theme tokens |
| `MembershipBarcodeCard.tsx` | Enhanced parchment card, gold status pill, warm QR frame |
| `profile.membership.tsx` | Full page converted from purple to Alpha beige/gold |
| `MembershipCompactStrip.tsx` | Uses `alpha-membership-card` tokens |
| `alpha-theme.css` | Richer membership gradient + glow/accent-line tokens |

---

## Warnings

- Dark mode membership tokens updated but profile edit uses same parchment bg as settings (existing pattern).

---

## Errors

None — build PASS.

---

## Recommendations

1. Visual QA on mobile for profile edit + membership card in light/dark theme.
2. Confirm Coptic watermark readability on beige edit screen.

---

## Overall Status

**PASS**
