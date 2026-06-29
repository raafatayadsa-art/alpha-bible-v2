-- DOMAIN-10 Operations — church-scoped bookings/waitlist + trip prayers (ALPHA-121 P7)

-- ---------------------------------------------------------------------------
-- Trip prayer requests (ALPHA-088)
-- ---------------------------------------------------------------------------
create table if not exists public.trip_prayer_requests (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  author_name text not null,
  body text not null,
  reactions integer not null default 0 check (reactions >= 0),
  shared_with_organizer boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists trip_prayer_requests_trip_idx
  on public.trip_prayer_requests (trip_id, reactions desc, created_at desc);

alter table public.trip_prayer_requests enable row level security;

comment on table public.trip_prayer_requests is
  'DOMAIN-10 Operations: trip-scoped prayer request board (ALPHA-088)';

-- ---------------------------------------------------------------------------
-- Trip bookings — church-scoped read; self or organizer write
-- ---------------------------------------------------------------------------
drop policy if exists trip_bookings_select_authenticated on public.trip_bookings;

drop policy if exists trip_bookings_select_scoped on public.trip_bookings;
create policy trip_bookings_select_scoped
  on public.trip_bookings for select to authenticated
  using (
    user_id = auth.uid()
    or public.trip_is_organizer(trip_id)
    or exists (
      select 1
      from public.trips t
      where t.id = trip_id
        and t.church_id is not null
        and public.user_in_church(t.church_id)
    )
  );

drop policy if exists trip_bookings_update_self on public.trip_bookings;

drop policy if exists trip_bookings_update_scoped on public.trip_bookings;
create policy trip_bookings_update_scoped
  on public.trip_bookings for update to authenticated
  using (
    user_id = auth.uid()
    or public.trip_is_organizer(trip_id)
  )
  with check (
    user_id = auth.uid()
    or public.trip_is_organizer(trip_id)
  );

-- ---------------------------------------------------------------------------
-- Waiting lists — church-scoped read; self insert; self or organizer update
-- ---------------------------------------------------------------------------
drop policy if exists waiting_lists_select_authenticated on public.waiting_lists;

drop policy if exists waiting_lists_select_scoped on public.waiting_lists;
create policy waiting_lists_select_scoped
  on public.waiting_lists for select to authenticated
  using (
    user_id = auth.uid()
    or public.trip_is_organizer(trip_id)
    or exists (
      select 1
      from public.trips t
      where t.id = trip_id
        and t.church_id is not null
        and public.user_in_church(t.church_id)
    )
  );

drop policy if exists waiting_lists_update_self on public.waiting_lists;

drop policy if exists waiting_lists_update_scoped on public.waiting_lists;
create policy waiting_lists_update_scoped
  on public.waiting_lists for update to authenticated
  using (
    user_id = auth.uid()
    or public.trip_is_organizer(trip_id)
  )
  with check (
    user_id = auth.uid()
    or public.trip_is_organizer(trip_id)
  );

-- ---------------------------------------------------------------------------
-- Trip prayer requests RLS
-- ---------------------------------------------------------------------------
drop policy if exists trip_prayer_requests_select_scoped on public.trip_prayer_requests;
create policy trip_prayer_requests_select_scoped
  on public.trip_prayer_requests for select to authenticated
  using (
    exists (
      select 1
      from public.trips t
      where t.id = trip_id
        and (
          public.trip_is_organizer(t.id)
          or (t.church_id is not null and public.user_in_church(t.church_id))
          or exists (
            select 1
            from public.trip_bookings tb
            where tb.trip_id = t.id
              and tb.user_id = auth.uid()
              and tb.status <> 'cancelled'
          )
        )
    )
    and (
      shared_with_organizer = true
      or user_id = auth.uid()
      or exists (
        select 1
        from public.trips t
        where t.id = trip_id
          and public.trip_is_organizer(t.id)
      )
    )
  );

drop policy if exists trip_prayer_requests_insert_scoped on public.trip_prayer_requests;
create policy trip_prayer_requests_insert_scoped
  on public.trip_prayer_requests for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.trips t
      where t.id = trip_id
        and (
          public.trip_is_organizer(t.id)
          or (t.church_id is not null and public.user_in_church(t.church_id))
          or exists (
            select 1
            from public.trip_bookings tb
            where tb.trip_id = t.id
              and tb.user_id = auth.uid()
              and tb.status <> 'cancelled'
          )
        )
    )
  );

drop policy if exists trip_prayer_requests_update_react on public.trip_prayer_requests;
create policy trip_prayer_requests_update_react
  on public.trip_prayer_requests for update to authenticated
  using (
    exists (
      select 1
      from public.trips t
      where t.id = trip_id
        and (
          public.trip_is_organizer(t.id)
          or (t.church_id is not null and public.user_in_church(t.church_id))
          or exists (
            select 1
            from public.trip_bookings tb
            where tb.trip_id = t.id
              and tb.user_id = auth.uid()
              and tb.status <> 'cancelled'
          )
        )
    )
  )
  with check (
    exists (
      select 1
      from public.trips t
      where t.id = trip_id
        and (
          public.trip_is_organizer(t.id)
          or (t.church_id is not null and public.user_in_church(t.church_id))
          or exists (
            select 1
            from public.trip_bookings tb
            where tb.trip_id = t.id
              and tb.user_id = auth.uid()
              and tb.status <> 'cancelled'
          )
        )
    )
  );
