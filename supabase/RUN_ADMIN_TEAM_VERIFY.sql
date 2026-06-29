-- Verify admin team + community RPCs after running deploy scripts.
-- Expected: all checks return at least one row with ok = true.

-- 1) Core admin RPCs exist
select
  proname as name,
  true as ok
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and proname in (
    'admin_fetch_my_team_role',
    'admin_has_permission',
    'admin_team_set_permissions',
    'admin_team_reset_permissions',
    'admin_accept_invite',
    'admin_invite_preview',
    'alpha_send_connection_request',
    'alpha_respond_connection_request'
  )
order by proname;

-- 2) RLS enabled on admin tables
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'admin_users',
    'admin_roles',
    'admin_permissions',
    'admin_role_permissions',
    'admin_user_permissions',
    'admin_invites',
    'admin_activity_logs',
    'platform_owners'
  )
order by c.relname;

-- 3) alpha_identities ready for member lookup
select
  exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'alpha_identities'
  ) as alpha_identities_table,
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'alpha_identities'
      and policyname = 'alpha_identities_lookup_by_id'
  ) as lookup_policy;

-- 4) Founder bootstrap hint (replace email if needed)
select
  po.user_id,
  au.email,
  au.role_key,
  au.status
from public.platform_owners po
left join public.admin_users au on au.auth_user_id = po.user_id
left join auth.users u on u.id = po.user_id
where u.email = 'alpha.coptic@proton.me'
limit 1;
