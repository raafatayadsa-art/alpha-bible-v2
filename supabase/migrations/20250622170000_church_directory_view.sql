-- Church Directory — lightweight view + paginated search RPC (map/list only)

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
  c.is_verified,
  c.latitude,
  c.longitude
from public.churches c
where c.is_active = true;

grant select on public.church_directory to anon, authenticated;

create or replace function public.search_church_directory(
  p_query text default null,
  p_governorate text default null,
  p_city text default null,
  p_patron_saint text default null,
  p_verified_only boolean default false,
  p_nearby_only boolean default false,
  p_user_lat double precision default null,
  p_user_lng double precision default null,
  p_nearby_km double precision default 35,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  id bigint,
  church_name text,
  patron_saint text,
  city text,
  governorate text,
  country text,
  church_logo text,
  is_verified boolean,
  latitude numeric,
  longitude numeric,
  distance_km double precision,
  total_count bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  with base as (
    select
      d.*,
      case
        when p_user_lat is not null
          and p_user_lng is not null
          and d.latitude is not null
          and d.longitude is not null
        then (
          6371 * acos(
            least(1.0, greatest(-1.0,
              cos(radians(p_user_lat)) * cos(radians(d.latitude::double precision))
              * cos(radians(d.longitude::double precision) - radians(p_user_lng))
              + sin(radians(p_user_lat)) * sin(radians(d.latitude::double precision))
            ))
          )
        )
        else null::double precision
      end as distance_km
    from public.church_directory d
    where (
      p_query is null
      or btrim(p_query) = ''
      or d.church_name ilike '%' || p_query || '%'
      or coalesce(d.patron_saint, '') ilike '%' || p_query || '%'
      or coalesce(d.city, '') ilike '%' || p_query || '%'
      or coalesce(d.governorate, '') ilike '%' || p_query || '%'
    )
    and (p_governorate is null or btrim(p_governorate) = '' or d.governorate = p_governorate)
    and (p_city is null or btrim(p_city) = '' or d.city = p_city)
    and (
      p_patron_saint is null
      or btrim(p_patron_saint) = ''
      or coalesce(d.patron_saint, '') ilike '%' || p_patron_saint || '%'
    )
    and (not p_verified_only or d.is_verified = true)
  ),
  filtered as (
    select *
    from base
    where (
      not p_nearby_only
      or (distance_km is not null and distance_km <= p_nearby_km)
    )
  ),
  counted as (
    select count(*)::bigint as total_count
    from filtered
  )
  select
    f.id,
    f.church_name,
    f.patron_saint,
    f.city,
    f.governorate,
    f.country,
    f.church_logo,
    f.is_verified,
    f.latitude,
    f.longitude,
    f.distance_km,
    c.total_count
  from filtered f
  cross join counted c
  order by
    case when p_user_lat is not null and p_user_lng is not null then f.distance_km end nulls last,
    f.church_name
  limit greatest(p_limit, 1)
  offset greatest(p_offset, 0);
$$;

grant execute on function public.search_church_directory(
  text, text, text, text, boolean, boolean, double precision, double precision, double precision, integer, integer
) to anon, authenticated;

create or replace function public.church_directory_facets()
returns json
language sql
stable
security invoker
set search_path = public
as $$
  select json_build_object(
    'governorates', coalesce(
      (select json_agg(g order by g)
       from (select distinct governorate as g from public.church_directory where governorate is not null) s),
      '[]'::json
    ),
    'cities', coalesce(
      (select json_agg(c order by c)
       from (select distinct city as c from public.church_directory where city is not null) s),
      '[]'::json
    ),
    'patronSaints', coalesce(
      (select json_agg(p order by p)
       from (select distinct patron_saint as p from public.church_directory where patron_saint is not null) s),
      '[]'::json
    ),
    'verifiedCount', (select count(*)::int from public.church_directory where is_verified = true),
    'totalCount', (select count(*)::int from public.church_directory)
  );
$$;

grant execute on function public.church_directory_facets() to anon, authenticated;
