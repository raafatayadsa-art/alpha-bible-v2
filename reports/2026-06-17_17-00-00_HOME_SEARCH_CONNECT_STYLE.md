# Home Search Button — Connect-Style Expandable Bar

**Date:** 2026-06-17  
**Status:** PASS

---

## Executive Summary

Home header search now uses the same **expand/collapse UX** as Alpha Connect messages search (`ConnectMessagesSearchBar`), while preserving home search logic: **navigate to `/search`** with optional `?q=` query.

---

## Findings

| Aspect | Before | After |
|--------|--------|-------|
| UI | Static `Link` circle button | Expandable bar + animation |
| Interaction | Tap → `/search` | Tap → expand → type → Enter → `/search?q=...` |
| Styling | Cream header button | Same DNA + Connect expand animation |
| Search page | Empty query on arrival | Prefills from `q` param |

**New component:** `HomeExpandableSearchBar`  
**Reference:** `ConnectMessagesSearchBar` in `alpha-connect.tsx`

---

## Files Modified

- `src/components/navigation/HomeExpandableSearchBar.tsx` (new)
- `src/routes/home.tsx`
- `src/routes/search.tsx` (`validateSearch` + initial `q`)
- `src/components/alpha/alpha-responsive.css` (`alpha-home-search-expand` animation)

---

## Warnings

- When search expanded, greeting + notifications hide temporarily (space for bar — same pattern as Connect row)
- Escape key collapses without navigating

---

## Errors

None.

---

## Overall Status

**PASS**
