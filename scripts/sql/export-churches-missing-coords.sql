-- Export churches missing coordinates as JSON.
-- Supabase Dashboard → SQL Editor → paste → Run → copy the JSON cell.

SELECT coalesce(
  json_agg(
    json_build_object(
      'id', c.id,
      'church_name', c.church_name,
      'formatted_address', c.formatted_address,
      'city', c.city,
      'governorate', c.governorate,
      'country', c.country
    )
    ORDER BY c.id
  ),
  '[]'::json
) AS churches_to_geocode
FROM public.churches c
WHERE c.is_active = true
  AND (c.latitude IS NULL OR c.longitude IS NULL);
