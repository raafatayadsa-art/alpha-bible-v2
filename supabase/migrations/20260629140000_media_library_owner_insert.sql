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
