-- Run in Supabase SQL Editor if migration not yet pushed.
-- Links location_verified (Alpha Control) → is_verified (Church Directory).

update public.churches
set is_verified = true
where location_verified = true
  and coalesce(is_verified, false) = false;

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

-- (RPC updates for platform_verify_church_location + platform_save_church_google_maps)
-- See: supabase/migrations/20250623150000_church_directory_verified_link.sql

-- Audit:
-- select count(*) filter (where location_verified) as location_verified,
--        count(*) filter (where is_verified) as is_verified
-- from public.churches where is_active = true;
