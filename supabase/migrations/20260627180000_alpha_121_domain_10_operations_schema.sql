-- DOMAIN-10 Operations & Reservations — schema v1 (ALPHA-121 P3)
-- Foundational tables; app still uses post_registrations (D09) + localStorage until wired.

-- ---------------------------------------------------------------------------
-- Trips & bookings
-- ---------------------------------------------------------------------------
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  church_id bigint references public.churches (id) on delete set null,
  post_id text,
  organizer_user_id uuid references auth.users (id) on delete set null,
  title text not null,
  trip_kind text not null default 'trip'
    check (trip_kind in ('trip', 'monastery', 'retreat', 'pilgrimage')),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'closed', 'completed', 'cancelled')),
  starts_at timestamptz,
  ends_at timestamptz,
  capacity integer check (capacity is null or capacity > 0),
  location_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trips_church_status_idx
  on public.trips (church_id, status, starts_at desc);

create index if not exists trips_post_id_idx
  on public.trips (post_id)
  where post_id is not null;

create table if not exists public.trip_bookings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  user_name text not null,
  seats integer not null default 1 check (seats > 0),
  status text not null default 'registered'
    check (status in ('registered', 'confirmed', 'waitlisted', 'cancelled', 'checked_in')),
  qr_token text,
  registered_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists trip_bookings_active_unique
  on public.trip_bookings (trip_id, user_id)
  where status not in ('cancelled');

create table if not exists public.waiting_lists (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  user_name text not null,
  seats integer not null default 1 check (seats > 0),
  status text not null default 'waiting'
    check (status in ('waiting', 'offered', 'claimed', 'expired', 'declined')),
  offered_at timestamptz,
  offer_expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists waiting_lists_trip_status_idx
  on public.waiting_lists (trip_id, status, created_at);

-- ---------------------------------------------------------------------------
-- Transport & lodging
-- ---------------------------------------------------------------------------
create table if not exists public.buses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  label text not null,
  capacity integer not null check (capacity > 0),
  supervisor_user_id uuid references auth.users (id) on delete set null,
  status text not null default 'idle'
    check (status in ('idle', 'boarding', 'en_route', 'arrived')),
  created_at timestamptz not null default now()
);

create table if not exists public.bus_assignments (
  id uuid primary key default gen_random_uuid(),
  bus_id uuid not null references public.buses (id) on delete cascade,
  booking_id uuid not null references public.trip_bookings (id) on delete cascade,
  seat_label text,
  assigned_at timestamptz not null default now(),
  unique (bus_id, booking_id)
);

create table if not exists public.accommodations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  label text not null,
  capacity integer,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Payments & channels
-- ---------------------------------------------------------------------------
create table if not exists public.trip_payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.trip_bookings (id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'EGP',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'refunded', 'failed')),
  paid_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.trip_channels (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  conversation_id uuid references public.alpha_connect_conversations (id) on delete set null,
  label text not null default 'قناة الرحلة',
  created_at timestamptz not null default now()
);

