# Platform Owner Bootstrap

**Date:** 2026-06-29  
**Issue:** Media Manager shows "حسابك غير مسجّل كمالك في platform_owners"

---

## Executive Summary

The logged-in Supabase Auth user is not in `platform_owners`. Added `RUN_PLATFORM_OWNER_BOOTSTRAP.sql` and in-app SQL snippet with the user's UUID for one-click copy in Media Manager.

---

## Findings

- `is_platform_owner()` checks `platform_owners.user_id` against `auth.uid()`.
- Alpha Control PIN does **not** replace Supabase Auth login.
- Table: `platform_owners(user_id uuid PK, label text, created_at)`.

---

## Warnings

- Run SQL in **Supabase Dashboard → SQL Editor** (not in the app).
- Use the same account you use to log into Alpha Bible.

---

## Errors

None.

---

## Recommendations

### Fastest fix (by email)

1. Open Supabase → SQL Editor.
2. Open `supabase/RUN_PLATFORM_OWNER_BOOTSTRAP.sql`.
3. Replace `YOUR_EMAIL@example.com` with your login email.
4. Run the `OPTION A` insert block.
5. Refresh Media Manager in the app.

### Or by UUID

Media Manager now shows a ready-made `INSERT` with your `user_id` — copy and Run in SQL Editor.

### Verify

```sql
select public.is_platform_owner();  -- should be true when logged in as that user
```

---

## Overall Status

**PASS** — bootstrap SQL + UI helper added; user must run SQL once on Supabase
