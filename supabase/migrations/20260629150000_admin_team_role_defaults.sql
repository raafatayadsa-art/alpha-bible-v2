-- Role default permissions + delta save + reset RPC
-- Founder = all permissions via admin_is_hidden_owner

delete from public.admin_role_permissions;

insert into public.admin_role_permissions (role_key, permission_key)
select 'admin', p.key
from public.admin_permissions p
where p.key in (
  'users.view', 'posts.view', 'posts.approve', 'content.view', 'churches.view',
  'community.moderate', 'reports.view', 'analytics.view', 'team.view'
)
on conflict do nothing;

insert into public.admin_role_permissions (role_key, permission_key)
select 'super_admin', p.key
from public.admin_permissions p
where p.key in (
  'users.view', 'users.edit', 'posts.view', 'posts.approve', 'posts.delete',
  'content.view', 'content.edit', 'content.publish', 'churches.view', 'churches.manage',
  'community.moderate', 'community.delete', 'notifications.send', 'reports.view',
  'analytics.view', 'security.audit_log', 'team.view', 'team.invite', 'team.edit',
  'team.disable', 'team.permissions'
)
on conflict do nothing;

create or replace function public.admin_role_fetch_defaults(p_role_key text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb := '{}'::jsonb;
  p record;
  role_has boolean;
begin
  if p_role_key not in ('admin', 'super_admin') then
    raise exception 'invalid_role';
  end if;

  if not public.admin_is_hidden_owner() and not public.admin_has_permission('team.permissions') then
    raise exception 'forbidden';
  end if;

  for p in select key from public.admin_permissions order by sort_order loop
    select exists (
      select 1 from public.admin_role_permissions arp
      where arp.role_key = p_role_key and arp.permission_key = p.key
    ) into role_has;
    result := result || jsonb_build_object(p.key, coalesce(role_has, false));
  end loop;

  return result;
end;
$$;

revoke all on function public.admin_role_fetch_defaults(text) from public;
grant execute on function public.admin_role_fetch_defaults(text) to authenticated;

create or replace function public.admin_team_set_permissions(p_id uuid, p_permissions jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  k text;
  v boolean;
  role_k text;
  role_has boolean;
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

  for k in select jsonb_object_keys(p_permissions) loop
    v := coalesce((p_permissions ->> k)::boolean, false);

    select exists (
      select 1 from public.admin_role_permissions arp
      where arp.role_key = role_k and arp.permission_key = k
    ) into role_has;

    if v is distinct from coalesce(role_has, false) then
      insert into public.admin_user_permissions (admin_user_id, permission_key, granted)
      values (p_id, k, v)
      on conflict (admin_user_id, permission_key) do update set granted = excluded.granted;
    end if;
  end loop;

  perform public.admin_log_activity(
    'team.permissions',
    'admin_user',
    p_id::text,
    null,
    p_permissions
  );

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.admin_team_set_permissions(uuid, jsonb) from public;
grant execute on function public.admin_team_set_permissions(uuid, jsonb) to authenticated;

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
