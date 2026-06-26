# Home Menu, Profile Theme, Katameros Controls — Fix Pass

**Date:** 2026-06-26

---

## Executive Summary

Fixed home side menu button, removed home search, migrated profile + membership card to global light/dark tokens, moved Katameros font controls to bottom bar (Bible reader parity, no autoplay), and centered Katameros date on home hero card. Build: **PASS**.

---

## Findings

### 1. Home — Menu + Search
- Removed `AlphaExpandableSearchBar` and all search state from `home.tsx`
- Menu button: `z-50` header, `z-[60]` button, `data-alpha-edge-ignore`, `touch-manipulation`
- `AlphaNavHub` z-index raised to `10050/10051` (above debug overlays)

### 2. Profile Theme (Light Mode)
- `ProfilePremiumScreen`: `bg-alpha-base` instead of forced dark gradient
- `MembershipBarcodeCard`: `--alpha-membership-*` semantic tokens (ivory light / dark premium)
- `ProfileActivityLedger`: theme-aware ledger cells + heading
- `ProfilePremiumShell`: sticky title bar follows resolved theme
- Trip/reposts sections use `dark={isDark}` from `useResolvedTheme()`

### 3. Katameros Reading Controls
- Removed header `T` font button
- Added `AutoScrollControls` at `bottom-[88px]` with `showAutoscroll={false}`
- Includes: line spacing, font stepper, theme toggle — no play/speed
- `AlphaReadingControlBar`: new `showAutoscroll` prop

### 4. Katameros Hero Date (Home)
- `HeroDailyCardData` + `buildKatamerosHeroCard` pass `dateCoptic` / `dateGregorian`
- `HeroDailyCard` renders `KatamerosDateStrip` centered at top when dates present

---

## Warnings

- Profile hero (`ProfileHeroV3`) and church card remain cinematic dark-by-design (cover image cards)
- Katameros reading detail header still uses ivory hex (not full token migration)
- Other screens (church, settings cards) still partially hardcoded

---

## Errors

None. `npm run build` exit code 0.

---

## Recommendations

1. Migrate `ProfileHeroV3` bottom stats ledger to theme tokens for light mode polish
2. Katameros hub hero card: center date picker row like home hero (optional parity)
3. Audit remaining `#07040f` hero cards — intentional dark overlay vs theme bug

---

## Overall Status

**PASS**
