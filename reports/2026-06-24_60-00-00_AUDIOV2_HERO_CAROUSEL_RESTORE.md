# AudioV2 — Restore Publisher Hero Carousel + Engagement

**Date:** 2026-06-24  
**Scope:** `src/features/audiov2/components/`

---

## Executive Summary

Restored the full publisher hero card on the AudioV2 screen: configurable hero slides (`pickHeroSlides`), dot carousel, waveform + play/pause, follow top bar, and like · repost · QR engagement bar — matching `PublisherPublicPageView` DNA while keeping AudioV2 tabs, track list, mini player, and video panel.

---

## Findings

| Item | Status |
|------|--------|
| Hero slides from `heroContentIds` / `pickHeroSlides` | Restored |
| Dot carousel for multiple selected hymns | Restored |
| `AlphaHeroPublisherHeroTopBar` (follow + trusted badge) | Restored |
| `AlphaHeroPublisherEngagementBar` (like · share · QR) | Restored |
| Hero play wired to unified AudioV2 player | Implemented |
| Play all / shuffle / continue row below hero | Preserved |
| Preview mode hides engagement + follow actions | Preserved |
| `npm run build` | PASS |

---

## Changes

### New: `AudioV2PublisherHero.tsx`

- Mirrors publisher public hero block (280px gold-glow card, waveform bars, play button, content badge).
- Loads like/follow state from APIs; share uses `repostPublisherToProfile` + `seedHeroCount`.
- Includes `PublisherQrSheet`.
- Exports `findAudioV2TrackForContent()` to map hero slide IDs to queue tracks (including album tracks).

### Updated: `AudioV2PublisherScreen.tsx`

- Replaced simplified static hero with `AudioV2PublisherHero`.
- Added `heroIndex` state + hero play/pause integration with `useAudioV2Player`.
- Moved تشغيل الكل / عشوائي / أكمل to a compact row under the hero card.

---

## Warnings

- Hero dot tap only switches slide (same as classic publisher page); user must tap play to start audio.
- Share count uses seeded local display count; repost remains `localStorage`-backed until public profile social layer ships.

---

## Errors

None.

---

## Recommendations

1. Manual QA on `/audiov2/$publisherId` with a publisher that has multiple `heroContentIds`.
2. Verify like/repost/QR in non-preview mode with a signed-in user.
3. Optional: auto-sync hero index when list/mini player plays a track that is in hero slides.

---

## Overall Status

**PASS**
