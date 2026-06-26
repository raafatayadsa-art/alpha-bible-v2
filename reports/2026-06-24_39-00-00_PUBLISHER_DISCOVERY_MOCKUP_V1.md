# Publisher Discovery & Album Flow — Mockup Implementation v1

**Date:** 2026-06-24  
**Scope:** Audio/Library discovery hubs, album detail, upload wizard, follow  
**Overall Status:** PARTIAL

---

## Executive Summary

Implemented **Phase 1–3** of the publisher platform mockup with Alpha design DNA: `/audio` wired to live publisher feeds, new `/library` hub, album detail page with tracklist, 5-step album upload wizard in workspace, and functional follow button. Static demo sections remain as fallback when no published content exists.

---

## Findings — Delivered

| Mockup Section | Implementation |
|----------------|----------------|
| **1 — الصوتيات** | `TrustedTeamsStrip` + `LatestAlbumsSection` on `/audio` from DB |
| **2 — صفحة فريق** | Enhanced `PublisherPublicPageView`: follow, album links |
| **3 — صفحة الألبوم** | `/publisher/$id/album/$contentId` + `PublisherAlbumDetailView` |
| **4 — إضافة ألبوم** | `PublisherAddContentSheet` + `PublisherAlbumWizard` (5 steps) |
| **5 — المكتبة** | `/library` + `LibraryHubScreen` |
| **6 — صفحة مكتبة** | Same public publisher page (tabs: كتب، مقالات…) |
| **Follow** | `publisher_page_follows` + `toggle_publisher_page_follow` RPC |

### New files

- `src/features/publisher/publisher-discovery-api.ts`
- `src/features/publisher/publisher-follow-api.ts`
- `src/features/publisher/publisher-content-payload.ts`
- `src/features/publisher/publisher-api-internals.ts`
- `src/features/publisher/components/PublisherAlbumWizard.tsx`
- `src/features/publisher/components/PublisherAddContentSheet.tsx`
- `src/features/publisher/components/PublisherAlbumDetailView.tsx`
- `src/features/audio/components/TrustedTeamsStrip.tsx`
- `src/features/audio/components/LatestAlbumsSection.tsx`
- `src/features/library/LibraryHubScreen.tsx`
- `src/routes/library.tsx`
- `src/routes/publisher.$publisherId.album.$contentId.tsx`
- `supabase/migrations/20250624300000_publisher_follows.sql` (applied)

### Routes

| Path | Purpose |
|------|---------|
| `/audio` | Trusted teams + latest albums (live) |
| `/library` | Trusted libraries + latest books |
| `/publisher/$id/album/$contentId` | Album detail + tracklist |

---

## Findings — Still Open

| Item | Notes |
|------|-------|
| **7 — كتب tabs** (الأحدث/الأكثر قراءة) | Not implemented — books list on library hub only |
| **8 — محاضرات tabs** | Basic lecture cards on publisher page only |
| **Hero carousel** on `/audio` | Still static `HeroCard` — could promote featured album |
| **Global search** | Publishers not indexed |
| **Download analytics** | No read/download counters yet |
| **Album "Listen All" queue** | Opens first track only |

---

## Warnings

- Discovery requires **published + public** publishers with **approved + public** content
- Album wizard requires **approved hymns** before track selection
- Default content visibility on submit changed to `public` for discovery feed
- Follow requires authenticated user

---

## Errors

None in linter on touched publisher/audio/library files.

---

## Recommendations

1. Promote featured album in `HeroCard` from `fetchDiscoveryContent`
2. Add book detail route mirroring album pattern
3. Wire lectures section with audio/video tabs on publisher page
4. Add `/library` entry in nav hub or home card

---

## Overall Status

**PARTIAL** — Core mockup flows live with Alpha styling; polish tabs, hero, and search remain.
