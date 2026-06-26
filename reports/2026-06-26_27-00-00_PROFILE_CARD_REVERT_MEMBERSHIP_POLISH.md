# Profile Card Revert + Membership Screen Polish

**Date:** 2026-06-26

---

## Executive Summary

Reverted the profile page membership widget to the original gold `MembershipBarcodeCard`. Premium data layout, slogan footer, and live QR camera scanner remain on `/profile/membership` only.

---

## Findings

- `MembershipCompactStrip` (dark grid) clashed with the dark profile page aesthetic — user requested revert.
- `MembershipBarcodeCard` preserved: gold frame, shield pulse, mini QR, status pill.
- Membership full page received premium dark-gold info panel + identity ribbon on main card.

---

## Changes

### Profile (`ProfilePremiumScreen`)
- Restored `MembershipBarcodeCard` with live data from `useProfileMembershipData`
- Added `diocese` to shield `profileInfo` on barcode card

### Membership (`/profile/membership`)
- Identity ribbon: Alpha ID + عضو منذ on main card
- Premium dark panel for بيانات العضوية (2×2 cells + verified ID strip)
- Slogan footer (ⲁⲗⲫⲁ + official slogan) — no logo
- `AlphaMembershipQrScanner` — live camera via `@zxing/browser`

---

## Warnings

- Camera requires HTTPS or localhost + user permission
- `MembershipCompactStrip.tsx` unused — safe to delete later

---

## Errors

None. Build PASS.

---

## Overall Status

**PASS**
