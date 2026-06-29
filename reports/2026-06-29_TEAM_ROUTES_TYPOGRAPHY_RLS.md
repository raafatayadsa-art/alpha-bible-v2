# Team Routes Fix + Typography + RLS Report

**Date:** 2026-06-29

---

## Executive Summary

Fixed admin team card navigation (عرض · تعديل · صلاحيات), enlarged Alpha Control typography, and added SQL for RLS/security on admin team tables. Build **PASS**.

---

## Findings

### Root cause — buttons not working
`/platform/team/$memberId` and `/permissions` are **child routes** but parent `platform.team.tsx` rendered only `<AlphaTeamScreen />` without `<Outlet />`. Navigation changed URL but screen never switched. **تفعيل** worked because it uses `onClick`, not routing.

### Fixes
- `platform.team.tsx` — list OR `<Outlet />` (same pattern as approvals)
- `platform.team.$memberId.tsx` — detail OR `<Outlet />` for permissions
- Team buttons use `<Link>` instead of `navigate()`
- Route permissions: member detail = `team.view`, permissions = `team.view` OR `team.permissions`

### Typography
- Base shell `15px`, bolder inputs/buttons/chips
- Mission sub-titles, PrivacyStrip, CyberSearch, CyberBtn enlarged

### Security SQL
- `RUN_ADMIN_TEAM_RLS_SECURITY.sql` — RLS + deny direct on all admin team tables + `platform_owners`, RPC grants only

---

## Warnings

Run in Supabase (if not already):
1. `RUN_SOLE_FOUNDER_ALPHA_COPTIC.sql`
2. `RUN_ADMIN_TEAM_RLS_SECURITY.sql`
3. `RUN_ADMIN_TEAM_FRIEND_AVATAR.sql` (if friend-admin needed)

---

## Errors

None in build.

---

## Overall Status

**PASS**
