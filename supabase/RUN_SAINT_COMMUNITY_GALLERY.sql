/*
  ALPHA-100 — Saint Community Gallery
  Run in Supabase SQL Editor if uploads fail with "Bucket not found"
  or "Could not find the table saint_gallery_images".
*/

-- Tables
create table if not exists public.saint_gallery_images (
  id uuid primary key default gen_random_uuid(),
  saint_id text not null references public.synaxarium_saints(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  thumbnail_url text,
  title text,
  note text,
  status text not null default 'pending'
    check (status in ('pending', 'under_review', 'approved', 'rejected', 'needs_changes')),
  submitted_by uuid,
  contributor_display_name text,
  show_public_name boolean not null default true,
  membership_code text,
  is_featured boolean not null default false,
  like_count integer not null default 0,
  view_count integer not null default 0,
  approved_at timestamptz,
  approved_by text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saint_gallery_images_saint_idx
  on public.saint_gallery_images (saint_id);

create index if not exists saint_gallery_images_status_idx
  on public.saint_gallery_images (status);

create index if not exists saint_gallery_images_submitted_by_idx
  on public.saint_gallery_images (submitted_by);

create index if not exists saint_gallery_images_featured_idx
  on public.saint_gallery_images (saint_id, is_featured)
  where is_featured = true and status = 'approved';

create table if not exists public.saint_gallery_likes (
  image_id uuid not null references public.saint_gallery_images(id) on delete cascade,
  user_key text not null,
  created_at timestamptz not null default now(),
  primary key (image_id, user_key)
);

alter table public.saint_gallery_images enable row level security;
alter table public.saint_gallery_likes enable row level security;

drop policy if exists saint_gallery_images_public_read on public.saint_gallery_images;
create policy saint_gallery_images_public_read
  on public.saint_gallery_images for select to anon, authenticated
  using (status = 'approved' or submitted_by = auth.uid());

drop policy if exists saint_gallery_images_public_insert on public.saint_gallery_images;
create policy saint_gallery_images_public_insert
  on public.saint_gallery_images for insert to anon, authenticated
  with check (true);

drop policy if exists saint_gallery_images_public_update on public.saint_gallery_images;
create policy saint_gallery_images_public_update
  on public.saint_gallery_images for update to anon, authenticated
  using (true) with check (true);

drop policy if exists saint_gallery_likes_public_all on public.saint_gallery_likes;
create policy saint_gallery_likes_public_all
  on public.saint_gallery_likes for all to anon, authenticated
  using (true) with check (true);

-- Storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'saint-gallery',
  'saint-gallery',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists saint_gallery_storage_read on storage.objects;
create policy saint_gallery_storage_read
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'saint-gallery');

drop policy if exists saint_gallery_storage_insert on storage.objects;
create policy saint_gallery_storage_insert
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'saint-gallery');

drop policy if exists saint_gallery_storage_update on storage.objects;
create policy saint_gallery_storage_update
  on storage.objects for update to anon, authenticated
  using (bucket_id = 'saint-gallery')
  with check (bucket_id = 'saint-gallery');

notify pgrst, 'reload schema';
