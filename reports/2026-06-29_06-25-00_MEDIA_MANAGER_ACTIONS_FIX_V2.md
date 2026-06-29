# Media Manager Actions — Silent Failure Fix (V2)

**Date:** 2026-06-29  
**Scope:** Approve / Reject / Set Primary / Delete not persisting in Media Manager

---

## Executive Summary

Root cause: **Supabase RLS can block UPDATE/DELETE with zero rows affected and no error**. The client treated that as success, so buttons appeared to do nothing. Fixed with post-write verification, owner access preflight, clearer Arabic errors, and SQL hardening.

---

## Findings

| Issue | Impact |
|-------|--------|
| Direct `.update()` / `.delete()` without `.select()` | Silent failure when RLS blocks write |
| RPC error → fallback to direct write | Same silent failure masked as `ok: true` |
| No owner preflight on screen load | User unaware of missing `platform_owners` row |
| Approve button only enabled for `pending` | Re-approve from rejected tab impossible |
| `approved_by = uuid` vs text column | Possible type mismatch on approve RPC |

---

## Fixes Applied

### Client (`media-manager-api.ts`)
- `checkMediaManagerAccess()` — calls `is_platform_owner` RPC on load
- `verifyMediaRow()` — confirms status / primary / delete after every action
- Fallback direct writes only when RPC function **missing** (not on owner errors)
- All direct writes use `.select()` to detect 0-row updates
- Arabic error mapping for `not_platform_owner`, missing RPC, `media_not_found`

### UI
- Gold warning banner when owner access check fails
- Approve enabled for pending + rejected; label adapts
- Action errors shown in panel + page banner

### SQL (`RUN_MEDIA_LIBRARY_OWNER_ACTIONS.sql`)
- `approved_by = uid::text` for type safety
- Storage delete wrapped in exception handler (row delete still succeeds)
- Verification query for RPC functions at end of RUN file

---

## Warnings

1. **Must run on Supabase SQL Editor (once):**  
   `supabase/RUN_MEDIA_LIBRARY_OWNER_ACTIONS.sql`
2. **Must be logged in** with Supabase Auth (not PIN-only Alpha Control session).
3. **User UUID must exist** in `platform_owners`:
   ```sql
   insert into platform_owners (user_id) values ('YOUR-AUTH-UUID')
   on conflict do nothing;
   ```

---

## Errors

None during build.

---

## Recommendations

1. Re-run `RUN_MEDIA_LIBRARY_OWNER_ACTIONS.sql` on production.
2. Confirm your auth user in `platform_owners`.
3. Open Media Manager — if gold banner appears, follow its message.
4. Test: pending image → قبول → moves to Approved tab.

---

## Overall Status

**PARTIAL** — Code fix complete (PASS build); requires Supabase SQL + owner row on remote
