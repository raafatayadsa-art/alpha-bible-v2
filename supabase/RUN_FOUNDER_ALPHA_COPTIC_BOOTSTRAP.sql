-- ═══════════════════════════════════════════════════════════════════════════
-- Alpha Bible — Founder + Admin Table Privileges
-- Run in Supabase Dashboard → SQL Editor (postgres / service role)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Founder email: alpha.coptic@proton.me
-- Prerequisite: account must exist in auth.users (sign up in app once)
--
-- Also run RUN_ADMIN_TEAM_MANAGEMENT.sql first if team tables/RPCs are missing.

-- ---------------------------------------------------------------------------
-- STEP 0 — Confirm auth user exists
-- ---------------------------------------------------------------------------
select id, email, created_at
from auth.users
where lower(email) = lower('alpha.coptic@proton.me');

-- If empty → sign up in the app with alpha.coptic@proton.me, then re-run.

-- ---------------------------------------------------------------------------
-- STEP 1 — Register as platform founder (hidden owner — full Alpha Control)
-- ---------------------------------------------------------------------------
insert into public.platform_owners (user_id, label)
select u.id, 'المؤسس'
from auth.users u
where lower(u.email) = lower('alpha.coptic@proton.me')
on conflict (user_id) do update set label = excluded.label;

-- ---------------------------------------------------------------------------
-- STEP 2 — Tighten platform_owners RLS (no open client writes)
-- ---------------------------------------------------------------------------
alter table public.platform_owners enable row level security;

drop policy if exists platform_owners_dev_all on public.platform_owners;
drop policy if exists platform_owners_read_self on public.platform_owners;

create policy platform_owners_read_self
  on public.platform_owners for select to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- STEP 3 — Admin team tables: REVOKE direct access + explicit deny RLS
--          (all mutations go through security definer RPCs)
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

-- ---------------------------------------------------------------------------
-- STEP 4 — Verify founder + owner RPC
-- ---------------------------------------------------------------------------
select
  po.user_id,
  po.label,
  u.email,
  public.is_platform_owner(po.user_id) as is_owner,
  public.admin_is_hidden_owner(po.user_id) as is_hidden_owner
from public.platform_owners po
join auth.users u on u.id = po.user_id
where lower(u.email) = lower('alpha.coptic@proton.me');

-- Expected: one row, is_owner = true, is_hidden_owner = true

-- ---------------------------------------------------------------------------
-- STEP 5 — Verify admin table policies (optional)
-- ---------------------------------------------------------------------------
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename like 'admin_%'
order by tablename, policyname;

notify pgrst, 'reload schema';
