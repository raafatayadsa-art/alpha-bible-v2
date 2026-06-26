# Profile Hero Scene — User-Provided Background

## Executive Summary

Replaced the separate church photo behind the avatar with the user’s attached panoramic hero scene. Avatar circle is percentage-aligned to the artwork’s white ring; duplicate gold frame and cross removed.

## Findings

### Asset
- Saved to **`public/profile/profile-hero-scene.png`** (1024×512 JPEG).
- Hero uses **`aspect-ratio: 2/1`** so positioning tracks the artwork on all widths.

### Avatar alignment
- **`HERO_AVATAR_TOP: 7.8%`**, **`HERO_AVATAR_SIZE: 18.4%`** — centered on the scene’s white circle.
- No extra gold ring or SVG cross (artwork already includes frame + cross).
- Shield badge retained on avatar.

### Removed
- `profile-church-hero.webp` from profile hero layer.
- `ProfileHeroGoldCross` and flanking Ⲁ/Ⲱ glyphs.

### Settings menu
- Header bar sits **outside** the clipped scene layer so dropdown remains usable.

## Warnings

- Fine-tune `HERO_AVATAR_TOP` / `HERO_AVATAR_SIZE` if device crop differs slightly.

## Errors

None. `npm run build` — PASS.

## Recommendations

- Optionally rename asset to `.jpg` for clarity.

## Overall Status

**PASS**
