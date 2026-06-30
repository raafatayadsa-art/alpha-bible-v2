# Profile Avatar & Header Polish

## Executive Summary

Implemented profile avatar UX improvements: larger Coptic frame with new crown cross and photo backdrop, tap-to-preview member card (with/without shield), suggested-friends add button on avatar, and header action bar (back right / edit left in RTL).

## Findings

- **ProfileCopticAvatarFrame**: Photo enlarged 140px → 175px (+25%), frame 168px → 210px. Added layered radial/conic photo backdrop. Replaced top `CopticCross` with new `CopticCrownCross` (double-bar ornate terminals + jewel dots). Avatar is now clickable via `onClick`.
- **ProfileSelfPreviewSheet** (new): Bottom sheet on own avatar tap. Shows shield badge only for approved church members; otherwise card with privacy-respected fields visible to "everyone" viewer (name, alpha ID, affiliation, optional church/bio/birth).
- **ProfileSimpleHeader**: Top bar — `BackButton` (physical right) + compact edit link (physical left). Removed centered edit button below affiliation badge.
- **ProfileSuggestedFriendsSection**: Green `+` overlay on suggested friend avatars; tap avatar opens `CommunityMemberQuickSheet`, tap `+` sends friend request.
- **CommunityMemberQuickSheet**: Shield badge hidden when `shieldRole` is null; subtitle adapts accordingly.

## Warnings

- Self-preview shows fields as visible to **everyone** — not church/friends-only tiers. This matches "public preview" intent but may differ from what church friends see.
- `/profile` is a bottom-nav root; back button navigates to `/home` when no history.

## Errors

- None. Production build: **PASS**.

## Recommendations

- Manually verify RTL header placement on device (safe area + thumb reach).
- Consider a "viewer tier" toggle in self-preview (everyone / church / friends) in a future pass.

## Overall Status

**PASS**
