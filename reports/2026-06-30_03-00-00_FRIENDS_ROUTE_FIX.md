# Friends Route & Suggested Buttons Fix

## Executive Summary

Fixed friends screen opening «مجتمعي» instead of `/community/friends` by adding `<Outlet />` to the `/community` parent route. Improved suggested-friend card touch targets (overflow clip + z-index).

## Findings

### Root cause — wrong screen on friends navigation
- `/community/friends`, `/community/add-friend`, etc. are **child routes** of `/community`.
- `community.tsx` always rendered `CommunityScreen` (مجتمعي) with **no `<Outlet />`**, so child routes never mounted.
- Fix: hub layout pattern (same as `/profile/church`) — show `CommunityScreen` only on exact `/community`, else `<Outlet />`.

### Suggested buttons not responding
- Outer card used `overflow-hidden`, clipping X dismiss and shrinking click area.
- Added `touch-manipulation`, higher z-index, `stopPropagation` on add/dismiss.
- `FriendsHubPills` now uses `navigate()` for explicit routing.

## Warnings

- Friend request RPC may still fail server-side; buttons now fire correctly client-side.

## Errors

- None. Build: **PASS**.

## Recommendations

- QA `/community/discover` and `/community/add-friend` after deploy — same parent fix applies.

## Overall Status

**PASS**
