-- DOMAIN-10 Operations — waitlist RPC + certificates + companion groups (ALPHA-121 P8)

-- ---------------------------------------------------------------------------
-- Waitlist offer RPC (security definer — bypasses RLS for queue advancement)
-- ---------------------------------------------------------------------------
create or replace function public.offer_next_waitlist_seat(
  p_trip_id uuid,
  p_freed_seats integer default 1,
  p_hold_ms bigint default 1800000
)
returns public.waiting_lists
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.waiting_lists;
  v_now timestamptz := now();
begin
  if p_trip_id is null then
    return null;
  end if;

  if not exists (
    select 1
    from public.trips t
    where t.id = p_trip_id
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
  ) then
    raise exception 'forbidden';
  end if;

  update public.waiting_lists wl
  set status = 'expired'
  where wl.trip_id = p_trip_id
    and wl.status = 'offered'
    and wl.offer_expires_at is not null
    and wl.offer_expires_at < v_now;

  select wl.* into v_row
  from public.waiting_lists wl
  where wl.trip_id = p_trip_id
    and wl.status = 'waiting'
  order by
    case when wl.seats <= coalesce(p_freed_seats, 1) then 0 else 1 end,
    wl.created_at asc
  limit 1
  for update skip locked;

  if not found then
    return null;
  end if;

  update public.waiting_lists
  set
    status = 'offered',
    offered_at = v_now,
    offer_expires_at = v_now + make_interval(secs => coalesce(p_hold_ms, 1800000) / 1000.0)
  where id = v_row.id
  returning * into v_row;

  return v_row;
end;
$$;

comment on function public.offer_next_waitlist_seat(uuid, integer, bigint) is
  'DOMAIN-10 Operations: expire stale offers and offer next waitlist seat (ALPHA-085)';

grant execute on function public.offer_next_waitlist_seat(uuid, integer, bigint) to authenticated;

-- ---------------------------------------------------------------------------
-- Participation certificates (ALPHA-089)
-- ---------------------------------------------------------------------------
create table if not exists public.trip_participation_certificates (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  post_id text not null,
  event_title text not null,
  event_date text,
  organizer_name text not null,
  verify_qr text not null,
  issued_at timestamptz not null default now(),
  unique (trip_id, user_id)
);

create index if not exists trip_participation_certificates_user_idx
  on public.trip_participation_certificates (user_id, issued_at desc);

alter table public.trip_participation_certificates enable row level security;

comment on table public.trip_participation_certificates is
  'DOMAIN-10 Operations: digital trip participation certificates (ALPHA-089)';

-- ---------------------------------------------------------------------------
-- Companion / housing groups (ALPHA-096)
-- ---------------------------------------------------------------------------
create table if not exists public.trip_companion_groups (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  label text not null,
  kind text not null default 'room'
    check (kind in ('room', 'seat', 'housing')),
  registration_ids text[] not null default '{}'::text[],
  created_at timestamptz not null default now()
);

create index if not exists trip_companion_groups_trip_idx
  on public.trip_companion_groups (trip_id, created_at);

alter table public.trip_companion_groups enable row level security;

comment on table public.trip_companion_groups is
  'DOMAIN-10 Operations: room/seat companion matching groups (ALPHA-096)';

-- ---------------------------------------------------------------------------
-- RLS — certificates
-- ---------------------------------------------------------------------------
drop policy if exists trip_participation_certificates_select_scoped on public.trip_participation_certificates;
create policy trip_participation_certificates_select_scoped
  on public.trip_participation_certificates for select to authenticated
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

drop policy if exists trip_participation_certificates_insert_organizer on public.trip_participation_certificates;
create policy trip_participation_certificates_insert_organizer
  on public.trip_participation_certificates for insert to authenticated
  with check (
    user_id = auth.uid()
    or public.trip_is_organizer(trip_id)
  );

-- ---------------------------------------------------------------------------
-- RLS — companion groups (organizer CRUD; church read)
-- ---------------------------------------------------------------------------
drop policy if exists trip_companion_groups_select_scoped on public.trip_companion_groups;
create policy trip_companion_groups_select_scoped
  on public.trip_companion_groups for select to authenticated
  using (
    public.trip_is_organizer(trip_id)
    or exists (
      select 1
      from public.trips t
      where t.id = trip_id
        and t.church_id is not null
        and public.user_in_church(t.church_id)
    )
  );

drop policy if exists trip_companion_groups_organizer_all on public.trip_companion_groups;
create policy trip_companion_groups_organizer_all
  on public.trip_companion_groups for all to authenticated
  using (public.trip_is_organizer(trip_id))
  with check (public.trip_is_organizer(trip_id));
