-- Live dashboard counts from real tables (platform control home)

create or replace function public.platform_live_dashboard_stats()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'users', (select count(*)::int from auth.users),
    'churches', (select count(*)::int from public.churches where is_active = true),
    'priests', (
      select count(*)::int from public.church_memberships
      where status = 'active' and (is_priest = true or coalesce(role, '') ilike '%priest%')
    ),
    'servants', (
      select count(*)::int from public.church_memberships
      where status = 'active' and coalesce(is_priest, false) = false
    ),
    'messages', (select count(*)::int from public.alpha_connect_messages),
    'requests', (select count(*)::int from public.platform_approvals where status = 'pending'),
    'reports', (
      select count(*)::int from public.platform_reports
      where status in ('open', 'reviewing')
    ),
    'locations_verified', (
      select count(*)::int from public.churches
      where is_active = true and location_verified = true
    )
  );
$$;

revoke all on function public.platform_live_dashboard_stats() from public;
grant execute on function public.platform_live_dashboard_stats() to anon, authenticated;

comment on function public.platform_live_dashboard_stats() is
  'Platform control dashboard — live counts from production tables';
