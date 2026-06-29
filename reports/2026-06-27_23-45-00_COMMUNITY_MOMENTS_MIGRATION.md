# Community Moments — Supabase Migration Applied

**Date:** 2026-06-27  
**Project:** `usflbjlyadihyitnvzya` (raafatayadsa-art's Project)  
**Migration:** `community_moments`

---

## Executive Summary

Applied community hub database migration to Supabase. Three tables with RLS are live. Fixed `church_id` type to `bigint` to match production `churches.id`.

---

## Findings

### Applied successfully

| Table | RLS |
|-------|-----|
| `community_moments` | ✅ |
| `community_moment_reactions` | ✅ |
| `community_moment_comments` | ✅ |

### Fix applied during deploy

- **First attempt failed:** `church_id uuid` incompatible with `churches.id bigint`
- **Resolved:** `church_id bigint references public.churches(id)`

### RLS policies

- Authenticated read on all three tables
- Insert own rows only (moments, reactions, comments)
- Delete own reactions only

### Client update

- `community-api.ts` — `church_id` inserted as `number` when numeric

---

## Warnings

- Existing local-only moments (pre-migration) are not auto-uploaded; new shares sync to Supabase.
- Users must be **authenticated** for remote read/write (RLS).

---

## Recommendations

1. Share a test reading from Bible reader while logged in, then open `/community` on another device/session.
2. Regenerate `database.generated.ts` when convenient for typed Supabase client.

---

## Overall Status

**PASS**