create table if not exists public.organizer_channels (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  organizer_user_id uuid not null references auth.users (id) on delete cascade,
  conversation_id uuid references public.alpha_connect_conversations (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Attendance & check-in
-- ---------------------------------------------------------------------------
create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  booking_id uuid references public.trip_bookings (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  checked_in_at timestamptz not null default now(),
  lat double precision,
  lng double precision,
  method text not null default 'manual'
    check (method in ('manual', 'qr', 'geo'))
);

create table if not exists public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  booking_id uuid references public.trip_bookings (id) on delete set null,
  event_kind text not null
    check (event_kind in ('registered', 'confirmed', 'checked_in', 'no_show', 'cancelled')),
  note text,
  logged_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Conferences & generic events
-- ---------------------------------------------------------------------------
create table if not exists public.conferences (
  id uuid primary key default gen_random_uuid(),
  church_id bigint references public.churches (id) on delete set null,
  post_id text,
  title text not null,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'closed', 'completed', 'cancelled')),
  starts_at timestamptz,
  ends_at timestamptz,
  capacity integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conference_registrations (
  id uuid primary key default gen_random_uuid(),
  conference_id uuid not null references public.conferences (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  user_name text not null,
  status text not null default 'registered'
    check (status in ('registered', 'confirmed', 'cancelled', 'checked_in')),
  registered_at timestamptz not null default now()
);

create unique index if not exists conference_registrations_active_unique
  on public.conference_registrations (conference_id, user_id)
  where status <> 'cancelled';

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  church_id bigint references public.churches (id) on delete set null,
  post_id text,
  title text not null,
  event_kind text not null default 'event'
    check (event_kind in ('event', 'service', 'activity', 'other')),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'closed', 'completed', 'cancelled')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS — enabled; policies tightened in follow-up (organizer/church scoped RPCs)
-- ---------------------------------------------------------------------------
alter table public.trips enable row level security;
alter table public.trip_bookings enable row level security;
alter table public.waiting_lists enable row level security;
alter table public.buses enable row level security;
alter table public.bus_assignments enable row level security;
alter table public.accommodations enable row level security;
alter table public.trip_payments enable row level security;
alter table public.trip_channels enable row level security;
alter table public.organizer_channels enable row level security;
alter table public.check_ins enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.conferences enable row level security;
alter table public.conference_registrations enable row level security;
alter table public.events enable row level security;

drop policy if exists trips_authenticated_read on public.trips;
create policy trips_authenticated_read
  on public.trips for select to authenticated using (true);

drop policy if exists trip_bookings_authenticated_all on public.trip_bookings;
create policy trip_bookings_authenticated_all
  on public.trip_bookings for all to authenticated using (true) with check (true);

drop policy if exists waiting_lists_authenticated_all on public.waiting_lists;
create policy waiting_lists_authenticated_all
  on public.waiting_lists for all to authenticated using (true) with check (true);

drop policy if exists buses_authenticated_read on public.buses;
create policy buses_authenticated_read
  on public.buses for select to authenticated using (true);

drop policy if exists bus_assignments_authenticated_read on public.bus_assignments;
create policy bus_assignments_authenticated_read
  on public.bus_assignments for select to authenticated using (true);

drop policy if exists accommodations_authenticated_read on public.accommodations;
create policy accommodations_authenticated_read
  on public.accommodations for select to authenticated using (true);

drop policy if exists trip_payments_owner_read on public.trip_payments;
create policy trip_payments_owner_read
  on public.trip_payments for select to authenticated using (true);

drop policy if exists trip_channels_authenticated_read on public.trip_channels;
create policy trip_channels_authenticated_read
  on public.trip_channels for select to authenticated using (true);

drop policy if exists organizer_channels_authenticated_read on public.organizer_channels;
create policy organizer_channels_authenticated_read
  on public.organizer_channels for select to authenticated using (true);

drop policy if exists check_ins_authenticated_read on public.check_ins;
create policy check_ins_authenticated_read
  on public.check_ins for select to authenticated using (true);

drop policy if exists attendance_logs_authenticated_read on public.attendance_logs;
create policy attendance_logs_authenticated_read
  on public.attendance_logs for select to authenticated using (true);

drop policy if exists conferences_authenticated_read on public.conferences;
create policy conferences_authenticated_read
  on public.conferences for select to authenticated using (true);

drop policy if exists conference_registrations_authenticated_all on public.conference_registrations;
create policy conference_registrations_authenticated_all
  on public.conference_registrations for all to authenticated using (true) with check (true);

drop policy if exists events_authenticated_read on public.events;
create policy events_authenticated_read
  on public.events for select to authenticated using (true);

-- Domain metadata
comment on table public.trips is 'DOMAIN-10 Operations: trip master records (bridge post_id → church feed)';
comment on table public.trip_bookings is 'DOMAIN-10 Operations: trip seat bookings';
comment on table public.waiting_lists is 'DOMAIN-10 Operations: smart waitlist queue';
comment on table public.buses is 'DOMAIN-10 Operations: trip bus fleet';
comment on table public.bus_assignments is 'DOMAIN-10 Operations: passenger bus seat assignments';
comment on table public.accommodations is 'DOMAIN-10 Operations: lodging assignments';
comment on table public.trip_payments is 'DOMAIN-10 Operations: trip payment ledger';
comment on table public.trip_channels is 'DOMAIN-10 Operations: trip group chat channel links';
comment on table public.organizer_channels is 'DOMAIN-10 Operations: organizer ↔ participants channels';
comment on table public.check_ins is 'DOMAIN-10 Operations: geo/QR/manual check-ins';
comment on table public.attendance_logs is 'DOMAIN-10 Operations: attendance audit trail';
comment on table public.conferences is 'DOMAIN-10 Operations: conference events';
comment on table public.conference_registrations is 'DOMAIN-10 Operations: conference registrations';
comment on table public.events is 'DOMAIN-10 Operations: generic church events';
