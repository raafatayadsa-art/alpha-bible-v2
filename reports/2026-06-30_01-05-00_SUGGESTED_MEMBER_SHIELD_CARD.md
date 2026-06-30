# Suggested Member Shield Card & Avatar Add Button

## Executive Summary

Enlarged the member preview sheet to full shield-card height with richer person data. Added reusable `SuggestedMemberAvatar` with green `+` overlay on suggested members in profile and discover carousel.

## Findings

- **CommunityMemberQuickSheet**: `maxHeight` raised from `min(42dvh,340px)` → `min(72dvh,520px)` via shared `COMMUNITY_SHIELD_SHEET_MAX_HEIGHT`. Card now shows large shield/avatar hero, name, church, Alpha ID, role, verification row, and add-friend CTA.
- **SuggestedMemberAvatar** (new): Tap photo → member card; tap `+` on avatar → send friend request.
- **ProfileSuggestedFriendsSection**: Uses shared avatar component; removed redundant text "إضافة" button below name.
- **DiscoverNewMembersCarousel**: Same avatar + overlay on new members carousel.
- **ProfileSelfPreviewSheet**: Aligned to same sheet height constant.

## Warnings

- Discover carousel still shows bottom "إضافة" button when not connected — avatar overlay is primary; bottom button retained for discover cards.

## Errors

- None. Build: **PASS**.

## Recommendations

- Unify discover card to avatar-only add if bottom button feels redundant after QA.

## Overall Status

**PASS**
