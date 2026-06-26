# Church Mixed Feed — Phase 1

**Date:** 2026-06-25  
**Scope:** Replace Coverflow with mixed feed + per-type post hub pages

---

## Executive Summary

Implemented **Phase 1** of the church page feed redesign: removed the Coverflow carousel on `/church`, added a **mixed vertical feed** (one preview card per post type + prayer widget), new **type hub routes** at `/church/posts/$type`, and redesigned post cards (lab-inspired side-by-side layout with like / comment / share and live badge).

---

## Findings

| Area | Result |
|------|--------|
| Coverflow removed from `ChurchPostsFeed` | ✅ |
| Mixed feed composer (`pickLatestPerType` + prayer widget injection) | ✅ |
| `ChurchMixedPostCard` — side image, type badge, interactions | ✅ |
| Route `/church/posts/$type` for all 10 `PostType` values | ✅ |
| Hub tap → type page; type page tap → `/church/post/$id` | ✅ |
| Newest-first after pinned (`createdAt` on `ChurchPost`) | ✅ |
| Live badge on `event` + بث/مباشر text | ✅ |
| `npm run build` | ✅ PASS |

---

## Warnings

1. **Prayer widget** also appears in existing `PrayerRequestsCard` section below — intentional overlap for Phase 1; can dedupe later.
2. **Meetings section** still uses mock `MEETINGS` data — not changed in this phase.
3. **Public directory page** still does not show posts — Phase 3 item.
4. Post interactions remain largely **local** (`post-store`) — unchanged.

---

## Errors

None.

---

## Recommendations

1. **Phase 2:** Deduplicate prayer UI; add meetings widget in feed when real data exists.
2. **Phase 3:** Show mixed feed preview on `/church/directory/$placeId` for visitors.
3. Consider removing dead `PremiumPostCard` / `Coverflow` code from `church.tsx` in a cleanup pass.

---

## Overall Status

**PASS**

---

## Files Touched

- `src/features/church-mixed-feed/*` (new module)
- `src/routes/church.posts.$type.tsx` (new route)
- `src/routes/church.tsx` — wire `ChurchMixedFeedSection`
- `src/data/church-posts.ts` — `createdAt`
- `src/features/church/church-posts-api.ts` — map `createdAt`
- `src/features/church/use-church-posts.ts` — sort pinned + newest
