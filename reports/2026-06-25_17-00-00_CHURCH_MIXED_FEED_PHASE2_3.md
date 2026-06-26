# Church Mixed Feed — Phase 2 & 3

**Date:** 2026-06-25  
**Scope:** Meetings widget, dedupe prayer UI, public directory feed, public type routes

---

## Executive Summary

Continued the church feed redesign: **meetings/liturgy widget** from real posts, **removed duplicate** prayer & mock meetings sections from `/church`, and added **public mixed feed** on directory detail pages with routes `/church/directory/$placeId/posts/$type`.

---

## Findings

| Area | Result |
|------|--------|
| `ChurchFeedMeetingsWidget` from real `meeting`/`liturgy` posts | ✅ |
| Meetings widget injected in mixed feed (`id=church-meetings` for quick nav) | ✅ |
| Removed `UpcomingMeetings` + `PrayerRequestsCard` from `/church` layout | ✅ |
| Prayer widget remains inside mixed feed only | ✅ |
| `ChurchPublicFeedSection` on `/church/directory/$placeId` (after hero) | ✅ |
| Public type hub `/church/directory/$placeId/posts/$type` | ✅ |
| `ChurchFeedNavContext` (member vs public navigation) | ✅ |
| `ChurchMixedFeedList` shared renderer | ✅ |
| `npm run build` | ✅ PASS |

---

## Warnings

1. Dead code remains in `church.tsx` (`Coverflow`, `PremiumPostCard`, `UpcomingMeetings` functions) — safe to delete in cleanup pass.
2. Public visitors see posts if Supabase RLS allows `church_posts` read — verify production policies.
3. `ChurchCommunityHubLink` still points members to `/church` hub — unchanged.

---

## Errors

None.

---

## Recommendations

1. Delete unused post card / Coverflow block from `church.tsx` (~800 lines).
2. Collapse directory info cards into tabs so feed stays above fold on mobile.
3. Sync post interactions to Supabase for cross-device engagement.

---

## Overall Status

**PASS**
