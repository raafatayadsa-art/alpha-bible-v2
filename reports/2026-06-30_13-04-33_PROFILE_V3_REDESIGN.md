# Alpha Profile V3 Redesign Report

## Executive Summary

Implemented the complete **Alpha Profile V3** architecture on `/profile`. The screen now reflects a calm, premium spiritual identity hub — not a social timeline. Layout follows the reference image for spacing and section order only; visual DNA remains warm ivory (`#f4ead8`) with gold accents.

## Findings

### Sections Delivered (8/8)

| # | Section | Status | Implementation |
|---|---------|--------|----------------|
| 1 | Hero | ✅ | Cover image, halo avatar, cross, tiny Alpha shield, name, @username, membership, Alpha ID |
| 2 | Membership Card | ✅ | QR, identity fields, link to `/profile/membership` |
| 3 | My Church | ✅ | Church image, name, diocese, role → `/church` |
| 4 | Friends | ✅ | Horizontal avatars, online/offline dots, suggestions, no Family section |
| 5 | Prayer Requests | ✅ | Personal `mine` requests via existing API + original `PrayerRequestCard` |
| 6 | My Collection | ✅ | Reference-based storage; renders `PremiumHorizontalPostCard` unchanged |
| 7 | My Journey | ✅ | Simple `Timeline` with seed events |
| 8 | More | ✅ | Settings, Privacy, Support, Church Directory, About Alpha |

### New Module Structure

```
src/features/profile/
  components/ProfileV3Screen.tsx
  components/ProfileHeroV3.tsx
  components/ProfileMembershipCardV3.tsx
  components/ProfileMyChurch.tsx
  components/ProfileFriends.tsx
  components/ProfilePrayerSection.tsx
  components/ProfileCollection.tsx
  components/ProfileJourney.tsx
  components/ProfileMore.tsx
  profile-collection-storage.ts
  profile-member.ts
  profile-seed.ts
  types.ts
```

### Shared Extraction

- `src/features/prayer/PrayerRequestCard.tsx` — original prayer card design shared with community screen

### Constraints Honored

- No gamification (XP, streaks, achievements, coins, levels)
- No social timeline / create post
- No Family on public profile
- No Share button in profile
- Warm ivory background preserved (reference dark theme not imported)
- Bottom navigation preserved

## Warnings

- Friends, journey, and member context use **seed/demo data** until backend friends graph ships
- Collection uses **localStorage references** — sync to Supabase not yet wired
- Prayer profile section shows requests with `mine: true` flag; full approval workflow UI pending server-side filter
- `addChurchPostToProfile()` helper exists but "Add to My Profile" action not yet hooked on church posts app-wide

## Errors

None. `npm run build` passes.

## Recommendations

1. Wire `addChurchPostToProfile` from church post menus
2. Add Supabase `profile_collection_refs` table for cross-device sync
3. Replace `PROFILE_MEMBER_DEMO` with live auth + church membership API
4. Add `/profile/friends` route for "View All Friends"
5. Optionally refactor `prayer-requests.tsx` to use shared `PrayerRequestCard`

## Overall Status

**PASS** — Profile V3 layout and architecture implemented per spec.
