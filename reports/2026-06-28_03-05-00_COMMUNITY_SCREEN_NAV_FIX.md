# Community Screen + «مجتمعي» Navigation Fix

**Date:** 2026-06-28  
**Scope:** Home hero/dock navigation + `/community` crash  
**Overall Status:** PASS

---

## Executive Summary

The community hub (`/community`) failed to open and the home **«مجتمعي»** button appeared broken due to (1) an infinite re-render in `useCommunityFriends`, (2) hero buttons that only shared content without navigating, and (3) profile-completion gate redirecting away from `/community`.

---

## Findings

### 1. Community screen crash (critical)

`useCommunityFriends()` used `useSyncExternalStore` with `getCommunityFriends()` returning a **new array reference** on every snapshot read (`JSON.parse` each time). React treated every read as a state change → infinite render loop → white screen / error boundary.

**Fix:** Snapshot cache in `community-friends-store.ts` + stable `EMPTY_FRIENDS` server snapshot.

### 2. Home «مجتمعي» button did not open community

`PremiumVerseHeroCard` and `CommunityDailyVerseCard` only called share APIs. On failure (guest user, invalid ref) nothing happened — no navigation.

**Fix:** Always `navigate({ to: COMMUNITY_HUB_PATH })` after optional share attempt.

### 3. Profile completion gate blocked `/community`

Authenticated users without completed username were redirected to `/identity/username` when opening `/community` from the dock — felt like a broken tab.

**Fix:** Allow `/community/*` and `/prayer-requests` during profile completion check (same as `/home`).

### 4. Journey discover card typing

`HomeJourneyDiscover` used `to={to as "/"}` which could confuse router typing for `/community`.

**Fix:** `to={to as never}` + badge label for `community` key.

---

## Warnings

- Guest users opening «مجتمعي» now land on `/community` but sharing still requires login (toast from share helper).
- Friends list still local + remote merge; crash fix does not change sync behavior.

---

## Errors

None after fix. Build exit code: **0**.

---

## Recommendations

1. Retest on device: dock **مجتمعي** → `/community` loads.
2. Retest hero **مجتمعي** chip → opens community (share if logged in).
3. Monitor for similar uncached snapshots in other `useSyncExternalStore` hooks.

---

## Files Changed

| File | Change |
|------|--------|
| `community-friends-store.ts` | Snapshot cache for stable `useSyncExternalStore` |
| `PremiumVerseHeroCard.tsx` | Navigate to community on «مجتمعي» |
| `CommunityDailyVerseCard.tsx` | Navigate to community on «مجتمعي» |
| `profile-completion-gate.tsx` | Skip redirect on community/prayer routes |
| `HomeJourneyDiscover.tsx` | Fix Link target + badge |
| `CommunityScreen.tsx` | Explicit `bootstrapCommunityFeed()` |

---

## Overall Status

**PASS**
