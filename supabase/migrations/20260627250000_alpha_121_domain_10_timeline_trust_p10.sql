-- DOMAIN-10 Operations — timeline + organizer trust + wiring complete (ALPHA-121 P10)

-- ---------------------------------------------------------------------------
-- Trip timeline events (ALPHA-091)
-- ---------------------------------------------------------------------------
create table if not exists public.trip_timeline_events (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  post_id text not null,
  kind text not null
    check (kind in ('departure', 'arrival', 'stop', 'activity', 'photo')),
  title text not null,
  at timestamptz not null,
  media_url text,
  created_at timestamptz not null default now()
);

create index if not exists trip_timeline_events_trip_idx
  on public.trip_timeline_events (trip_id, at asc);

alter table public.trip_timeline_events enable row level security;

comment on table public.trip_timeline_events is
  'DOMAIN-10 Operations: post-trip timeline replay events (ALPHA-091)';

-- ---------------------------------------------------------------------------
-- Organizer trust stats (ALPHA-093)
-- ---------------------------------------------------------------------------
create table if not exists public.trip_organizer_trust_stats (
  organizer_user_id uuid primary key references auth.users (id) on delete cascade,
  trips_completed integer not null default 0 check (trips_completed >= 0),
  attendance_rate numeric(5, 2) not null default 0,
  cancellation_rate numeric(5, 2) not null default 0,
  commitment_score integer not null default 100 check (commitment_score between 0 and 100),
  updated_at timestamptz not null default now()
);

alter table public.trip_organizer_trust_stats enable row level security;

comment on table public.trip_organizer_trust_stats is
  'DOMAIN-10 Operations: organizer reputation metrics (ALPHA-093)';

-- ---------------------------------------------------------------------------
-- RLS — timeline
-- ---------------------------------------------------------------------------
drop policy if exists trip_timeline_events_select_scoped on public.trip_timeline_events;
create policy trip_timeline_events_select_scoped
  on public.trip_timeline_events for select to authenticated
  using (
    public.trip_is_organizer(trip_id)
    or exists (
      select 1
      from public.trips t
      where t.id = trip_id
        and t.church_id is not null
        and public.user_in_church(t.church_id)
    )
    or exists (
      select 1
      from public.trip_bookings tb
      where tb.trip_id = trip_id
        and tb.user_id = auth.uid()
        and tb.status <> 'cancelled'
    )
  );

drop policy if exists trip_timeline_events_organizer_write on public.trip_timeline_events;
drop policy if exists trip_timeline_events_church_insert on public.trip_timeline_events;

drop policy if exists trip_timeline_events_write_scoped on public.trip_timeline_events;
create policy trip_timeline_events_write_scoped
  on public.trip_timeline_events for all to authenticated
  using (
    public.trip_is_organizer(trip_id)
    or exists (
      select 1
      from public.trips t
      where t.id = trip_id
        and t.church_id is not null
        and public.user_in_church(t.church_id)
    )
  )
  with check (
    public.trip_is_organizer(trip_id)
    or exists (
      select 1
      from public.trips t
      where t.id = trip_id
        and t.church_id is not null
        and public.user_in_church(t.church_id)
    )
  );

-- ---------------------------------------------------------------------------
-- RLS — organizer trust
-- ---------------------------------------------------------------------------
drop policy if exists trip_organizer_trust_select on public.trip_organizer_trust_stats;
create policy trip_organizer_trust_select
  on public.trip_organizer_trust_stats for select to authenticated
  using (true);

drop policy if exists trip_organizer_trust_upsert_scoped on public.trip_organizer_trust_stats;
create policy trip_organizer_trust_upsert_scoped
  on public.trip_organizer_trust_stats for insert to authenticated
  with check (
    organizer_user_id = auth.uid()
    or exists (
      select 1
      from public.trips t
      where t.organizer_user_id = trip_organizer_trust_stats.organizer_user_id
        and t.church_id is not null
        and public.user_in_church(t.church_id)
    )
  );

drop policy if exists trip_organizer_trust_update_scoped on public.trip_organizer_trust_stats;
create policy trip_organizer_trust_update_scoped
  on public.trip_organizer_trust_stats for update to authenticated
  using (
    organizer_user_id = auth.uid()
    or exists (
      select 1
      from public.trips t
      where t.organizer_user_id = trip_organizer_trust_stats.organizer_user_id
        and t.church_id is not null
        and public.user_in_church(t.church_id)
    )
  )
  with check (
    organizer_user_id = auth.uid()
    or exists (
      select 1
      from public.trips t
      where t.organizer_user_id = trip_organizer_trust_stats.organizer_user_id
        and t.church_id is not null
        and public.user_in_church(t.church_id)
    )
  );
