-- Platform Owner bootstrap — register your Supabase Auth user as platform owner
-- Run in Supabase Dashboard → SQL Editor (uses service role / postgres — bypasses RLS)

-- ---------------------------------------------------------------------------
-- OPTION A — by email (easiest): replace the email below, then run this block
-- ---------------------------------------------------------------------------
-- Founder email (Alpha Bible)
insert into public.platform_owners (user_id, label)
select u.id, 'المؤسس'
from auth.users u
where lower(u.email) = lower('alpha.coptic@proton.me')
on conflict (user_id) do update set label = excluded.label;

-- ---------------------------------------------------------------------------
-- OPTION B — by UUID: replace UUID if you already know it from the app banner
-- ---------------------------------------------------------------------------
-- insert into public.platform_owners (user_id, label)
-- values ('00000000-0000-0000-0000-000000000000'::uuid, 'Founder')
-- on conflict (user_id) do update set label = excluded.label;

-- ---------------------------------------------------------------------------
-- List all auth users (pick the right id)
-- ---------------------------------------------------------------------------
select id, email, created_at
from auth.users
order by created_at desc
limit 20;

-- ---------------------------------------------------------------------------
-- Verify owner row + RPC (should return true after insert)
-- ---------------------------------------------------------------------------
select po.user_id, po.label, u.email, public.is_platform_owner(po.user_id) as is_owner
from public.platform_owners po
left join auth.users u on u.id = po.user_id
order by po.created_at desc;

notify pgrst, 'reload schema';

-- First-owner auto-claim (app calls this on Alpha Control entry when table is empty)
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
