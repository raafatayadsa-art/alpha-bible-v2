-- DOMAIN-10 Operations — passport, memory album, emergency contacts + waitlist realtime (ALPHA-121 P9)

-- ---------------------------------------------------------------------------
-- Pilgrimage passport entries (ALPHA-097)
-- ---------------------------------------------------------------------------
create table if not exists public.trip_pilgrimage_passport_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  trip_id uuid references public.trips (id) on delete set null,
  post_id text,
  kind text not null default 'trip'
    check (kind in ('monastery', 'conference', 'trip', 'retreat', 'event')),
  title text not null,
  completed_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists trip_pilgrimage_passport_user_idx
  on public.trip_pilgrimage_passport_entries (user_id, completed_at desc);

alter table public.trip_pilgrimage_passport_entries
  drop constraint if exists trip_pilgrimage_passport_dedup;

alter table public.trip_pilgrimage_passport_entries
  add constraint trip_pilgrimage_passport_dedup unique (user_id, title, completed_at);

alter table public.trip_pilgrimage_passport_entries enable row level security;

comment on table public.trip_pilgrimage_passport_entries is
  'DOMAIN-10 Operations: lifetime pilgrimage / spiritual journey log (ALPHA-097)';

-- ---------------------------------------------------------------------------
-- Trip memory albums (ALPHA-090)
-- ---------------------------------------------------------------------------
create table if not exists public.trip_memory_albums (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  post_id text not null,
  photos jsonb not null default '[]'::jsonb,
  videos jsonb not null default '[]'::jsonb,
  highlights jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (trip_id)
);

create index if not exists trip_memory_albums_post_idx
  on public.trip_memory_albums (post_id);

alter table public.trip_memory_albums enable row level security;

comment on table public.trip_memory_albums is
  'DOMAIN-10 Operations: post-trip memory album archive (ALPHA-090)';

-- ---------------------------------------------------------------------------
-- Emergency contacts per booking (ALPHA-094)
-- ---------------------------------------------------------------------------
create table if not exists public.trip_emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  registration_id text not null,
  booking_id uuid references public.trip_bookings (id) on delete set null,
  name text not null,
  phone text not null,
  relation text not null default 'قريب',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, registration_id)
);

alter table public.trip_emergency_contacts enable row level security;

comment on table public.trip_emergency_contacts is
  'DOMAIN-10 Operations: emergency contact per trip registration (ALPHA-094)';

-- ---------------------------------------------------------------------------
-- RLS — pilgrimage passport
-- ---------------------------------------------------------------------------
drop policy if exists trip_pilgrimage_passport_select_scoped on public.trip_pilgrimage_passport_entries;
create policy trip_pilgrimage_passport_select_scoped
  on public.trip_pilgrimage_passport_entries for select to authenticated
  using (
    user_id = auth.uid()
    or (trip_id is not null and public.trip_is_organizer(trip_id))
    or exists (
      select 1
      from public.trips t
      where t.id = trip_id
        and t.church_id is not null
        and public.user_in_church(t.church_id)
    )
  );

drop policy if exists trip_pilgrimage_passport_insert_self on public.trip_pilgrimage_passport_entries;
create policy trip_pilgrimage_passport_insert_self
  on public.trip_pilgrimage_passport_entries for insert to authenticated
  with check (user_id = auth.uid() or (trip_id is not null and public.trip_is_organizer(trip_id)));

-- ---------------------------------------------------------------------------
-- RLS — memory albums
-- ---------------------------------------------------------------------------
drop policy if exists trip_memory_albums_select_scoped on public.trip_memory_albums;
create policy trip_memory_albums_select_scoped
  on public.trip_memory_albums for select to authenticated
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

drop policy if exists trip_memory_albums_organizer_write on public.trip_memory_albums;
create policy trip_memory_albums_organizer_write
  on public.trip_memory_albums for all to authenticated
  using (public.trip_is_organizer(trip_id))
  with check (public.trip_is_organizer(trip_id));

-- ---------------------------------------------------------------------------
-- RLS — emergency contacts
-- ---------------------------------------------------------------------------
drop policy if exists trip_emergency_contacts_select_scoped on public.trip_emergency_contacts;
create policy trip_emergency_contacts_select_scoped
  on public.trip_emergency_contacts for select to authenticated
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

drop policy if exists trip_emergency_contacts_upsert_self on public.trip_emergency_contacts;
create policy trip_emergency_contacts_upsert_self
  on public.trip_emergency_contacts for insert to authenticated
  with check (
    user_id = auth.uid()
    or public.trip_is_organizer(trip_id)
  );

drop policy if exists trip_emergency_contacts_update_scoped on public.trip_emergency_contacts;
create policy trip_emergency_contacts_update_scoped
  on public.trip_emergency_contacts for update to authenticated
  using (user_id = auth.uid() or public.trip_is_organizer(trip_id))
  with check (user_id = auth.uid() or public.trip_is_organizer(trip_id));

-- ---------------------------------------------------------------------------
-- Realtime — waitlist offers
-- ---------------------------------------------------------------------------
alter table public.waiting_lists replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.waiting_lists;
exception
  when duplicate_object then null;
end $$;
