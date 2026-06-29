-- Quick fix: create admin_team_reset_permissions RPC (UI reset button)
-- Run in Supabase SQL Editor if you see:
--   Could not find the function public.admin_team_reset_permissions(p_id) in the schema cache

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

notify pgrst, 'reload schema';

-- Verify
select proname, pg_get_function_identity_arguments(p.oid) as args
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'admin_team_reset_permissions';
