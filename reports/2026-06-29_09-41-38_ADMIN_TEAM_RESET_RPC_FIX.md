# Admin Team Reset RPC Fix

## Executive Summary

`admin_team_reset_permissions` was missing on Supabase (only in `RUN_ADMIN_TEAM_ROLE_DEFAULTS.sql` which was not run). Added inline creation to `RUN_ADMIN_TEAM_RLS_SECURITY.sql` and standalone `RUN_ADMIN_TEAM_RESET_RPC.sql` for immediate apply.

## Findings

- PostgREST error: function not in schema cache = RPC never created or cache not reloaded
- UI reset button calls `supabase.rpc("admin_team_reset_permissions", { p_id })`

## Warnings

Run SQL on Supabase; repo changes alone do not create the function in production DB.

## Errors

User-reported: `Could not find the function public.admin_team_reset_permissions(p_id) in the schema cache`

## Recommendations

1. Run `supabase/RUN_ADMIN_TEAM_RESET_RPC.sql` in SQL Editor (fastest)
2. Or re-run updated `RUN_ADMIN_TEAM_RLS_SECURITY.sql`
3. For full role templates also run `RUN_ADMIN_TEAM_ROLE_DEFAULTS.sql`
4. Hard-refresh app after `notify pgrst, 'reload schema'`

## Overall Status

**PARTIAL** — fix ready in repo; **user must run SQL on Supabase**
