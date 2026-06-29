# Owner Access Model — PIN vs Supabase vs Assistants

**Date:** 2026-06-29  
**Scope:** Remove Media Manager SQL banner; clarify owner registration

---

## Executive Summary

Removed the in-screen SQL warning from Media Manager. Platform access uses **two layers**: PIN for UI shell, Supabase `platform_owners` for server writes. First founder can auto-claim when the owners table is empty.

---

## Findings

### Two layers (current design)

| Layer | What | How |
|-------|------|-----|
| **UI gate** | Alpha Control screens | 6-digit **PIN** (default `000000`, changeable in Settings) |
| **Server gate** | Media, modules, DB actions | Supabase Auth login + row in **`platform_owners`** |

PIN alone does **not** approve media or save modules — it only unlocks the console UI.

### Owner registration paths

1. **First founder (automatic)** — if `platform_owners` is empty, entering Alpha Control while logged into Supabase calls `platform_claim_first_owner`.
2. **By email (manual, once)** — `RUN_PLATFORM_OWNER_BOOTSTRAP.sql` OPTION A in SQL Editor.
3. **Additional founders** — same SQL file; only existing owners add others via Supabase.

### Assistants (planned, not shipped for platform)

| Role | Scope | Status |
|------|-------|--------|
| **Founder / Owner** | Full Alpha Control | `platform_owners` |
| **Platform assistant** | Media, approvals, modules (subset) | Future `platform_operators` table |
| **Publisher assistant** | One publisher page only | Already exists (`publisher` team) |

---

## Warnings

- Must be **logged into Alpha with Supabase** (not guest) for server owner claim.
- Run once on Supabase: `RUN_PLATFORM_OWNER_BOOTSTRAP.sql` (includes `platform_claim_first_owner`).
- If owners table already has another user, auto-claim will not run — use email SQL for your account.

---

## Errors

None (build pending).

---

## Recommendations

For user `c1398191-a6e1-4b1f-9573-aed647ee4660` (from screenshot):

```sql
insert into public.platform_owners (user_id, label)
values ('c1398191-a6e1-4b1f-9573-aed647ee4660'::uuid, 'Founder')
on conflict (user_id) do update set label = excluded.label;
```

Or replace email in OPTION A of `RUN_PLATFORM_OWNER_BOOTSTRAP.sql`.

---

## Overall Status

**PASS** — banner removed; owner model documented
