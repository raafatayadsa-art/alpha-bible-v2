# Module Save Failure Fix

**Date:** 2026-06-29  
**Issue:** "تعذّر حفظ التغييرات في قاعدة البيانات" on module save

---

## Executive Summary

Root cause: `platform_modules` table on Supabase is **empty** (`[]` rows). UI showed defaults from local merge, but DB writes failed because the old `platform_toggle_module` RPC raised "module not found" and anon lacked direct INSERT/UPDATE on empty rows. Fixed with security-definer seed + batch save RPCs and client fallback chain.

---

## Findings

1. Remote `platform_modules` SELECT returns empty array — no seeded rows.
2. Old RPC only UPDATEs existing rows; fails on empty table.
3. Client verify step could fail after partial success.
4. `supabase db push` blocked locally by corrupt `.env.local`.

---

## Warnings

- **User must run SQL on Supabase** once: `supabase/RUN_PLATFORM_MODULES_SAVE_FIX.sql` in SQL Editor.
- Until SQL runs, save may still fail with explicit Arabic message pointing to migration.

---

## Errors

- None in `npm run build` (PASS).

---

## Recommendations

1. Run `RUN_PLATFORM_MODULES_SAVE_FIX.sql` in Supabase Dashboard → SQL Editor.
2. Confirm 13 module rows appear in `platform_modules`.
3. Toggle a module → Save → hard refresh → state should persist.

---

## Code Changes

- `platform-api.ts`: `ensureModulesSeededDb`, `platform_save_modules` batch RPC, `asPlatformBool`, upsert `onConflict`
- `platform-store.ts`: seed on boot, richer save error return
- `module-control-screen.tsx`: show specific error text
- Migration: `20260629130000_platform_modules_seed_and_save.sql`

---

## Overall Status

**PARTIAL** — code ready; requires one-time Supabase SQL apply
