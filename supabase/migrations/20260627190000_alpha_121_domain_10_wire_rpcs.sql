-- DOMAIN-10 Operations — wire RPCs + tighter waitlist RLS (ALPHA-121 P4)

create unique index if not exists trips_post_id_unique
  on public.trips (post_id)
  where post_id is not null;

create or replace function public.ensure_trip_for_post(
  p_post_id text,
  p_title text default 'رحلة',
  p_church_id bigint default null,
  p_organizer_user_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trip_id uuid;
  v_uid uuid := auth.uid();
begin
  if p_post_id is null or trim(p_post_id) = '' then
    raise exception 'invalid post_id';
  end if;

  select t.id into v_trip_id
  from public.trips t
  where t.post_id = p_post_id
  limit 1;

  if v_trip_id is not null then
    return v_trip_id;
  end if;

  insert into public.trips (post_id, title, church_id, organizer_user_id, status)
  values (
    trim(p_post_id),
    coalesce(nullif(trim(p_title), ''), 'رحلة'),
    p_church_id,
    coalesce(p_organizer_user_id, v_uid),
    'published'
  )
  returning id into v_trip_id;

  return v_trip_id;
end;
$$;

comment on function public.ensure_trip_for_post(text, text, bigint, uuid) is
  'DOMAIN-10 Operations: get or create trip row for a church feed post_id';

grant execute on function public.ensure_trip_for_post(text, text, bigint, uuid) to authenticated;

-- Waitlist RLS: read open for queue UI; writes scoped to self
drop policy if exists waiting_lists_authenticated_all on public.waiting_lists;

drop policy if exists waiting_lists_select_authenticated on public.waiting_lists;
create policy waiting_lists_select_authenticated
  on public.waiting_lists for select to authenticated using (true);

drop policy if exists waiting_lists_insert_self on public.waiting_lists;
create policy waiting_lists_insert_self
  on public.waiting_lists for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists waiting_lists_update_self on public.waiting_lists;
create policy waiting_lists_update_self
  on public.waiting_lists for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists waiting_lists_delete_self on public.waiting_lists;
create policy waiting_lists_delete_self
  on public.waiting_lists for delete to authenticated
  using (auth.uid() = user_id);

-- Trip bookings: users manage own rows
drop policy if exists trip_bookings_authenticated_all on public.trip_bookings;

drop policy if exists trip_bookings_select_authenticated on public.trip_bookings;
create policy trip_bookings_select_authenticated
  on public.trip_bookings for select to authenticated using (true);

drop policy if exists trip_bookings_insert_self on public.trip_bookings;
create policy trip_bookings_insert_self
  on public.trip_bookings for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists trip_bookings_update_self on public.trip_bookings;
create policy trip_bookings_update_self
  on public.trip_bookings for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
