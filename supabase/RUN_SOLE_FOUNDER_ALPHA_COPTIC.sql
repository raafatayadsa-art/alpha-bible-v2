-- Sole founder: alpha.coptic@proton.me only — remove all other owners
-- Run in Supabase SQL Editor

-- 1) Remove any owner rows that are NOT the founder email
delete from public.platform_owners po
where po.user_id not in (
  select u.id from auth.users u where lower(u.email) = lower('alpha.coptic@proton.me')
);

-- 2) Register sole founder
insert into public.platform_owners (user_id, label)
select u.id, 'المؤسس'
from auth.users u
where lower(u.email) = lower('alpha.coptic@proton.me')
on conflict (user_id) do update set label = excluded.label;

-- 3) Owner check — founder email ONLY (one founder, no other emails)
create or replace function public.is_platform_owner(p_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_owners po
    join auth.users u on u.id = po.user_id
    where po.user_id = coalesce(p_user, auth.uid())
      and lower(u.email) = lower('alpha.coptic@proton.me')
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

  select u.email into em from auth.users u where u.id = uid;

  if lower(coalesce(em, '')) <> lower('alpha.coptic@proton.me') then
    return jsonb_build_object('is_owner', false, 'user_id', uid, 'email', em);
  end if;

  select po.label into lbl
  from public.platform_owners po
  where po.user_id = uid;

  if lbl is null then
    return jsonb_build_object('is_owner', false, 'user_id', uid, 'email', em);
  end if;

  return jsonb_build_object('is_owner', true, 'label', lbl, 'user_id', uid, 'email', em);
end;
$$;

revoke all on function public.platform_my_owner_profile() from public;
grant execute on function public.platform_my_owner_profile() to authenticated;

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

-- 4) First-owner claim — founder email only
create or replace function public.platform_claim_first_owner()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  em text;
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;

  select u.email into em from auth.users u where u.id = uid;

  if lower(coalesce(em, '')) <> lower('alpha.coptic@proton.me') then
    return jsonb_build_object('ok', false, 'reason', 'not_founder_email');
  end if;

  if exists (select 1 from public.platform_owners limit 1) then
    return jsonb_build_object('ok', false, 'reason', 'already_has_owners');
  end if;

  insert into public.platform_owners (user_id, label)
  values (uid, 'المؤسس');

  return jsonb_build_object('ok', true, 'user_id', uid);
end;
$$;

revoke all on function public.platform_claim_first_owner() from public;
grant execute on function public.platform_claim_first_owner() to authenticated;

-- 5) Verify
select po.user_id, po.label, u.email, public.is_platform_owner(po.user_id) as is_owner
from public.platform_owners po
left join auth.users u on u.id = po.user_id;

notify pgrst, 'reload schema';
