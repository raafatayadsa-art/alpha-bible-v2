# Profile Hero — Remove Background Scene

## Executive Summary

Removed the panoramic hero scene image behind the profile avatar. Hero now uses clean cream page background with gold-ring avatar, name ledger, and header controls preserved.

## Findings

- **Removed:** `profile-hero-scene.png` from `ProfileHeroBanner`.
- **Removed:** aspect-ratio scene container and bottom blend gradient.
- **Kept:** avatar (124px gold ring), `ProfileNameLedger`, join chip, back + settings header.

## Warnings

None.

## Errors

None. `npm run build` — PASS.

## Recommendations

None.

## Overall Status

**PASS**
