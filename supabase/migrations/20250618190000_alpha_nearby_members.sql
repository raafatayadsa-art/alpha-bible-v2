-- ALPHA-099: Alpha Connect & Nearby Members System

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists profiles_public_all on public.profiles;
create policy profiles_public_all
  on public.profiles for all to anon, authenticated
  using (true) with check (true);

create table if not exists public.alpha_user_discovery_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nearby_discoverable boolean not null default false,
  who_can_discover text not null default 'church'
    check (who_can_discover in ('church', 'connections', 'none')),
  last_lat double precision,
  last_lng double precision,
  last_accuracy_m double precision,
  updated_at timestamptz not null default now()
);

create index if not exists alpha_user_discovery_prefs_discoverable_idx
  on public.alpha_user_discovery_prefs (nearby_discoverable, updated_at desc)
  where nearby_discoverable = true;

create table if not exists public.alpha_connect_connection_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references auth.users (id) on delete cascade,
  to_user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  note text,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (from_user_id, to_user_id)
);

create index if not exists alpha_connect_connection_requests_to_idx
  on public.alpha_connect_connection_requests (to_user_id, status);

create index if not exists alpha_connect_connection_requests_from_idx
  on public.alpha_connect_connection_requests (from_user_id, status);

create table if not exists public.alpha_connect_contacts (
  user_id uuid not null references auth.users (id) on delete cascade,
  contact_user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, contact_user_id),
  check (user_id <> contact_user_id)
);

alter table public.alpha_user_discovery_prefs enable row level security;
alter table public.alpha_connect_connection_requests enable row level security;
alter table public.alpha_connect_contacts enable row level security;

drop policy if exists alpha_user_discovery_prefs_public_all on public.alpha_user_discovery_prefs;
create policy alpha_user_discovery_prefs_public_all
  on public.alpha_user_discovery_prefs for all to anon, authenticated
  using (true) with check (true);

drop policy if exists alpha_connect_connection_requests_public_all on public.alpha_connect_connection_requests;
create policy alpha_connect_connection_requests_public_all
  on public.alpha_connect_connection_requests for all to anon, authenticated
  using (true) with check (true);

drop policy if exists alpha_connect_contacts_public_all on public.alpha_connect_contacts;
create policy alpha_connect_contacts_public_all
  on public.alpha_connect_contacts for all to anon, authenticated
  using (true) with check (true);

create or replace function public.alpha_upsert_discovery_location(
  p_lat double precision,
  p_lng double precision,
  p_accuracy_m double precision default null,
  p_discoverable boolean default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.alpha_user_discovery_prefs (user_id, last_lat, last_lng, last_accuracy_m, updated_at, nearby_discoverable)
  values (
    v_uid,
    p_lat,
    p_lng,
    p_accuracy_m,
    now(),
    coalesce(p_discoverable, false)
  )
  on conflict (user_id) do update set
    last_lat = excluded.last_lat,
    last_lng = excluded.last_lng,
    last_accuracy_m = excluded.last_accuracy_m,
    updated_at = now(),
    nearby_discoverable = coalesce(p_discoverable, public.alpha_user_discovery_prefs.nearby_discoverable);
end;
$$;

grant execute on function public.alpha_upsert_discovery_location(double precision, double precision, double precision, boolean) to authenticated;

create or replace function public.alpha_nearby_members(
  p_lat double precision,
  p_lng double precision,
  p_radius_m integer default 2000
)
returns table (
  user_id uuid,
  display_name text,
  church_name text,
  role_label text,
  distance_m double precision,
  avatar_url text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_church_id uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select cm.church_id into v_church_id
  from public.church_memberships cm
  where cm.user_id = v_uid::text
    and cm.status = 'active'
  order by cm.joined_at desc
  limit 1;

  return query
  select
    dp.user_id,
    coalesce(p.display_name, 'عضو Alpha') as display_name,
    coalesce(c.name, 'كنيسة Alpha') as church_name,
    coalesce(cm.role_label, 'member') as role_label,
    (
      6371000 * acos(
        least(1.0, greatest(-1.0,
          cos(radians(p_lat)) * cos(radians(dp.last_lat))
          * cos(radians(dp.last_lng) - radians(p_lng))
          + sin(radians(p_lat)) * sin(radians(dp.last_lat))
        ))
      )
    ) as distance_m,
    p.avatar_url
  from public.alpha_user_discovery_prefs dp
  left join public.profiles p on p.id = dp.user_id
  left join public.church_memberships cm on cm.user_id = dp.user_id::text and cm.status = 'active'
  left join public.churches c on c.id = cm.church_id
  left join public.alpha_user_presence pres on pres.user_id = dp.user_id
  where dp.nearby_discoverable = true
    and dp.user_id <> v_uid
    and dp.last_lat is not null
    and dp.last_lng is not null
    and dp.updated_at > now() - interval '20 minutes'
    and coalesce(pres.status, 'available') <> 'hidden'
    and (v_church_id is null or cm.church_id = v_church_id)
    and (
      6371000 * acos(
        least(1.0, greatest(-1.0,
          cos(radians(p_lat)) * cos(radians(dp.last_lat))
          * cos(radians(dp.last_lng) - radians(p_lng))
          + sin(radians(p_lat)) * sin(radians(dp.last_lat))
        ))
      )
    ) <= greatest(p_radius_m, 50);
end;
$$;

grant execute on function public.alpha_nearby_members(double precision, double precision, integer) to authenticated;

create or replace function public.alpha_send_connection_request(p_to_user_id uuid, p_note text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if p_to_user_id is null or p_to_user_id = v_uid then raise exception 'invalid target'; end if;

  insert into public.alpha_connect_connection_requests (from_user_id, to_user_id, note)
  values (v_uid, p_to_user_id, nullif(trim(p_note), ''))
  on conflict (from_user_id, to_user_id) do update set
    status = 'pending',
    note = excluded.note,
    created_at = now(),
    responded_at = null
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.alpha_send_connection_request(uuid, text) to authenticated;

create or replace function public.alpha_respond_connection_request(p_request_id uuid, p_accept boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_from uuid;
  v_to uuid;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;

  select from_user_id, to_user_id into v_from, v_to
  from public.alpha_connect_connection_requests
  where id = p_request_id and to_user_id = v_uid and status = 'pending';

  if v_from is null then return false; end if;

  update public.alpha_connect_connection_requests
  set status = case when p_accept then 'accepted' else 'rejected' end,
      responded_at = now()
  where id = p_request_id;

  if p_accept then
    insert into public.alpha_connect_contacts (user_id, contact_user_id)
    values (v_from, v_to), (v_to, v_from)
    on conflict do nothing;
    perform public.alpha_connect_open_direct(v_from::text, null);
  end if;

  return true;
end;
$$;

grant execute on function public.alpha_respond_connection_request(uuid, boolean) to authenticated;
