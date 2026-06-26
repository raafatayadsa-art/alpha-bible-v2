-- Publisher assets: images, audio, video, PDF (workspace + content uploads)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'publisher-assets',
  'publisher-assets',
  true,
  104857600,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/webm', 'audio/ogg', 'audio/aac',
    'video/mp4', 'video/webm', 'video/quicktime',
    'application/pdf'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists publisher_assets_storage_read on storage.objects;
create policy publisher_assets_storage_read
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'publisher-assets');

drop policy if exists publisher_assets_storage_insert on storage.objects;
create policy publisher_assets_storage_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'publisher-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists publisher_assets_storage_update on storage.objects;
create policy publisher_assets_storage_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'publisher-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists publisher_assets_storage_delete on storage.objects;
create policy publisher_assets_storage_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'publisher-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
