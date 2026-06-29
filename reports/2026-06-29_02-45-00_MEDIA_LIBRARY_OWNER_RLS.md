# Media Library Owner RLS — Migration Result

**Date:** 2026-06-29  
**Migration:** `20260629023000_media_library_owner_rls.sql`  
**Production:** Applied via Supabase  
**Build:** PASS  
**Overall Status:** PASS

---

## Executive Summary

Applied platform-owner RLS so **Media Manager** actions (Approve · Reject · Set Primary · Delete) work for authenticated users listed in `platform_owners`. Added `is_platform_owner()` helper and fixed audit-log insert column mapping in the API.

---

## Findings

### Before
- `media_library` had SELECT (approved / own pending) + INSERT only.
- No UPDATE/DELETE policies → Media Manager writes silently failed under RLS.

### After
| Policy | Operation | Who |
|--------|-----------|-----|
| `media_library_owner_select` | SELECT all rows | `is_platform_owner()` |
| `media_library_owner_update` | UPDATE | `is_platform_owner()` |
| `media_library_owner_delete` | DELETE | `is_platform_owner()` |
| `alpha_media_owner_delete` | storage DELETE | owner on `alpha-media` |
| `alpha_media_owner_update` | storage UPDATE | owner on `alpha-media` |

### Function
- `public.is_platform_owner(uuid)` — `security definer`, checks `platform_owners.user_id`.

### API fix
- `rejectMediaItem` now writes to `platform_audit_log` using columns `action`, `admin`, `reason`, `scan_meta` (was invalid columns).

---

## Warnings

1. User must exist in `platform_owners` **and** be logged into Supabase Auth (not PIN-only session).
2. Rejection reason stored in audit log only — `media_library` has no `rejection_reason` column.

---

## Errors

None during migration apply or build.

---

## Recommendations

1. Ensure your auth user UUID is in `platform_owners`.
2. Test full flow on `/platform/media-manager` while authenticated.
3. Optional: add `rejection_reason` column to `media_library` in a future phase.

---

## Overall Status

**PASS**
