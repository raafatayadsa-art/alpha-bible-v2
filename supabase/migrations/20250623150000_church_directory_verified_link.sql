-- Link Alpha Control location verification (location_verified) with Church Directory (is_verified).

-- 1) Backfill: churches verified in Church Location Manager appear as directory-verified.
update public.churches
set is_verified = true
where location_verified = true
  and coalesce(is_verified, false) = false;

-- 2) Directory view: unified verified flag for list/map/search/facets.
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

-- 3) Verify RPC: keep directory in sync on every admin verify.
create or replace function public.platform_verify_church_location(
  p_church_id bigint,
  p_final_url text default null
)
returns table (
  id bigint,
  google_maps_url text,
  verified_location_url text,
  location_verified boolean
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

  update public.churches c
  set
    location_verified = true,
    verified_location_url = v_final,
    location_status = null,
    is_verified = true
  where c.id = p_church_id
    and c.is_active = true
  returning c.id, c.google_maps_url, c.verified_location_url, c.location_verified
  into v_id, v_maps_url, v_verified_url, v_verified;

  return query select v_id, v_maps_url, v_verified_url, v_verified;
end;
$$;

-- 4) Save RPC: same sync when admin saves Google Maps URL directly.
create or replace function public.platform_save_church_google_maps(
  p_church_id bigint,
  p_google_maps_url text
)
returns table (
  id bigint,
  google_maps_url text,
  location_verified boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
  v_url text;
  v_verified boolean;
begin
  if p_church_id is null then
    raise exception 'church_id is required';
  end if;

  if p_google_maps_url is null or btrim(p_google_maps_url) = '' then
    raise exception 'google_maps_url is required';
  end if;

  update public.churches c
  set
    google_maps_url = btrim(p_google_maps_url),
    location_verified = true,
    is_verified = true
  where c.id = p_church_id
    and c.is_active = true
  returning c.id, c.google_maps_url, c.location_verified
  into v_id, v_url, v_verified;

  if not found then
    raise exception 'church not found or inactive (id=%)', p_church_id;
  end if;

  return query select v_id, v_url, v_verified;
end;
$$;

comment on view public.church_directory is
  'Lightweight church directory; is_verified reflects Alpha Control location verification or legacy is_verified flag';
