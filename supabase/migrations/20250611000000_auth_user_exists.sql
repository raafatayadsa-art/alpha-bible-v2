-- Dev/prod helper: validate auth.users ids from client before FK inserts.
create or replace function public.auth_user_exists(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from auth.users where id = uid);
$$;

revoke all on function public.auth_user_exists(uuid) from public;
grant execute on function public.auth_user_exists(uuid) to anon, authenticated;
