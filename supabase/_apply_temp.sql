-- Church Directory map: verified-only pins + coordinates from Alpha Control URLs

create or replace function public.parse_google_maps_coordinates(p_url text)
returns table (lat double precision, lng double precision)
language plpgsql
immutable
as $$
declare
  v_url text;
  m text[];
  v_lat double precision;
  v_lng double precision;
begin
  v_url := coalesce(btrim(p_url), '');
  if v_url = '' then
    return;
  end if;

  m := regexp_match(v_url, '!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)', 'i');
  if m is not null then
    v_lat := m[1]::double precision;
    v_lng := m[2]::double precision;
    if v_lat between -90 and 90 and v_lng between -180 and 180 then
      return query select v_lat, v_lng;
      return;
    end if;
  end if;

  m := regexp_match(v_url, '@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)', 'i');
  if m is not null then
    v_lat := m[1]::double precision;
    v_lng := m[2]::double precision;
    if v_lat between -90 and 90 and v_lng between -180 and 180 then
      return query select v_lat, v_lng;
      return;
    end if;
  end if;

  m := regexp_match(v_url, '[?&](?:q|query)=(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)', 'i');
  if m is not null then
    v_lat := m[1]::double precision;
    v_lng := m[2]::double precision;
    if v_lat between -90 and 90 and v_lng between -180 and 180 then
      return query select v_lat, v_lng;
      return;
    end if;
  end if;

  m := regexp_match(v_url, '[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)', 'i');
  if m is not null then
    v_lat := m[1]::double precision;
    v_lng := m[2]::double precision;
    if v_lat between -90 and 90 and v_lng between -180 and 180 then
      return query select v_lat, v_lng;
      return;
    end if;
  end if;

  return;
end;
$$;

comment on function public.parse_google_maps_coordinates(text) is
  'Extract lat/lng from Google Maps URL patterns (!3d!4d, @lat,lng, q=lat,lng) — no HTTP.';

-- Unified verified flag in directory view
create or replace view public.church_directory
with (security_invoker = true) as
select
  c.id,
  c.church_name,
  c.patron_saint,
  c.city,
  c.governorate,
  c.country,
  c.church_logo,
  (coalesce(c.is_verified, false) or coalesce(c.location_verified, false)) as is_verified,
  c.latitude,
  c.longitude
from public.churches c
where c.is_active = true;

grant select on public.church_directory to anon, authenticated;

-- Backfill coords for verified churches from approved URLs
update public.churches c
set
  latitude = round(coords.lat::numeric, 7),
  longitude = round(coords.lng::numeric, 7)
from lateral public.parse_google_maps_coordinates(
  coalesce(c.verified_location_url, c.google_maps_url)
) coords
where c.is_active = true
  and c.location_verified = true
  and coords.lat is not null
  and coords.lng is not null
  and (c.latitude is null or c.longitude is null);

-- Verify RPC: persist coordinates when URL contains them
create or replace function public.platform_verify_church_location(
  p_church_id bigint,
  p_final_url text default null
)
returns table (
  id bigint,
  google_maps_url text,
  verified_location_url text,
  location_verified boolean,
  latitude numeric,
  longitude numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
  v_maps_url text;
  v_verified_url text;
  v_verified boolean;
  v_final text;
  v_parsed_lat double precision;
  v_parsed_lng double precision;
  v_out_lat numeric;
  v_out_lng numeric;
begin
  if p_church_id is null then
    raise exception 'church_id is required';
  end if;

  select btrim(c.google_maps_url)
  into v_maps_url
  from public.churches c
  where c.id = p_church_id
    and c.is_active = true;

  if not found then
    raise exception 'church not found or inactive (id=%)', p_church_id;
  end if;

  v_final := nullif(btrim(coalesce(p_final_url, '')), '');
  if v_final is null then
    v_final := nullif(v_maps_url, '');
  end if;

  if v_final is null then
    raise exception 'final URL or google_maps_url is required (id=%)', p_church_id;
  end if;

  select coords.lat, coords.lng
  into v_parsed_lat, v_parsed_lng
  from public.parse_google_maps_coordinates(v_final) coords
  limit 1;

  update public.churches c
  set
    location_verified = true,
    verified_location_url = v_final,
    location_status = null,
    is_verified = true,
    latitude = coalesce(round(v_parsed_lat::numeric, 7), c.latitude),
    longitude = coalesce(round(v_parsed_lng::numeric, 7), c.longitude)
  where c.id = p_church_id
    and c.is_active = true
  returning
    c.id,
    c.google_maps_url,
    c.verified_location_url,
    c.location_verified,
    c.latitude,
    c.longitude
  into v_id, v_maps_url, v_verified_url, v_verified, v_out_lat, v_out_lng;

  return query
  select v_id, v_maps_url, v_verified_url, v_verified, v_out_lat, v_out_lng;
end;
$$;

-- All verified map pins (no pagination)
create or replace function public.church_directory_map_pins()
returns table (
  id bigint,
  church_name text,
  patron_saint text,
  city text,
  governorate text,
  latitude numeric,
  longitude numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    c.id,
    c.church_name,
    c.patron_saint,
    c.city,
    c.governorate,
    c.latitude,
    c.longitude
  from public.churches c
  where c.is_active = true
    and c.location_verified = true
    and c.latitude is not null
    and c.longitude is not null
  order by c.church_name;
$$;

grant execute on function public.church_directory_map_pins() to anon, authenticated;

comment on function public.church_directory_map_pins() is
  'Alpha Control verified churches with coordinates for Church Directory map (all rows, no pagination).';
