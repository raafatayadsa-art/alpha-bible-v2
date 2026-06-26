# CHURCH FEED & POST DETAIL — DARK PREMIUM REDESIGN

**Date:** 2026-06-25 08:51  
**Scope:** Church feed card, post detail screen, church hub screen

---

## Executive Summary

Complete implementation of 9 user requests targeting the church page experience:
smaller cards, inline commenting, full-bleed images, dark premium post detail, priest role testing mode, quick-access hidden, priest name formatting.

---

## Findings

### 1. `post-store.ts` — Force priest role (testing)
- `useCanManagePosts()` now always returns `true` via `useSyncExternalStore`
- All admin actions (pin, archive, edit, delete) are always visible

### 2. `church.tsx` — Quick Access hidden + priest name formatting
- Removed `<QuickGrid />` from `ChurchScreen` layout
- Added `stripClericalTitle()` function that removes prefixes: القمص، الأب، الأنبا، القس، الأرشيدياكون، الأسقف، البابا، البطريرك، الشماس، المتنيح، الراهب، الراهبة
- `priestDisplayText()` now strips titles from each line of the priest name field

### 3. `ChurchMixedPostCard.tsx` — Compact + full-bleed + inline comment
- Card `min-h` reduced from `195px` → `168px`; padding and font sizes tightened
- Image panel now truly full-bleed with CSS gradient fades on all 4 edges
- `CommentsPreview` updated: shows last 2, has "show all (N)" button that navigates to `/church/post/$id#comments`
- `QuickCommentInput` (forwardRef) added at bottom of card — standalone comment input with send button
- Comment button in `AlphaChurchEngagementBar` now focuses the inline input instead of navigating away
- Stop-propagation guards prevent card click from firing on comment area

### 4. `church.post.$id.tsx` — Complete dark premium redesign
- Removed all `GLASS` (cream/white) styling
- New `DarkCard` wrapper: `rgba(255,255,255,0.035)` bg + `rgba(255,255,255,0.09)` border
- Image: full-bleed edge-to-edge (no padding, no border-radius on top), multi-layer gradient fade
- Back + share buttons float over image on dark pill backgrounds
- All sections redesigned with dark glass: `DarkPostMetaBar`, `DarkTemplateDetails`, `DarkEngagementStats`, `DarkPostActionArea`, `DarkParticipantsSection`, `DarkRepliesList`, `DarkCommentsSection`, `DarkChurchInfoCard`, `DarkAdminActionsPanel`
- `DarkCommentsSection`: shows 2 most recent + "show all (N)" expand button + inline input; auto-scroll to `#comments` hash still works
- Admin panel always visible (priest testing mode)
- Dark sheets (PinDurationSheet, ConfirmSheet) match dark shell

---

## Warnings

- `useCanManagePosts` is hardcoded to `true` — remove before production
- Pre-existing TypeScript errors in unrelated files (`alpha-connect-security.ts`, `church-directory`, `bible` components) remain unchanged

---

## Errors

None introduced by this session's changes.

---

## Recommendations

1. Before production: restore `useCanManagePosts` to real auth check
2. Re-enable `QuickGrid` section when needed
3. Consider a "no comments" empty state with CTA for new post types

---

## Overall Status: PASS

All 9 requested changes implemented. No new TypeScript or lint errors.

---

## COPYABLE REPORT

```
CHURCH FEED DARK REDESIGN — 2026-06-25
=======================================
Files changed:
  src/features/church/post-store.ts          → useCanManagePosts always true
  src/routes/church.tsx                      → hide QuickGrid, strip clerical titles
  src/features/church-mixed-feed/ChurchMixedPostCard.tsx  → smaller card, inline comment, show-more
  src/routes/church.post.$id.tsx             → full dark premium redesign

Changes:
  [1] post-store: useCanManagePosts() → always true (testing)
  [2] church.tsx: QuickGrid removed, stripClericalTitle() added to priestDisplayText()
  [3] ChurchMixedPostCard: min-h 195→168px, QuickCommentInput, show-more comments, comment btn focuses input
  [4] church.post.$id: DarkCard system, full-bleed image, dark all-sections, 2 comments + expand

Status: PASS — no new errors
```
