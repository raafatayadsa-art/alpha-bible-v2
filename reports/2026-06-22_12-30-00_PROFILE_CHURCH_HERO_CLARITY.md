# Profile Church Hero — Clarity & Gold Cross Fix

## Executive Summary

Removed fog overlays from profile church background, replaced with sharp HD church asset, and swapped circle-wrapped cross for a standalone professional gold Coptic cross above the avatar frame.

## Findings

### Church background
- Removed: full-screen cream/blue gradient, conic haze, blurred user-avatar overlay (main fog sources).
- Replaced asset: **`public/profile/profile-church-hero.webp`** (HD regenerate — vivid, no mist).
- Image rendering: `saturate-[1.08] contrast-[1.04]`, `object-[center_42%]`, `fetchPriority="high"`.
- Only **18% bottom edge** soft fade to blend into page cream (not over church body).

### Coptic cross
- New **`ProfileHeroGoldCross`** SVG: filled gold gradient, terminal bars, center jewel, drop shadow.
- Positioned **above** gold avatar ring — **no circle container**.

## Warnings

None.

## Errors

None. `npm run build` — PASS.

## Recommendations

- Commit updated `public/profile/profile-church-hero.webp` to repo.

## Overall Status

**PASS**
