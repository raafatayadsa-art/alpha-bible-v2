-- Founder visibility + admin permissions fix
-- Run in Supabase SQL Editor after RUN_ADMIN_TEAM_MANAGEMENT.sql

-- ---------------------------------------------------------------------------
-- 1) Owner RPCs (idempotent)
-- ---------------------------------------------------------------------------
create or replace function public.is_platform_owner(p_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.platform_owners po
    where po.user_id = coalesce(p_user, auth.uid())
  );
$$;

revoke all on function public.is_platform_owner(uuid) from public;
grant execute on function public.is_platform_owner(uuid) to authenticated;

create or replace function public.platform_my_owner_profile()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  lbl text;
  em text;
begin
  if uid is null then
    return jsonb_build_object('is_owner', false);
  end if;

  select po.label into lbl
  from public.platform_owners po
  where po.user_id = uid;

  select u.email into em from auth.users u where u.id = uid;

  if lbl is null then
    return jsonb_build_object('is_owner', false, 'user_id', uid, 'email', em);
  end if;

  return jsonb_build_object('is_owner', true, 'label', lbl, 'user_id', uid, 'email', em);
end;
$$;

revoke all on function public.platform_my_owner_profile() from public;
grant execute on function public.platform_my_owner_profile() to authenticated;

-- ---------------------------------------------------------------------------
-- 2) Hidden owner = platform_owners row (same as is_platform_owner)
-- ---------------------------------------------------------------------------
create or replace function public.admin_is_hidden_owner(p_uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_owner(coalesce(p_uid, auth.uid()));
$$;

revoke all on function public.admin_is_hidden_owner(uuid) from public;
grant execute on function public.admin_is_hidden_owner(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 3) Register founder email
-- ---------------------------------------------------------------------------
insert into public.platform_owners (user_id, label)
select u.id, 'المؤسس'
from auth.users u
where lower(u.email) = lower('alpha.coptic@proton.me')
on conflict (user_id) do update set label = excluded.label;

-- ---------------------------------------------------------------------------
-- 4) Fix permission save (boolean jsonb + founder edits super_admin)
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
    insert into public.admin_user_permissions (admin_user_id, permission_key, granted)
    values (p_id, k, v)
    on conflict (admin_user_id, permission_key) do update set granted = excluded.granted;
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
-- 5) Verify
-- ---------------------------------------------------------------------------
select
  u.email,
  po.label,
  public.is_platform_owner(u.id) as is_owner,
  public.admin_is_hidden_owner(u.id) as is_hidden_owner
from auth.users u
left join public.platform_owners po on po.user_id = u.id
where lower(u.email) = lower('alpha.coptic@proton.me');

notify pgrst, 'reload schema';
