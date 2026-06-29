-- DOMAIN-10 Operations — church-scoped RLS + trip context backfill (ALPHA-121 P6)

create or replace function public.user_in_church(p_church_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.church_memberships cm
    where cm.church_id = p_church_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
  );
$$;

comment on function public.user_in_church(bigint) is
  'DOMAIN-10 Operations: true when auth user has active membership in church';

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
    update public.trips
    set
      church_id = coalesce(public.trips.church_id, p_church_id),
      organizer_user_id = coalesce(public.trips.organizer_user_id, p_organizer_user_id, v_uid),
      title = case
        when coalesce(trim(p_title), '') <> '' and public.trips.title = 'رحلة' then trim(p_title)
        else public.trips.title
      end,
      updated_at = now()
    where id = v_trip_id;
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

-- Trips: church members, organizers, or booked participants
drop policy if exists trips_select_authenticated on public.trips;

drop policy if exists trips_select_church_scope on public.trips;
create policy trips_select_church_scope
  on public.trips for select to authenticated
  using (
    organizer_user_id = auth.uid()
    or (
      church_id is not null
      and public.user_in_church(church_id)
    )
    or exists (
      select 1
      from public.trip_bookings tb
      where tb.trip_id = id
        and tb.user_id = auth.uid()
        and tb.status <> 'cancelled'
    )
  );

-- Trip payments: booking holder, organizer, or church member
drop policy if exists trip_payments_owner_read on public.trip_payments;

drop policy if exists trip_payments_select_scoped on public.trip_payments;
create policy trip_payments_select_scoped
  on public.trip_payments for select to authenticated
  using (
    exists (
      select 1
      from public.trip_bookings tb
      join public.trips t on t.id = tb.trip_id
      where tb.id = booking_id
        and (
          tb.user_id = auth.uid()
          or public.trip_is_organizer(t.id)
          or (t.church_id is not null and public.user_in_church(t.church_id))
        )
    )
  );

drop policy if exists trip_payments_insert_scoped on public.trip_payments;
create policy trip_payments_insert_scoped
  on public.trip_payments for insert to authenticated
  with check (
    exists (
      select 1
      from public.trip_bookings tb
      join public.trips t on t.id = tb.trip_id
      where tb.id = booking_id
        and (
          public.trip_is_organizer(t.id)
          or tb.user_id = auth.uid()
        )
    )
  );

drop policy if exists trip_payments_update_organizer on public.trip_payments;
create policy trip_payments_update_organizer
  on public.trip_payments for update to authenticated
  using (
    exists (
      select 1
      from public.trip_bookings tb
      join public.trips t on t.id = tb.trip_id
      where tb.id = booking_id
        and public.trip_is_organizer(t.id)
    )
  )
  with check (
    exists (
      select 1
      from public.trip_bookings tb
      join public.trips t on t.id = tb.trip_id
      where tb.id = booking_id
        and public.trip_is_organizer(t.id)
    )
  );
