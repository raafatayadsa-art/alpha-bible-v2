# Profile & Discover Members Redesign

## Executive Summary

Redesigned `/profile` into a clean section-based layout (YouVersion-style clarity, Alpha DNA preserved). Added new screen **اكتشف أعضاء Alpha** at `/community/discover` with search, tabs, friend requests, and member preview sheet.

## Findings

### Profile (`/profile`)
- **Header:** Large avatar, name, Alpha ID, church, affiliation badge, edit button only (no settings)
- **Shield:** Shown only when affiliation is `approved`
- **نشاطي:** Single card — badges, streak, completed reading plans, achievement points
- **حياتي الكنسية:** كنيستي · العائلة · الأشخاص المتصلون → discover
- **أنشطتي:** الرحلات السابقة · الحجوزات (module-gated)
- **بطاقة العضوية:** Only when `approved`

### Discover (`/community/discover`)
- Tabs: مقترحون · من كنيستي · أصدقاء أصدقائي · أعضاء جدد
- Search by name / Alpha ID
- Add → `alpha_send_connection_request` → pending → connected states
- Tap row → `CommunityMemberQuickSheet`
- Data: church dashboard contacts with `user_id` + connection status from Supabase

### New files
- `profile-membership-status.ts`, `ProfileSimpleHeader.tsx`, `ProfileMyActivityCard.tsx`, `ProfileSectionList.tsx`, `ProfileMembershipEntryCard.tsx`, `ProfileAccentIcon.tsx`, `useProfileActivitySummary.ts`
- `discover-members-api.ts`, `useDiscoverMembers.ts`, `DiscoverMemberRow.tsx`, `DiscoverMembersScreen.tsx`, `community.discover.tsx`

## Warnings

- Discover list depends on church dashboard contacts having linked `user_id`; roles without user accounts are excluded
- Mutual friends count is estimated until dedicated RPC exists
- Search by Alpha ID uses existing `resolvePersonFromCode` (limited server lookup)

## Errors

None — `npm run build` PASS

## Recommendations

- Add RPC `alpha_discover_members` for global search + mutual friends
- Wire horizontal «أعضاء جدد» carousel in discover tab
- Deep link from community FAB to `/community/discover`

## Overall Status

**PASS**
