# CHURCH CARD FULL-BLEED & HERO ACTIONS POLISH

**Date:** 2026-06-25 09:15  
**Scope:** ChurchMixedPostCard, HeroChurchCard, church.post.$id

---

## Executive Summary

Implemented user feedback: plain cards (no patterns), full-bleed image overlay layout, comments below engagement with avatars, Facebook-style multi-image gallery, priest name cleanup, Alpha ledger quick-action buttons under header.

---

## Findings

### ChurchMixedPostCard
- Removed SVG pattern textures; flat type-color shells
- Single image: full-card background top-to-bottom with all UI overlaid
- Multi-image: text above `PostImageGallery` (FB grid: 2/3/4+ layouts)
- Comments moved **below** engagement bar with `MemberAvatar` + name
- Quick comment input below comments, includes user avatar

### New files
- `post-media.ts` — `getPostImages()`, `images?: string[]` on `ChurchPost`
- `PostImageGallery.tsx` — Facebook-style grid component

### church.tsx Hero
- `ChurchQuickActionsBar` under header: اتصال / رسائل / موقع with dark ledger + glowing Coptic glyphs (Ⲕ Ⲱ Ⲁ)
- Removed float buttons from cover image
- Priest name: strips ordination/death dates + clerical titles
- Priest avatar inline beside name (not stacked)

### church.post.$id
- Gallery support for multi-image posts
- Hero image only for single-image posts

---

## Warnings

- `images[]` field is optional; PostBuilder still uploads single image — multi-upload can be wired next
- `useCanManagePosts` still in testing mode (always true)

---

## Errors

None in changed files.

---

## Recommendations

1. Add multi-image picker to PostBuilder
2. Persist `images[]` to Supabase when schema supports it

---

## Overall Status: PASS
