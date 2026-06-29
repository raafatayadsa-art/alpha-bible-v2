# Discover & Profile Phase 2 — Continuation

**Date:** 2026-06-29  
**Scope:** اكتشف أعضاء Alpha — carousel, Alpha ID lookup, FAB link, quick sheet RPC

---

## Executive Summary

Continued the profile/discover redesign with four focused improvements: real Alpha ID lookup via `alpha_identities`, a horizontal «أعضاء جدد» carousel, FAB deep-link to `/community/discover`, and server-side friend requests from the member quick sheet. Production build **PASS**.

---

## Findings

| Area | Change |
|------|--------|
| Alpha ID search | New `lookupUserByAlphaCode()` queries `alpha_identities` + `user_profiles` |
| `resolvePersonFromCode` | Removed demo/pravatar fallbacks; returns `null` if not found |
| Discover data | Enriched with church contacts, friends-of-friends, recent church members, real avatars, mutual friend counts |
| Carousel | `DiscoverNewMembersCarousel` shows up to 8 new members above the list |
| FAB | «اكتشف أعضاء» links to `/community/discover` instead of local add sheet |
| Quick sheet | Uses `alpha_send_connection_request` when `userId` is a real UUID |

### New files

- `src/features/identity/alpha-identity-lookup.ts`
- `src/features/community/DiscoverNewMembersCarousel.tsx`

### Modified files

- `src/features/profile/profile-people-resolve.ts`
- `src/features/community/discover-members-api.ts`
- `src/features/community/useDiscoverMembers.ts`
- `src/features/community/DiscoverMembersScreen.tsx`
- `src/features/community/CommunityActionFab.tsx`
- `src/features/community/CommunityMemberQuickSheet.tsx`
- `src/features/community/CommunityScreen.tsx`

---

## Warnings

- Alpha ID lookup requires `alpha_identities` rows in Supabase; users without identity records won't appear in search.
- `church_memberships.church_id` type is numeric in generated types; `resolveActiveChurchId` returns string — cast applied for recent-members query.
- Friends-of-friends and mutual counts depend on `alpha_connect_contacts` RLS allowing scoped reads.
- `/community/add-friend` still uses local store for some flows; discover uses RPC.

---

## Errors

None during build (`npm run build` — PASS).

---

## Recommendations

1. Run `RUN_MISSING_TABLES.sql` / identity migrations if Alpha ID search returns empty in production.
2. Optional RPC `alpha_discover_members` for server-side ranking at scale.
3. Migrate `CommunityAddFriendScreen` to RPC-only adds (align with discover).
4. Manual QA: search by Alpha ID, carousel add, FAB → discover, quick sheet from feed.

---

## Overall Status

**PASS**
