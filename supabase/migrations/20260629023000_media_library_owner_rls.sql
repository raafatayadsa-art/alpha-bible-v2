-- Media Library — platform owner RLS for Alpha Control Media Manager
-- Enables owner SELECT / UPDATE / DELETE on media_library + alpha-media storage cleanup

create or replace function public.is_platform_owner(p_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_owners po
    where po.user_id = coalesce(p_user, auth.uid())
  );
$$;

revoke all on function public.is_platform_owner(uuid) from public;
grant execute on function public.is_platform_owner(uuid) to authenticated;

-- Owner can list all media (pending, approved, rejected) in Media Manager
drop policy if exists media_library_owner_select on public.media_library;
create policy media_library_owner_select
  on public.media_library
  for select
  to authenticated
  using (public.is_platform_owner());

-- Owner approve / reject / set primary
drop policy if exists media_library_owner_update on public.media_library;
create policy media_library_owner_update
  on public.media_library
  for update
  to authenticated
  using (public.is_platform_owner())
  with check (public.is_platform_owner());

-- Owner delete from Media Manager
drop policy if exists media_library_owner_delete on public.media_library;
create policy media_library_owner_delete
  on public.media_library
  for delete
  to authenticated
  using (public.is_platform_owner());

-- Storage cleanup when owner deletes media rows
drop policy if exists alpha_media_owner_delete on storage.objects;
create policy alpha_media_owner_delete
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'alpha-media' and public.is_platform_owner());

drop policy if exists alpha_media_owner_update on storage.objects;
create policy alpha_media_owner_update
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'alpha-media' and public.is_platform_owner())
  with check (bucket_id = 'alpha-media' and public.is_platform_owner());
