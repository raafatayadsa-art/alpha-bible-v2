# Profile User Card — Background Image

## Executive Summary

Added user-provided scene as background for the profile hero card using absolute fill + object-cover, preserving existing content height and layout.

## Findings

- Asset: **`public/profile/profile-user-card-bg.png`** (1024×682).
- Background layer: `absolute inset-0` — **no aspect-ratio change**; card height stays content-driven.
- Image: `object-cover object-[center_38%]` fills current area.
- Bottom gradient blends into page cream `#f7f2ea`.
- Header buttons: light glass for contrast on bright scene.

## Warnings

None.

## Errors

None. `npm run build` — PASS.

## Recommendations

None.

## Overall Status

**PASS**
