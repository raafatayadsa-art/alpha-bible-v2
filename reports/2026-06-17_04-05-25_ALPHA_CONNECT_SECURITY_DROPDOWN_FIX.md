# Alpha Connect — Security Button Dropdown Direction Fix

**Date:** 2026-06-17  
**Scope:** Trust Shield + call security panels across Alpha Connect

---

## Executive Summary

Fixed the security/trust button so panels open **downward from the header button** instead of sliding **upward from the bottom of the screen**. A shared `ConnectTopAnchorSheet` component now anchors panels below the trigger with `slide-in-from-top` animation and portal rendering.

---

## Findings

- `AlphaTrustShieldSheet` used a bottom sheet pattern (`items-end`, `slide-in-from-bottom`), which made the "الأمان / مركز الثقة" panel rise from the screen bottom — opposite of the expected dropdown-from-header behavior.
- The same bottom-up pattern existed on `/call` and `/personal-call` security sheets.
- Header security button is consistently placed at the top-right (RTL trailing) across Connect screens.

---

## Changes

| File | Change |
|------|--------|
| `src/components/alpha/ConnectTopAnchorSheet.tsx` | **New** — top-anchored dropdown sheet with portal, anchor measurement, downward animation |
| `src/components/alpha/AlphaTrustShield.tsx` | Uses `ConnectTopAnchorSheet`; button gets `forwardRef` + anchor ref |
| `src/routes/call.tsx` | Security panel uses top anchor sheet |
| `src/routes/personal-call.tsx` | Security panel + header ref for anchor |
| `src/components/alpha/styles.css` | Classic theme styles for `.connect-top-anchor-sheet-panel` |

---

## Warnings

- Center-screen "المكالمة آمنة" badge on call screens still opens the same top-anchored panel but anchors to the header button (not the badge). Acceptable for MVP; badge could get its own ref later if needed.
- Menu sheets on call routes remain bottom sheets (unchanged — not security).

---

## Errors

None. `npm run build` — **PASS**.

---

## Recommendations

1. Manually verify on device: Individual / Messages / Groups tabs, Settings header, `/call`, `/personal-call`.
2. Test both **Secure** and **Classic** themes for panel contrast and shadow.
3. If chat embedded security sheet should match, consider migrating `AlphaChatScreen` security panel to the same anchor pattern.

---

## Overall Status

**PASS**
