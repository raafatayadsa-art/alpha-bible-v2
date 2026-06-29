-- Team list avatars from user_profiles + founder add friend as admin

create or replace function public.admin_team_list()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_has_permission('team.view') then
    raise exception 'forbidden';
  end if;

  return coalesce((
    select jsonb_agg(row_to_json(t) order by t.created_at desc)
    from (
      select
        au.id,
        au.auth_user_id,
        au.role_key,
        au.status,
        au.full_name,
        au.username,
        au.email,
        au.phone,
        coalesce(nullif(trim(au.avatar_url), ''), up.avatar_url) as avatar_url,
        au.login_count,
        au.last_login_at,
        au.last_activity_at,
        au.last_ip,
        au.created_at
      from public.admin_users au
      left join public.user_profiles up on up.user_id = au.auth_user_id
      where au.auth_user_id is null
         or au.auth_user_id not in (select user_id from public.platform_owners)
    ) t
  ), '[]'::jsonb);
end;
$$;

create or replace function public.admin_team_add_friend_admin(
  p_friend_user_id uuid,
  p_role_key text default 'admin'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  em text;
  disp text;
  uname text;
  av text;
  member_id uuid;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if not public.admin_is_hidden_owner(uid) then raise exception 'forbidden'; end if;
  if p_role_key not in ('super_admin', 'admin') then raise exception 'invalid_role'; end if;

  select u.email into em from auth.users u where u.id = p_friend_user_id;
  if em is null then raise exception 'user_not_found'; end if;

  if exists (
    select 1 from public.admin_users au
    where au.auth_user_id = p_friend_user_id or lower(au.email) = lower(em)
  ) then
    raise exception 'email_exists';
  end if;

  select
    coalesce(nullif(trim(up.display_name), ''), split_part(em, '@', 1)),
    coalesce(nullif(trim(up.username), ''), split_part(em, '@', 1)),
    nullif(trim(up.avatar_url), '')
  into disp, uname, av
  from public.user_profiles up
  where up.user_id = p_friend_user_id;

  if disp is null then disp := split_part(em, '@', 1); end if;
  if uname is null then uname := split_part(em, '@', 1); end if;

  insert into public.admin_users (
    auth_user_id, role_key, status, full_name, username, email, avatar_url, invited_by_auth_id
  ) values (
    p_friend_user_id, p_role_key, 'active', disp, uname, lower(em), av, uid
  )
  returning id into member_id;

  perform public.admin_log_activity(
    'team.add_friend_admin',
    'admin_user',
    member_id::text,
    null,
    jsonb_build_object('friend_user_id', p_friend_user_id, 'role', p_role_key)
  );

  return jsonb_build_object('ok', true, 'admin_user_id', member_id);
end;
$$;

revoke all on function public.admin_team_add_friend_admin(uuid, text) from public;
grant execute on function public.admin_team_add_friend_admin(uuid, text) to authenticated;

notify pgrst, 'reload schema';
