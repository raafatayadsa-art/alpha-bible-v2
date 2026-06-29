# Community UI Polish Report

**Date:** 2026-06-27  
**Scope:** Add buttons, moment card art, friends strip, add-friend sheet

---

## Executive Summary

Community hub UI was updated per user request: rectangular add buttons (replacing circular + chips), distinctive per-kind background art on spiritual moment cards, friends/suggestions avatar strip directly under hero with rectangular add controls, and a full-screen add-friend method picker sheet matching the reference design. Build **PASS**.

---

## Findings

1. **Rectangular add buttons** — People strip uses gold `rounded-lg` chips with «إضافة» text; main CTA and FAB trigger use `rounded-2xl` rectangles; FAB main control changed from `rounded-full` to `rounded-2xl`.
2. **Moment card backgrounds** — New `CommunityMomentCardArt` with kind-specific images (reading/prayer/agpeya), gradients, Coptic glyph, and accent glow overlays on all feed cards.
3. **Friends strip under hero** — `CommunityPeopleSuggestions` now shows add tile, existing friends as circles, and church suggestions each with rectangular add button; opens add sheet on press.
4. **Add-friend sheet** — `CommunityAddFriendSheet` full-screen overlay with 2×2 method grid, Alpha ID search, QR share section (shared via `CommunityAddFriendMethodsPanel`); route `/community/add-friend` reuses same panel.
5. **Build** — `npm run build` exit 0.

---

## Warnings

- Church/mobile methods still navigate to Alpha Connect routes (existing approved flow).
- Suggestions depend on church dashboard / connect data; empty state shows add tile only.

---

## Errors

None.

---

## Recommendations

1. Verify add sheet on mobile safe-area and scroll with keyboard open.
2. Test moment card art contrast with long Arabic text on small screens.

---

## Overall Status

**PASS**
