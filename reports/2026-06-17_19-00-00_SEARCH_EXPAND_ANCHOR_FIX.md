# Search Expand Anchor Fix — Alpha Bible

**Date:** 2026-06-17

---

## Executive Summary

Fixed search bar expand animation so the bar grows **from the button's position** instead of from the opposite side. Root cause: on expand, headers moved the search into a full-width slot next to the menu/back button, so the animation appeared to originate from the wrong edge. Search now stays in its trailing flex slot with `justify-end` anchoring while the title hides in place.

---

## Findings

### Root cause

When `searchExpanded` was true, layouts used:

```tsx
[menu/back] [search flex-1 full width]
```

In RTL headers (search visually on the **left**), this relocated the bar to start beside the menu (right), making `max-width` animation grow from the wrong anchor.

### Fix pattern (all expandable headers)

1. Keep search in the **same trailing flex group** (where the circle button lives).
2. Hide title with `max-w-0 opacity-0` instead of unmounting.
3. Let trailing group become `flex-1 justify-end` when expanded.
4. Inner wrapper: `w-full flex-1 justify-end` — anchors animation at button side.
5. CSS class unified: `.alpha-search-expand` (alias `.alpha-home-search-expand`).

### Files updated

| File | Change |
|------|--------|
| `alpha-responsive.css` | Renamed keyframes → `alpha-search-expand` |
| `AlphaExpandableSearchBar.tsx` | Uses `.alpha-search-expand` |
| `AlphaHeader.tsx` | In-place expand from trailing slot |
| `home.tsx` | Same pattern |
| `BibleHeader.tsx` | Same pattern (RTL) |
| `AudioHeader.tsx` | Same pattern (LTR, search on right) |
| `alpha-connect.tsx` | Added shared class for consistency |

---

## Warnings

- Collapsed-only `AlphaSearchButton` screens (feasts, books) unchanged — no expand animation.

---

## Errors

None — build passes.

---

## Recommendations

Visual QA on home, Katameros, Synaxarium, Bible hub, and Audio on device/emulator.

---

## Overall Status

**PASS**
