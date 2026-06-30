# Friends UI Reference Redesign

## Executive Summary

Redesigned profile friends section and add-friends / friends screens to match Facebook-style reference images: hub pills, horizontal suggestion cards with X dismiss on avatar and «أضف صديق» button below, full list layout on add-friends screen, and clear navigation to `/community/friends` and `/community/add-friend`.

## Reference Analysis

### Image 1 — Profile friends strip
- Two top pills: **أصدقاء** | **أضف أصدقاء**
- Section title: **أشخاص قد تعرفهم**
- Horizontal cards: avatar + **X dismiss** (top-left), name, subtitle, gray **أضف صديق** button (not + on avatar corner)

### Image 2 — Add friends full screen
- Header **أضف أصدقاء** with **X close** (top-right in RTL)
- Search bar
- Tabs: **أشخاص قد تعرفهم** | **معلق**
- List rows: **إضافة** (left) · name/role (center) · avatar (right)
- Bottom red **مشاركة ملفي الشخصي** with QR icon

## Findings

- **`FriendsHubPills`**: Links to `/community/friends` and `/community/add-friend` with friend count badge.
- **`SuggestedFriendCard`**: X on avatar, tap photo → member shield sheet, «أضف صديق» below card.
- **`ProfileSuggestedFriendsSection`**: Reference layout; removed internal tabs/carousel-only discover link.
- **`CommunityFriendsScreen`**: X close → profile/back; list rows avatar-right; add-friend shortcut.
- **`CommunityAddFriendScreen`**: X close, reference list layout, member sheet on avatar tap, share profile CTA.
- **`useDismissedFriendSuggestions`**: Persists hidden suggestions (localStorage).
- Removed obsolete `SuggestedMemberAvatar` (+ overlay).

## Warnings

- Friends screens require **community module** enabled on profile section.
- Dismiss is local-only (not synced to server).

## Errors

- None. Build: **PASS**.

## Recommendations

- Add mutual-friends count when API supports it (reference subtitle).
- Sync dismissed suggestions to user preferences in Supabase.

## Overall Status

**PASS**
