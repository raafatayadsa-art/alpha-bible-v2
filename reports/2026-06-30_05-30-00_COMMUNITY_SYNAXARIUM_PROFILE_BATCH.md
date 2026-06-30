# Community UI + Synaxarium + Profile Avatar Batch

## Executive Summary

Implemented multi-area UX: مجتمعي avatar +/X chips, post card shield/badges/tap-to-source, church setup hub link, synaxarium 10-saint pagination, profile avatar cross removal.

## Findings

- **CommunityPersonAvatarChip**: + on avatar (quick add), X on top (remove/dismiss), gold «أضف صديق» below for suggestions.
- **CommunityPeopleSuggestions**: Friends get X to remove; suggestions get + and dismiss; tap avatar → member sheet.
- **CommunityCardBadges**: موثّق + post type icon in one horizontal row.
- **CommunityMomentCard**: Shield visible on name; tap post body → source route (church post / bible / agpeya / prayer).
- **CommunityHubLinks**: Added «تأسيس كنيسة» → `/profile/church/setup`.
- **Synaxarium**: Initial 10 saints, «تحميل المزيد» +10 per tap; resets on category change.
- **ProfileCopticAvatarFrame**: Removed crown cross and mini crosses from frame.

## Warnings

- Moment source without `churchPostId` falls back to `/church` for prayer shares.

## Errors

- None. Build: **PASS**.

## Recommendations

- Track pending friend state on suggestion chips after send.

## Overall Status

**PASS**
