-- Platform shield + founder activation
-- Run in Supabase SQL Editor after auth user alpha.coptic@proton.me exists

-- Admin team role for current session (official Alpha shield)
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

-- Founder bootstrap
insert into public.platform_owners (user_id, label)
select u.id, 'المؤسس'
from auth.users u
where lower(u.email) = lower('alpha.coptic@proton.me')
on conflict (user_id) do update set label = excluded.label;

-- Verify
select
  u.email,
  po.label,
  public.is_platform_owner(u.id) as is_owner,
  public.platform_my_owner_profile() as owner_profile
from auth.users u
left join public.platform_owners po on po.user_id = u.id
where lower(u.email) = lower('alpha.coptic@proton.me');

notify pgrst, 'reload schema';
