# Community Feed Menus & Interstitials

## Executive Summary

Implemented RTL-aligned overflow menus on posts and comments, pin-to-top for moments, and rotating engagement cards between every 2–3 posts. Production build passes.

## Findings

- **Comment header**: Avatar → name → shield on the right; verified badge in the middle; 3-dot menu (`⋮`) on the far left with edit/delete (own) or report/block (others).
- **Post header**: Same identity cluster on the right; badges + 3-dot menu on the left with pin/unpin and delete (own posts only).
- **Pin**: Stored in `localStorage` (`ab:community-pinned-moments-v1`); pinned moments sort to feed top; «مثبّت» label shown in meta.
- **Feed variety**: `buildCommunityFeedItems()` inserts 5 rotating interstitial types (prayer counter, alarm, reading, agpeya, streak) every 2–3 posts.

## Warnings

- Pin state is local-only (not synced to Supabase yet).
- Interstitial insertion uses deterministic gap (2 then 3 alternating), not random.

## Errors

None. `npm run build` exit 0.

## Recommendations

- Sync pin preferences to user profile when backend supports it.
- A/B test interstitial gap timing with analytics.

## Overall Status

**PASS**
