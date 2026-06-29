# Admin Team RLS & Role Defaults Report

**Date:** 2026-06-29  
**Scope:** RLS security fix, role default permissions, founder-only full access

---

## Executive Summary

Fixed `RUN_ADMIN_TEAM_RLS_SECURITY.sql` (wrong RPC signatures/names). Added `RUN_ADMIN_TEAM_ROLE_DEFAULTS.sql` with explicit **admin** and **super_admin** permission templates. **Founder** (`admin_is_hidden_owner` / `alpha.coptic@proton.me`) retains **all** permissions. UI: reset-to-role-defaults button on permissions screen.

---

## Findings

### RLS (`RUN_ADMIN_TEAM_RLS_SECURITY.sql`)
- RLS enabled + deny-all policies on: `platform_owners`, `admin_roles`, `admin_permissions`, `admin_role_permissions`, `admin_users`, `admin_user_permissions`, `admin_invites`, `admin_activity_logs`
- Creates `admin_fetch_my_team_role()` if missing
- Corrected grants:
  - `admin_has_permission(text, uuid)` (was `text` only)
  - `admin_team_set_permissions(uuid, jsonb)` (was `admin_team_save_permissions`)
  - `admin_accept_invite(text)` (was `admin_team_accept_invite`)
  - `admin_invite_preview(text)` (was `admin_team_preview_invite`)
- Optional grants wrapped in `DO` blocks for friend-admin and role-default RPCs

### Role defaults (`RUN_ADMIN_TEAM_ROLE_DEFAULTS.sql`)

| Role | Default permissions count | Notes |
|------|---------------------------|-------|
| **admin** | 9 | View/moderate operational areas + `team.view` |
| **super_admin** | 21 | Team management + content/churches/security audit |
| **founder** | ALL (25) | Via `admin_is_hidden_owner` bypass — not stored in role table |

**Founder-only** (never in role templates):
- `users.delete`
- `security.sessions`
- `settings.manage`
- `ai.manage`

### Permission logic
- New members inherit role template automatically (no `admin_user_permissions` rows)
- Founder toggles open/close per member; only **deltas** vs role default are stored
- `admin_team_reset_permissions` clears overrides → back to role template
- Changing member role clears overrides → new role template applies
- Only founder can edit **super_admin** permissions (existing rule preserved)

### Frontend
- `AlphaTeamPermissionsScreen`: "إعادة لصلاحيات الدور الافتراضية" button
- `admin-team-api.ts`: `resetAdminTeamPermissions()`

---

## Warnings

1. **Run SQL in Supabase** — changes are in repo files; database must be updated manually:
   1. `RUN_ADMIN_TEAM_MANAGEMENT.sql` (if not already)
   2. `RUN_PLATFORM_SHIELD_FOUNDER.sql`
   3. `RUN_SOLE_FOUNDER_ALPHA_COPTIC.sql`
   4. `RUN_ADMIN_TEAM_ROLE_DEFAULTS.sql`
   5. `RUN_ADMIN_TEAM_RLS_SECURITY.sql`
   6. `RUN_ADMIN_TEAM_FRIEND_AVATAR.sql` (optional)

2. `RUN_ADMIN_TEAM_ROLE_DEFAULTS.sql` **deletes and reseeds** `admin_role_permissions` — existing role templates are replaced.

3. Members with saved permission overrides keep overrides until reset or role change.

---

## Errors

None in local build.

---

## Recommendations

1. Log in as `alpha.coptic@proton.me` to verify full Alpha Control access.
2. Open team member → صلاحيات → toggle permissions → save → verify.
3. Use "إعادة لصلاحيات الدور الافتراضية" to confirm role template restore.
4. Confirm non-founder super_admin cannot edit another super_admin's permissions.

---

## Overall Status

**PASS** (code + SQL ready; Supabase apply pending user action)
