# Publisher Hero Play & Carousel Settings

**Date:** 2026-06-24  
**Scope:** Hero play button fix, workspace hero card editor, unlimited carousel cards

---

## Executive Summary

Fixed hero play on the publisher public page by resolving playable media from hymns and albums (first track). Added publisher workspace settings to configure ordered hero cards with no maximum limit. Database migration adds `hero_content_ids` and `update_publisher_hero_cards` RPC.

---

## Findings

- Play button only checked `item.mediaUrl`; albums often store audio on linked hymn tracks in `payload`.
- Audio element was conditionally mounted and `src` comparison was fragile across slide changes.
- No publisher-controlled hero carousel; auto-pick was capped implicitly and not editable.

---

## Fixes

| Area | Change |
|------|--------|
| `publisher-content-payload.ts` | `resolveContentPlayableMedia()` + `contentHasPlayableMedia()` |
| `publisher-public-content.ts` | Config-driven `pickHeroSlides(content, publisher)` — unlimited cards |
| `PublisherPublicPageView.tsx` | Reliable play/pause, album track support, always-mounted audio |
| `PublisherHeroSheet.tsx` | Workspace UI: add, reorder, remove hero cards |
| `PublisherWorkspaceScreen.tsx` | «كروت الهيرو» hub button |
| Migration `20250625006000_publisher_hero_cards.sql` | `hero_content_ids uuid[]`, RPC applied to Supabase |

---

## Warnings

- Hero cards can include display-only items (cover without audio); play button stays hidden for those slides.
- Workspace hero editor shows all content statuses; public page still only loads approved items.

---

## Errors

None during implementation. Migration applied successfully to project `usflbjlyadihyitnvzya`.

---

## Recommendations

1. Test play on a publisher with album-only hero (tracks linked via `trackIds`).
2. From workspace → **كروت الهيرو**, add 4+ cards and verify carousel dots on public page.
3. Regenerate Supabase types if the project uses generated DB types.

---

## Overall Status

**PASS**
