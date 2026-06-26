# Profile User Card — Full Scene + Cross Align + Dark Name

## Executive Summary

Scaled profile scene to show full image via object-contain aspect box, aligned avatar under artwork cross, and darkened name ledger for readability.

## Findings

### Scene
- Container **`max-w-[360px]` · `aspect-ratio 1024/682`** + **`object-contain`** — entire image visible.
- Avatar overlay **`top 19%` · `width 30%`** — cross from artwork sits directly above user photo.

### Name ledger
- Darker frame: **`rgba(12,6,22,0.9) → rgba(22,14,36,0.96)`** + stronger border/shadow.
- Slightly larger text for legibility.

## Warnings

None.

## Errors

None. `npm run build` — PASS.

## Recommendations

Fine-tune `HERO_SCENE_AVATAR_TOP` by ±1% if device preview needs pixel tweak.

## Overall Status

**PASS**
