# Publisher Public Page Redesign — Audio Parity

**Date:** 2026-06-24  
**Scope:** Full visual/layout redesign of public publisher page to match Audio screen DNA

---

## Executive Summary

Rebuilt the public publisher page (`PublisherPublicPageView`) with an audio-style hero carousel, dynamic content rows, and conditional sections that only appear when the publisher has uploaded matching content types. Added local continue-listening and favorites for the publisher context.

---

## Findings

### Layout (new)

| Section | Behavior |
|---------|----------|
| Hero carousel | Swipeable dots; top hymns by engagement; play/pause + waveform; follow/like/share/QR chrome |
| Quick jump pills | Only sections with content |
| أكمل الاستماع | From localStorage when user played audio |
| المفضلة | User-favorited items on this publisher page |
| ترانيم مختارة | Horizontal ranked cards with play + favorite |
| الألبومات | Circular cover row → album detail |
| قوائم التشغيل | Tall cards like Audio FeaturedPlaylists |
| فيديوهات / محاضرات / كتب / مقالات | Shown **only if** publisher has that content kind |
| حول الناشر | Bio + contact when available |

### Removed

- Tab bar (`PUBLISHER_PUBLIC_TABS`) — replaced by dynamic rows
- Flat list `ContentCard` layout

### New files

- `src/features/publisher/publisher-public-content.ts` — grouping + hero slide picker
- `src/features/publisher/publisher-local-prefs.ts` — continue + favorites per publisher

### Updated routes

- `publisher.$publisherId.tsx` — `#F4EEE6` background, narrow width, Alpha back navigation
- `publisher.preview.$publisherId.tsx` — same shell for preview mode

---

## Warnings

- Continue listening and favorites are **local-only** (localStorage) until a global audio library sync exists.
- Hero play requires `mediaUrl` on hymn items; albums without linked audio show cover-only hero.

---

## Errors

- None detected in lint pass.

---

## Recommendations

1. Hard refresh after pull.
2. Test with a publisher that has hymns + albums + videos but no books — verify books/lectures rows hidden.
3. Future: wire favorites/continue to Supabase user prefs for cross-device sync.

---

## Overall Status

**PASS** — UI redesign complete; conditional sections verified in code.

---

## Changed files

- `src/features/publisher/components/PublisherPublicPageView.tsx`
- `src/features/publisher/publisher-public-content.ts` (new)
- `src/features/publisher/publisher-local-prefs.ts` (new)
- `src/routes/publisher.$publisherId.tsx`
- `src/routes/publisher.preview.$publisherId.tsx`
