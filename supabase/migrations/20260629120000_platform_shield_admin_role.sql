-- Platform shield: admin team role lookup + founder bootstrap

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

-- Ensure founder email is registered as platform owner
insert into public.platform_owners (user_id, label)
select u.id, 'المؤسس'
from auth.users u
where lower(u.email) = lower('alpha.coptic@proton.me')
on conflict (user_id) do update set label = excluded.label;

notify pgrst, 'reload schema';
