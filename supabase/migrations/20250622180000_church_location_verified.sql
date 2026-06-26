-- Church Location Manager: Google Maps URL + verified flag (additive, safe on prod)

alter table public.churches add column if not exists google_maps_url text;
alter table public.churches add column if not exists location_verified boolean not null default false;

create index if not exists churches_location_verified_active_idx
  on public.churches (location_verified)
  where is_active = true;

comment on column public.churches.google_maps_url is 'Admin-verified Google Maps link for church location';
comment on column public.churches.location_verified is 'True when admin saved a Google Maps URL via Church Location Manager';
