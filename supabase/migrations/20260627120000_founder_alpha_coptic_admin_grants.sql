-- Founder bootstrap (alpha.coptic@proton.me) + admin team table privileges (RPC-only access)

-- ---------------------------------------------------------------------------
-- 1) Register founder in platform_owners
-- ---------------------------------------------------------------------------
do $$
declare
  founder_id uuid;
begin
  select u.id into founder_id
  from auth.users u
  where lower(u.email) = lower('alpha.coptic@proton.me')
  limit 1;

  if founder_id is null then
    raise exception
      'User not found: alpha.coptic@proton.me — create the account in the app first, then re-run this migration.';
  end if;

  insert into public.platform_owners (user_id, label)
  values (founder_id, 'المؤسس')
  on conflict (user_id) do update set label = excluded.label;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2) Tighten platform_owners RLS (remove open dev policy)
-- ---------------------------------------------------------------------------
alter table public.platform_owners enable row level security;

drop policy if exists platform_owners_dev_all on public.platform_owners;
drop policy if exists platform_owners_read_self on public.platform_owners;

create policy platform_owners_read_self
  on public.platform_owners for select to authenticated
  using (auth.uid() = user_id);

-- Writes only via SQL Editor / service role (no client INSERT/UPDATE/DELETE)

-- ---------------------------------------------------------------------------
-- 3) Admin team tables — revoke direct API access; RPC-only (security definer)
-- ---------------------------------------------------------------------------
revoke all on table public.admin_roles from anon, authenticated;
revoke all on table public.admin_permissions from anon, authenticated;
revoke all on table public.admin_role_permissions from anon, authenticated;
revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.admin_user_permissions from anon, authenticated;
revoke all on table public.admin_invites from anon, authenticated;
revoke all on table public.admin_activity_logs from anon, authenticated;

alter table public.admin_roles enable row level security;
alter table public.admin_permissions enable row level security;
alter table public.admin_role_permissions enable row level security;
alter table public.admin_users enable row level security;
alter table public.admin_user_permissions enable row level security;
alter table public.admin_invites enable row level security;
alter table public.admin_activity_logs enable row level security;

-- Explicit deny for PostgREST roles (documents intent in Supabase dashboard)
drop policy if exists admin_roles_deny_direct on public.admin_roles;
create policy admin_roles_deny_direct
  on public.admin_roles for all to anon, authenticated
  using (false) with check (false);

drop policy if exists admin_permissions_deny_direct on public.admin_permissions;
create policy admin_permissions_deny_direct
  on public.admin_permissions for all to anon, authenticated
  using (false) with check (false);

drop policy if exists admin_role_permissions_deny_direct on public.admin_role_permissions;
create policy admin_role_permissions_deny_direct
  on public.admin_role_permissions for all to anon, authenticated
  using (false) with check (false);

drop policy if exists admin_users_deny_direct on public.admin_users;
create policy admin_users_deny_direct
  on public.admin_users for all to anon, authenticated
  using (false) with check (false);

drop policy if exists admin_user_permissions_deny_direct on public.admin_user_permissions;
create policy admin_user_permissions_deny_direct
  on public.admin_user_permissions for all to anon, authenticated
  using (false) with check (false);

drop policy if exists admin_invites_deny_direct on public.admin_invites;
create policy admin_invites_deny_direct
  on public.admin_invites for all to anon, authenticated
  using (false) with check (false);

drop policy if exists admin_activity_logs_deny_direct on public.admin_activity_logs;
create policy admin_activity_logs_deny_direct
  on public.admin_activity_logs for all to anon, authenticated
  using (false) with check (false);

notify pgrst, 'reload schema';
