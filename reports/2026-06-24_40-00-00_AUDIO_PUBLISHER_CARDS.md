# Audio Screen — Publisher Cards (Choir / Hymn Teams)

**Date:** 2026-06-24  
**Scope:** `/audio` publisher cards with follow, likes, listens  
**Overall Status:** PASS

---

## Executive Summary

Replaced the small circular «trusted teams» strip with **full publisher cards** on `/audio`. Each published choir/hymn team (`hymn_team`, `choir`, `church_service`) appears as a card with logo, name, type, **follow button**, **page likes**, and **listen count** (aggregated from approved audio content engagement).

---

## Findings

### UI — `/audio`

| Element | File |
|---------|------|
| Section «الكورالات والمرنمون» | `AudioPublishersSection.tsx` |
| Card (image, name, follow, stats) | `AudioPublisherCard.tsx` |
| Screen wiring | `AudioScreen.tsx` |

### Card contents

- **صورة + اسم** — logo or cover
- **نوع** — كورال / فريق ترانيم / خدمة كنسية
- **زر متابعة** — `togglePublisherFollow` (works in-card)
- **إعجاب** — `publisher.likes_count` (page likes)
- **استماع** — sum of `likes_count` on approved public hymns/albums/playlists/lectures
- **Tap card** → `/publisher/{id}`

### API

- `fetchAudioPublisherFeed()` in `publisher-discovery-api.ts`
- Shows **all** published public audio publishers (not trusted-only)
- Ordered: trusted first, then followers

### Removed

- `TrustedTeamsStrip` from main audio flow (file kept, unused)

---

## Warnings

- **Listen count** is currently **engagement proxy** (sum of content likes), not play events
- Migration `20250624310000_publisher_listen_count.sql` prepared but **not applied** (Smart Mode block) — apply later for real play tracking
- Cards appear only when publisher is `published + is_public`

---

## Errors

None in linter on touched files.

---

## Recommendations

1. Apply `listen_count` migration + `increment_publisher_listen` on audio play
2. Optional: like button on card (currently display-only for likes)
3. Refresh card stats after follow without full reload

---

## Overall Status

**PASS**
