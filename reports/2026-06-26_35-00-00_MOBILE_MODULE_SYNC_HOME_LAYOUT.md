# Mobile Module Sync + Home Layout Reorder

**Date:** 2026-06-26  
**Status:** PASS

---

## Executive Summary

Fixed platform module locks not applying on mobile (stale cache + optimistic loading). Moved **«اكتشف رحلتك اليوم»** directly under the hero stack on home.

---

## Findings

### Mobile module bug — root causes
1. `optimisticWhileLoading` treated **all** modules as enabled until Supabase fetch finished (slow on mobile).
2. Stale `localStorage` cache (`v4`) kept old `enabled: true` after owner toggles on another device.
3. No background refresh when returning to the app on phone.

### Fixes
| Change | Effect |
|--------|--------|
| Removed optimistic loading | Disabled modules hidden immediately from cache |
| Cache bumped to `v5` + legacy purge | Old all-enabled caches invalidated |
| `PlatformModulesBootstrap` in `__root` | Pulls DB on boot, focus, visibility, every 45s |
| Default module states from `OWNER_MODULE_DEFAULTS` | Safer fallback when row missing |
| `merge` uses `remote != null` for `enabled` | Missing key ≠ enabled |

### Home layout
Order is now: **Hero → اكتشف رحلتك اليوم → Smart Context → الخولاجي → …**
Empty journey/daily rows hidden when all cards filtered by module lock.

---

## Warnings

- First paint may briefly use last cache until fetch completes (~1s on mobile).
- Hard refresh once after deploy clears old `v4` cache.

---

## Recommendations

1. On phone: lock a module in Platform Control → wait up to 45s or switch app tab and return.
2. Optional: Supabase Realtime on `platform_modules` for instant sync.

---

## Errors

None. Build PASS.
