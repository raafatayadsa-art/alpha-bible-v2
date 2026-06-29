/*
  RUN IN SUPABASE SQL EDITOR (copy entire file, then Run)
  Media Manager — owner INSERT for uploads

  Prefer CLI:
    $env:SUPABASE_DB_PASSWORD = "your-db-password"
    node scripts/apply-media-library-owner-insert.mjs

  Or:
    npx supabase db push --linked --yes
*/

-- Owner INSERT for Media Manager uploads (alpha-media + media_library)

drop policy if exists alpha_media_owner_insert on storage.objects;
create policy alpha_media_owner_insert
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'alpha-media' and public.is_platform_owner());

drop policy if exists media_library_owner_insert on public.media_library;
create policy media_library_owner_insert
  on public.media_library
  for insert
  to authenticated
  with check (public.is_platform_owner());

notify pgrst, 'reload schema';

-- Verify
select polname, polcmd
from pg_policy p
join pg_class c on c.oid = p.polrelid
join pg_namespace n on n.oid = c.relnamespace
where (
  (n.nspname = 'public' and c.relname = 'media_library' and polname = 'media_library_owner_insert')
  or (n.nspname = 'storage' and c.relname = 'objects' and polname = 'alpha_media_owner_insert')
)
order by polname;
