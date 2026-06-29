# Community Screen Fix — `/community`

**Date:** 2026-06-28 00:37:36  
**Scope:** Fix broken community hub screen (`المجتمع الكنسي`)  
**Overall Status:** PASS

---

## Executive Summary

The community screen was failing at runtime due to an infinite re-render loop in `useSyncExternalStore` snapshots. Secondary UI bugs (`meta.labelAr`, unsafe post type meta) were also fixed. Production build passes after the patch.

---

## Findings

1. **Primary crash — unstable `useSyncExternalStore` snapshots**  
   `listCommunityMoments`, `getCommunityComments`, and `getCommunityReactions` returned new array/object references on every `getSnapshot()` call. React treats each call as a state change → infinite render loop → white screen / error boundary.

2. **UI bug — wrong property on church highlight cards**  
   `CommunityScreen` used `POST_TYPE_META[post.type].labelAr`, but `POST_TYPE_META` only defines `label`. Display showed blank type text.

3. **Defensive gaps**  
   - No fallback when `POST_TYPE_META[post.type]` is missing (could crash on `meta.tone`).  
   - Remote/local moments with invalid `kind` could break `COMMUNITY_KIND_META` lookups.  
   - `fetchCommunityRemote` treated non-table errors as success and set `remoteAvailable = true`.

---

## Warnings

- `remoteAvailable` may still remain `false` for the session if an early fetch hit a missing table before migration; user must refresh after deploy (unchanged behavior, low risk now that migration is applied).
- RLS requires authentication for remote feed reads; logged-out users see local feed only.

---

## Errors

- None after fix. Build exit code: **0**.

---

## Recommendations

1. Manually verify `/community` on device: open from bottom dock, toggle filters, view church highlights if member of a church.
2. Share a verse/prayer and confirm moment card renders with reactions.
3. Optional: regenerate Supabase types for `community_moments` tables.

---

## Changes Applied

| File | Change |
|------|--------|
| `src/features/community/community-store.ts` | Snapshot caching + cache invalidation on notify; stable empty reactions; filter invalid moment kinds |
| `src/features/community/community-api.ts` | Auth/query error handling; filter invalid kinds; stable empty reactions |
| `src/features/community/CommunityScreen.tsx` | `labelAr` → `label`; safe meta fallback |

---

## Overall Status

**PASS** — Community screen should load without infinite re-render crash.
