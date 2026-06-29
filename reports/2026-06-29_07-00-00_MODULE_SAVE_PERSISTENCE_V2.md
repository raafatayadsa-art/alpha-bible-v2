# Module Save Persistence Fix v2

**Date:** 2026-06-29  
**Issue:** Module save still fails after Supabase SQL was applied

---

## Executive Summary

Fixed client-side save pipeline bugs: stale React state baseline, false-negative verify using merged defaults, cache desync between `ab:mc-modules` and public module cache, and improved DB verify + error messages. Added SQL patch for `false` boolean parsing in `platform_save_modules` and PostgREST schema reload.

---

## Root Causes Found

1. **Verify after save** compared against `mergeOwnerModuleStates(fetchModules())` — missing DB rows fell back to default `enabled: true`, causing false "verify failed" errors.
2. **Changes baseline** used React `modules` state (could be stale) instead of `readModulesCache()` at save time.
3. **`ab:platform-modules` sync** re-read `ab:mc-modules` instead of public cache — bootstrap could desync owner UI from DB.
4. **SQL** `platform_save_modules` could mis-parse `enabled: false` in edge cases.
5. **PostgREST** may need `notify pgrst, 'reload schema'` after creating RPCs.

---

## Client Fixes

- `saveModulesDb`: raw `verifyModuleWritesDb()` on changed keys only
- `saveModules`: baseline from `readModulesCache()`, persist draft + `syncPlatformModulesFromServer()`
- Platform store: public-cache sync on `ab:platform-modules`
- Clearer Arabic/technical error messages

---

## Required Supabase Step (if already ran old SQL)

Run in SQL Editor:

`supabase/migrations/20260629160000_platform_save_modules_boolean_fix.sql`

Or re-run end of `RUN_PLATFORM_MODULES_SAVE_FIX.sql` (includes `notify pgrst`).

Verify:
```sql
select key, enabled from public.platform_modules order by key;
```

---

## Overall Status

**PARTIAL** — apply boolean-fix SQL if not yet run; then retest save + hard refresh
