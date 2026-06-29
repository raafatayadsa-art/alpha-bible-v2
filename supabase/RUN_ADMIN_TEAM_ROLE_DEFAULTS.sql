-- Role default permissions: admin & super_admin templates
-- Founder (platform_owners / admin_is_hidden_owner) = ALL permissions always
-- Run after RUN_ADMIN_TEAM_MANAGEMENT.sql

-- ---------------------------------------------------------------------------
-- 1) Reseed role → permission templates
--    Founder-only keys (never in role defaults):
--      users.delete, security.sessions, settings.manage, ai.manage
-- ---------------------------------------------------------------------------
delete from public.admin_role_permissions;

insert into public.admin_role_permissions (role_key, permission_key)
select 'admin', p.key
from public.admin_permissions p
where p.key in (
  'users.view',
  'posts.view',
  'posts.approve',
  'content.view',
  'churches.view',
  'community.moderate',
  'reports.view',
  'analytics.view',
  'team.view'
)
on conflict do nothing;

insert into public.admin_role_permissions (role_key, permission_key)
select 'super_admin', p.key
from public.admin_permissions p
where p.key in (
  'users.view',
  'users.edit',
  'posts.view',
  'posts.approve',
  'posts.delete',
  'content.view',
  'content.edit',
  'content.publish',
  'churches.view',
  'churches.manage',
  'community.moderate',
  'community.delete',
  'notifications.send',
  'reports.view',
  'analytics.view',
  'security.audit_log',
  'team.view',
  'team.invite',
  'team.edit',
  'team.disable',
  'team.permissions'
)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 2) Fetch role template (for UI / debugging)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 3) Save member permissions — store only overrides vs role default
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 4) Reset member to role template (founder or team.permissions)
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
-- 5) On role change — drop per-user overrides so new role template applies
-- ---------------------------------------------------------------------------
create or replace function public.admin_team_update(
  p_id uuid,
  p_full_name text default null,
  p_username text default null,
  p_phone text default null,
  p_avatar_url text default null,
  p_role_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  before_j jsonb;
  after_j jsonb;
  cur_role text;
begin
  if not public.admin_has_permission('team.edit') then raise exception 'forbidden'; end if;

  select row_to_json(au)::jsonb, au.role_key into before_j, cur_role
  from public.admin_users au where au.id = p_id;

  if before_j is null then raise exception 'not_found'; end if;

  if cur_role = 'super_admin' and not public.admin_is_hidden_owner() then
    raise exception 'forbidden';
  end if;

  if p_role_key is not null and p_role_key not in ('super_admin', 'admin') then
    raise exception 'invalid_role';
  end if;

  if p_role_key is not null and p_role_key is distinct from cur_role then
    delete from public.admin_user_permissions where admin_user_id = p_id;
  end if;

  update public.admin_users au set
    full_name = coalesce(nullif(trim(p_full_name), ''), au.full_name),
    username = coalesce(nullif(trim(p_username), ''), au.username),
    phone = case when p_phone is not null then nullif(trim(p_phone), '') else au.phone end,
    avatar_url = case when p_avatar_url is not null then nullif(trim(p_avatar_url), '') else au.avatar_url end,
    role_key = coalesce(p_role_key, au.role_key),
    updated_at = now()
  where au.id = p_id;

  select row_to_json(au)::jsonb into after_j from public.admin_users au where au.id = p_id;

  perform public.admin_log_activity('team.update', 'admin_user', p_id::text, before_j, after_j);

  return jsonb_build_object('ok', true, 'member', after_j);
end;
$$;

revoke all on function public.admin_team_update(uuid, text, text, text, text, text) from public;
grant execute on function public.admin_team_update(uuid, text, text, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 6) Verify templates
-- ---------------------------------------------------------------------------
select
  ar.key as role_key,
  ar.label_ar,
  count(arp.permission_key) as default_permission_count
from public.admin_roles ar
left join public.admin_role_permissions arp on arp.role_key = ar.key
group by ar.key, ar.label_ar
order by ar.key;

select
  p.key as founder_only_permission,
  not exists (
    select 1 from public.admin_role_permissions arp where arp.permission_key = p.key
  ) as excluded_from_all_roles
from public.admin_permissions p
where p.key in ('users.delete', 'security.sessions', 'settings.manage', 'ai.manage')
order by p.key;

notify pgrst, 'reload schema';
