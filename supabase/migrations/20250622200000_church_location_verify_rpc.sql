-- Church Location Manager: one-tap verify using existing google_maps_url (no paste).

alter table public.churches add column if not exists verified_location_url text;

comment on column public.churches.verified_location_url is
  'Snapshot of google_maps_url at admin verification time';

create or replace function public.platform_verify_church_location(p_church_id bigint)
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
begin
  if p_church_id is null then
    raise exception 'church_id is required';
  end if;

  update public.churches c
  set
    location_verified = true,
    verified_location_url = btrim(c.google_maps_url)
  where c.id = p_church_id
    and c.is_active = true
    and c.google_maps_url is not null
    and btrim(c.google_maps_url) <> ''
  returning c.id, c.google_maps_url, c.verified_location_url, c.location_verified
  into v_id, v_maps_url, v_verified_url, v_verified;

  if not found then
    raise exception 'church not found, inactive, or missing google_maps_url (id=%)', p_church_id;
  end if;

  return query select v_id, v_maps_url, v_verified_url, v_verified;
end;
$$;

revoke all on function public.platform_verify_church_location(bigint) from public;
grant execute on function public.platform_verify_church_location(bigint) to anon, authenticated;

comment on function public.platform_verify_church_location(bigint) is
  'Platform admin: set location_verified=true and verified_location_url=google_maps_url';
