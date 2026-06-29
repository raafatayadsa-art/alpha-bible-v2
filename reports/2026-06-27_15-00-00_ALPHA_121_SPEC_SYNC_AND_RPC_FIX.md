# ALPHA-121 Spec Sync + Publisher RPC Fix

**Date:** 2026-06-27  
**Scope:** Update architecture doc, fix broken RPC, apply domain comments  
**Overall Status:** PASS

---

## Executive Summary

Synced **ALPHA-121** with production reality: published updated domain spec document, fixed `list_publisher_team_members` to join `user_profiles` instead of removed `profiles` table, and added Domain-01 table comments on Supabase.

---

## Findings

### 1. Spec document created
- **File:** `docs/ALPHA-121_DATABASE_ARCHITECTURE_V1.md`
- Added 11 previously missing production objects
- Documented Domain 01 split: `user_profiles` vs `user_identity_profiles`
- Marked `profiles` as deprecated/removed
- Marked Domain 10 as planned-only

### 2. RPC fix applied (production)
- **Migration:** `supabase/migrations/20260627140000_alpha_121_user_profiles_rpc_fix.sql`
- **Function:** `list_publisher_team_members(uuid)`
- **Change:** `LEFT JOIN public.profiles` → `LEFT JOIN public.user_profiles ON p.user_id = m.user_id`
- **Bonus:** Returns `username` field in JSON for team UI

### 3. Domain comments (Domain 01)
Applied `COMMENT ON TABLE` for:
- `user_profiles`, `user_identity_profiles`, `alpha_identities`
- `identity_documents`, `identity_access_logs`

---

## Warnings

1. Legacy migration files still reference `profiles` (historical) — new migration overrides RPC on production only.
2. `bible_dictionary` still listed as planned — not deployed.
3. Domain comments only on Domain 01 tables so far — extend to all domains in future pass.

---

## Errors

None. Migration applied successfully.

---

## Recommendations

1. Add domain comments for Domains 02–09 in a follow-up migration.
2. Deploy or remove repo-only Connect/nearby migrations not on production.
3. Wire `username` from publisher team API in frontend if team panel shows member names.

---

## Files Changed

| Path | Action |
|------|--------|
| `docs/ALPHA-121_DATABASE_ARCHITECTURE_V1.md` | Created |
| `supabase/migrations/20260627140000_alpha_121_user_profiles_rpc_fix.sql` | Created + applied |

---

## Overall Status

**PASS**
