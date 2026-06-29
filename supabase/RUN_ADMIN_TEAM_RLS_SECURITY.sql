-- Admin team tables: RLS + deny direct access + RPC grants only
-- Run in Supabase SQL Editor after:
--   1) RUN_ADMIN_TEAM_MANAGEMENT.sql
--   2) RUN_PLATFORM_SHIELD_FOUNDER.sql (or section 0 below)
--   3) RUN_ADMIN_TEAM_ROLE_DEFAULTS.sql (optional but recommended)
--   4) RUN_SOLE_FOUNDER_ALPHA_COPTIC.sql

-- ---------------------------------------------------------------------------
-- 0) Shield role RPC (if not created by RUN_PLATFORM_SHIELD_FOUNDER.sql)
-- ---------------------------------------------------------------------------
create or replace function public.admin_fetch_my_team_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select au.role_key
  from public.admin_users au
  where au.auth_user_id = auth.uid()
    and au.status = 'active'
  limit 1;
$$;

revoke all on function public.admin_fetch_my_team_role() from public;
grant execute on function public.admin_fetch_my_team_role() to authenticated;

-- ---------------------------------------------------------------------------
-- 1) platform_owners — no direct client access
-- ---------------------------------------------------------------------------
alter table if exists public.platform_owners enable row level security;

revoke all on table public.platform_owners from anon, authenticated;

drop policy if exists platform_owners_deny_direct on public.platform_owners;
create policy platform_owners_deny_direct
  on public.platform_owners for all to anon, authenticated
  using (false) with check (false);

-- ---------------------------------------------------------------------------
-- 2) Admin team tables — RPC-only (deny all direct reads/writes)
-- ---------------------------------------------------------------------------
alter table if exists public.admin_roles enable row level security;
alter table if exists public.admin_permissions enable row level security;
alter table if exists public.admin_role_permissions enable row level security;
alter table if exists public.admin_users enable row level security;
alter table if exists public.admin_user_permissions enable row level security;
alter table if exists public.admin_invites enable row level security;
alter table if exists public.admin_activity_logs enable row level security;

revoke all on table public.admin_roles from anon, authenticated;
revoke all on table public.admin_permissions from anon, authenticated;
revoke all on table public.admin_role_permissions from anon, authenticated;
revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.admin_user_permissions from anon, authenticated;
revoke all on table public.admin_invites from anon, authenticated;
revoke all on table public.admin_activity_logs from anon, authenticated;

drop policy if exists admin_roles_deny_direct on public.admin_roles;
create policy admin_roles_deny_direct
  on public.admin_roles for all to anon, authenticated using (false) with check (false);

drop policy if exists admin_permissions_deny_direct on public.admin_permissions;
create policy admin_permissions_deny_direct
  on public.admin_permissions for all to anon, authenticated using (false) with check (false);

drop policy if exists admin_role_permissions_deny_direct on public.admin_role_permissions;
create policy admin_role_permissions_deny_direct
  on public.admin_role_permissions for all to anon, authenticated using (false) with check (false);

drop policy if exists admin_users_deny_direct on public.admin_users;
create policy admin_users_deny_direct
  on public.admin_users for all to anon, authenticated using (false) with check (false);

drop policy if exists admin_user_permissions_deny_direct on public.admin_user_permissions;
create policy admin_user_permissions_deny_direct
  on public.admin_user_permissions for all to anon, authenticated using (false) with check (false);

drop policy if exists admin_invites_deny_direct on public.admin_invites;
create policy admin_invites_deny_direct
  on public.admin_invites for all to anon, authenticated using (false) with check (false);

drop policy if exists admin_activity_logs_deny_direct on public.admin_activity_logs;
create policy admin_activity_logs_deny_direct
  on public.admin_activity_logs for all to anon, authenticated using (false) with check (false);

-- ---------------------------------------------------------------------------
-- 2b) Reset member permissions to role template (required by UI button)
-- ---------------------------------------------------------------------------
create or replace function public.admin_team_reset_permissions(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  role_k text;
begin
  if not public.admin_has_permission('team.permissions') then
    raise exception 'forbidden';
  end if;

  select role_key into role_k from public.admin_users where id = p_id;
  if role_k is null then raise exception 'not_found'; end if;

  if role_k = 'super_admin' and not public.admin_is_hidden_owner() then
    raise exception 'forbidden_super_admin';
  end if;

  delete from public.admin_user_permissions where admin_user_id = p_id;

  perform public.admin_log_activity(
    'team.permissions_reset',
    'admin_user',
    p_id::text,
    null,
    jsonb_build_object('role_key', role_k)
  );

  return jsonb_build_object('ok', true, 'role_key', role_k);
end;
$$;

revoke all on function public.admin_team_reset_permissions(uuid) from public;
grant execute on function public.admin_team_reset_permissions(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 3) RPC execute grants (correct names & signatures)
-- ---------------------------------------------------------------------------
grant execute on function public.admin_is_hidden_owner(uuid) to authenticated;
grant execute on function public.admin_has_permission(text, uuid) to authenticated;
grant execute on function public.admin_current_team_user_id(uuid) to authenticated;
grant execute on function public.admin_fetch_my_permissions() to authenticated;
grant execute on function public.admin_fetch_my_team_role() to authenticated;
grant execute on function public.admin_team_list() to authenticated;
grant execute on function public.admin_team_get(uuid) to authenticated;
grant execute on function public.admin_team_invite(text, text, text, text, text, text) to authenticated;
grant execute on function public.admin_team_set_status(uuid, text) to authenticated;
grant execute on function public.admin_team_update(uuid, text, text, text, text, text) to authenticated;
grant execute on function public.admin_team_get_permissions(uuid) to authenticated;
grant execute on function public.admin_team_set_permissions(uuid, jsonb) to authenticated;
grant execute on function public.admin_team_reset_permissions(uuid) to authenticated;
grant execute on function public.admin_accept_invite(text) to authenticated;
grant execute on function public.admin_invite_preview(text) to anon, authenticated;
grant execute on function public.admin_log_activity(text, text, text, jsonb, jsonb, text, text) to authenticated;
grant execute on function public.is_platform_owner(uuid) to authenticated;
grant execute on function public.platform_my_owner_profile() to authenticated;

-- Optional — only after RUN_ADMIN_TEAM_FRIEND_AVATAR.sql
do $$
begin
  grant execute on function public.admin_team_add_friend_admin(uuid, text) to authenticated;
exception
  when undefined_function then null;
end $$;

-- Optional — only after RUN_ADMIN_TEAM_ROLE_DEFAULTS.sql
do $$
begin
  grant execute on function public.admin_role_fetch_defaults(text) to authenticated;
exception
  when undefined_function then null;
end $$;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- 4) Verify RLS enabled
-- ---------------------------------------------------------------------------
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'platform_owners',
    'admin_roles',
    'admin_permissions',
    'admin_role_permissions',
    'admin_users',
    'admin_user_permissions',
    'admin_invites',
    'admin_activity_logs'
  )
order by c.relname;
