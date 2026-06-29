-- Allow the first authenticated user to self-register as platform Founder
-- (when platform_owners table is empty). Additional owners are added by SQL invite.

create or replace function public.platform_claim_first_owner()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;

  if exists (select 1 from public.platform_owners limit 1) then
    return jsonb_build_object('ok', false, 'reason', 'already_has_owners');
  end if;

  insert into public.platform_owners (user_id, label)
  values (uid, 'Founder');

  return jsonb_build_object('ok', true, 'user_id', uid);
end;
$$;

revoke all on function public.platform_claim_first_owner() from public;
grant execute on function public.platform_claim_first_owner() to authenticated;

notify pgrst, 'reload schema';
