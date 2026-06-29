# Community Mobile Display Fix — `/community`

**Date:** 2026-06-27  
**Scope:** Mobile cannot open/show مجتمعي screen  
**Overall Status:** PASS

---

## Executive Summary

Fixed mobile «مجتمعي» not appearing/opening due to platform module gating (stale cache + loading blocker), unstable React snapshots, and feed sync gaps. Build passes.

---

## Findings

### 1. Module gate hid community on mobile (critical)

- Stale `localStorage` cache could mark `community` disabled → dock tab hidden + redirect to `/home`.
- `PlatformModuleGate` showed full-screen «جاري التحميل…» while modules fetched — on slow mobile felt like broken blank screen.

**Fix:**
- `community` + `bible` in `ALWAYS_ENABLED_MODULE_KEYS`
- Module cache bumped to `v6` (purge v5 legacy)
- Optimistic module flags while loading (`optimisticWhileLoading`)
- Removed loading spinner blocker — render route immediately with cached flags

### 2. Unstable snapshots (crash / white screen)

- `getBlockedCommunityUserIds()` returned new array every read
- `orderMomentsWithPins()` returned new array every read when pinned
- `getSpiritualRecordSnapshot()` returned new object every read

**Fix:** Stable snapshot caches in moderation, pin-order, and spiritual-record stores.

### 3. Feed not refreshing after friends seed

**Fix:** `community-store` subscribe now listens to `COMMUNITY_FRIENDS_CHANGED`.

---

## Warnings

- Users with very old app cache should refresh once; v6 cache key auto-purges v5 on boot.

---

## Errors

None. `npm run build` exit 0.

---

## Recommendations

1. On phone: tap **مجتمعي** in bottom dock → `/community` loads with feed.
2. If still empty: pull-to-refresh or clear site data once.
3. Verify home card **مجتمعي** also opens `/community`.

---

## Overall Status

**PASS**
