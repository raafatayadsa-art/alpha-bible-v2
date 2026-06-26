# AudioV2 — Videos Tab + Alpha Button DNA

**Date:** 2026-06-24  
**Scope:** فيديوهات + أزرار Alpha المعتمدة في AudioV2

---

## Executive Summary

Extended AudioV2 with a **فيديو** tab and inline video player panel. Replaced Spotify-green styling with Alpha DNA: gold play, purple gradient, ivory glass mini player, follow chip parity with publisher hero.

---

## Videos — How It Works

| Tab | Behavior |
|-----|----------|
| **فيديو** | List of publisher `video` items with poster + native `<video controls>` panel |
| **الكل** | Audio list + **فيديوهات** section below |
| **ترانيم / ألبومات** | Audio only |

- Tap video → pauses audio queue → **AudioV2VideoPanel** fixed above bottom nav
- Close video → returns to audio mini player
- Videos use `mediaUrl` from `publisher_content_items` (same as classic publisher page)

---

## Alpha Button DNA

| Control | Style |
|---------|--------|
| تشغيل الكل | Gold gradient (`AlphaV2GoldButton`) |
| عشوائي / ثانوي | Ivory border purple text |
| أكمل | Purple gradient (`AlphaV2PrimaryButton`) |
| متابعة | Blue chip (`AlphaV2FollowChip`) — publisher hero parity |
| Hero | `gold-glow` + cover — matches public publisher hero |
| Mini player | `glass-card` ivory — not dark Spotify bar |

---

## Files

- `audio-v2-chrome.tsx` — shared Alpha buttons
- `build-audio-v2-tracks.ts` — `buildAudioV2Videos`, tab `videos`
- `AudioV2VideoPanel.tsx` — inline video player
- `AudioV2PublisherScreen.tsx` — 4 tabs, Alpha styling
- `AudioV2MiniPlayer.tsx` — ivory ledger mini player

---

## Warnings

- Video progress not saved to «أكمل الاستماع» (audio-only pref today).
- Preview route shows unapproved videos; public route approved only.

---

## Errors

Build: **PASS**

---

## Recommendations

1. Test publisher with video content on `/audiov2/preview/$id`.
2. Optional: video continue-watch in a later phase.

---

## Overall Status

**PASS**
