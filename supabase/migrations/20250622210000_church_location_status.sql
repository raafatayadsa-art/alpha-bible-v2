-- Church Location Manager: location_status for auto-verify queue + mark RPC.

alter table public.churches add column if not exists location_status text;

comment on column public.churches.location_status is
  'Auto-verify queue: needs_review when URL is search/ambiguous; null when pending or verified';

create or replace function public.platform_mark_church_location_needs_review(p_church_id bigint)
returns table (
  id bigint,
  location_status text,
  location_verified boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
  v_status text;
  v_verified boolean;
begin
  if p_church_id is null then
    raise exception 'church_id is required';
  end if;

  update public.churches c
  set location_status = 'needs_review'
  where c.id = p_church_id
    and c.is_active = true
    and c.location_verified = false
  returning c.id, c.location_status, c.location_verified
  into v_id, v_status, v_verified;

  if not found then
    raise exception 'church not found, inactive, or already verified (id=%)', p_church_id;
  end if;

  return query select v_id, v_status, v_verified;
end;
$$;

revoke all on function public.platform_mark_church_location_needs_review(bigint) from public;
grant execute on function public.platform_mark_church_location_needs_review(bigint) to anon, authenticated;

comment on function public.platform_mark_church_location_needs_review(bigint) is
  'Platform admin: flag unverified church for manual location review';

-- Clear needs_review when manually or auto verifying.
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
    location_status = null
  where c.id = p_church_id
    and c.is_active = true
  returning c.id, c.google_maps_url, c.verified_location_url, c.location_verified
  into v_id, v_maps_url, v_verified_url, v_verified;

  return query select v_id, v_maps_url, v_verified_url, v_verified;
end;
$$;
