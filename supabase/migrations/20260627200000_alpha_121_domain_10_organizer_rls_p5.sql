-- DOMAIN-10 Operations — organizer RLS + geo zone columns (ALPHA-121 P5)

alter table public.trips add column if not exists check_in_lat double precision;
alter table public.trips add column if not exists check_in_lng double precision;
alter table public.trips add column if not exists check_in_radius_m integer;

create or replace function public.trip_is_organizer(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trips t
    where t.id = p_trip_id
      and t.organizer_user_id = auth.uid()
  );
$$;

comment on function public.trip_is_organizer(uuid) is
  'DOMAIN-10 Operations: true when auth user owns the trip (organizer_user_id)';

-- Trips: organizer may update trip metadata (geo zone, status, capacity)
drop policy if exists trips_authenticated_read on public.trips;

drop policy if exists trips_select_authenticated on public.trips;
create policy trips_select_authenticated
  on public.trips for select to authenticated using (true);

drop policy if exists trips_organizer_update on public.trips;
create policy trips_organizer_update
  on public.trips for update to authenticated
  using (public.trip_is_organizer(id))
  with check (public.trip_is_organizer(id));

drop policy if exists trips_organizer_insert on public.trips;
create policy trips_organizer_insert
  on public.trips for insert to authenticated
  with check (organizer_user_id = auth.uid() or organizer_user_id is null);

-- Buses: organizer full CRUD on own trips
drop policy if exists buses_authenticated_read on public.buses;

drop policy if exists buses_select_authenticated on public.buses;
create policy buses_select_authenticated
  on public.buses for select to authenticated using (true);

drop policy if exists buses_organizer_all on public.buses;
create policy buses_organizer_all
  on public.buses for all to authenticated
  using (public.trip_is_organizer(trip_id))
  with check (public.trip_is_organizer(trip_id));

-- Bus assignments: organizer manages seating
drop policy if exists bus_assignments_authenticated_read on public.bus_assignments;

drop policy if exists bus_assignments_select_authenticated on public.bus_assignments;
create policy bus_assignments_select_authenticated
  on public.bus_assignments for select to authenticated using (true);

drop policy if exists bus_assignments_organizer_all on public.bus_assignments;
create policy bus_assignments_organizer_all
  on public.bus_assignments for all to authenticated
  using (
    exists (
      select 1 from public.buses b
      where b.id = bus_id and public.trip_is_organizer(b.trip_id)
    )
  )
  with check (
    exists (
      select 1 from public.buses b
      where b.id = bus_id and public.trip_is_organizer(b.trip_id)
    )
  );

-- Check-ins: participant inserts own row; organizer reads all (select open)
drop policy if exists check_ins_authenticated_read on public.check_ins;

drop policy if exists check_ins_select_authenticated on public.check_ins;
create policy check_ins_select_authenticated
  on public.check_ins for select to authenticated using (true);

drop policy if exists check_ins_insert_self on public.check_ins;
create policy check_ins_insert_self
  on public.check_ins for insert to authenticated
  with check (auth.uid() = user_id);

-- Attendance audit: organizer inserts on trip
drop policy if exists attendance_logs_authenticated_read on public.attendance_logs;

drop policy if exists attendance_logs_select_authenticated on public.attendance_logs;
create policy attendance_logs_select_authenticated
  on public.attendance_logs for select to authenticated using (true);

drop policy if exists attendance_logs_organizer_insert on public.attendance_logs;
create policy attendance_logs_organizer_insert
  on public.attendance_logs for insert to authenticated
  with check (public.trip_is_organizer(trip_id));
