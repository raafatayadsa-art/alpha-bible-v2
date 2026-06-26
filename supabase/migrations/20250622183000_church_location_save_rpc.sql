-- Church Location Manager: allow platform admin saves via security definer RPC.
-- Root cause: churches table had SELECT-only RLS; direct PATCH updated 0 rows with no error.

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
    location_verified = true
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

revoke all on function public.platform_save_church_google_maps(bigint, text) from public;
grant execute on function public.platform_save_church_google_maps(bigint, text) to anon, authenticated;

comment on function public.platform_save_church_google_maps(bigint, text) is
  'Platform admin: persist Google Maps URL and set location_verified=true for an active church';
