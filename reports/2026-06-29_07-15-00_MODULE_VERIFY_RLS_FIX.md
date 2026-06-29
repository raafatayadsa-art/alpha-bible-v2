# Module Save — "لم يُعثر على صفوف الموديولات بعد الحفظ" Fix

**Date:** 2026-06-29

---

## Executive Summary

The save RPC wrote rows successfully, but post-save **verify used direct SELECT** which returned empty due to RLS. Fixed by trusting batch RPC response, adding `platform_verify_modules` + `platform_fetch_modules` security-definer RPCs, and restoring open SELECT policy.

---

## Findings

- Error `لم يُعثر على صفوف الموديولات بعد الحفظ` came from `verifyModuleWritesDb()` direct `.from("platform_modules").select()`.
- Writes via `platform_save_modules` (security definer) succeeded; client SELECT saw 0 rows.

---

## Fixes

**Client:** Skip verify when batch RPC ok; verify via `platform_verify_modules` RPC; `fetchModules` / public fetch use `platform_fetch_modules` RPC first.

**SQL:** `20260629170000_platform_modules_read_verify_rpc.sql`

---

## Action Required

Run in Supabase SQL Editor:

`supabase/RUN_PLATFORM_MODULES_READ_VERIFY.sql`

Then hard refresh app and test module save.

---

## Overall Status

**PARTIAL** — requires one SQL apply
