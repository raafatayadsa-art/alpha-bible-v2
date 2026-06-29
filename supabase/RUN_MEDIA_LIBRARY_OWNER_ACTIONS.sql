-- Media Library — owner action RPCs (approve / reject / set primary / delete)
-- Works even when direct UPDATE/DELETE is blocked by RLS for the client role.

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

create or replace function public.platform_assert_media_owner()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;
  if not public.is_platform_owner(uid) then
    raise exception 'not_platform_owner';
  end if;
  return uid;
end;
$$;

revoke all on function public.platform_assert_media_owner() from public;
grant execute on function public.platform_assert_media_owner() to authenticated;

create or replace function public.platform_media_approve(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
begin
  uid := public.platform_assert_media_owner();

  update public.media_library
  set status = 'approved', approved_by = uid::text
  where id = p_id;

  if not found then
    raise exception 'media_not_found';
  end if;

  return jsonb_build_object('ok', true, 'id', p_id, 'status', 'approved');
end;
$$;

create or replace function public.platform_media_reject(p_id uuid, p_reason text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.platform_assert_media_owner();

  update public.media_library
  set status = 'rejected', is_primary = false
  where id = p_id;

  if not found then
    raise exception 'media_not_found';
  end if;

  if coalesce(trim(p_reason), '') <> '' then
    insert into public.platform_audit_log (action, admin, reason, scan_meta)
    values (
      'media_reject',
      'Owner',
      trim(p_reason),
      jsonb_build_object('entity_type', 'media_library', 'entity_id', p_id::text)
    );
  end if;

  return jsonb_build_object('ok', true, 'id', p_id, 'status', 'rejected');
end;
$$;

create or replace function public.platform_media_set_primary(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  r public.media_library%rowtype;
begin
  uid := public.platform_assert_media_owner();

  select * into r from public.media_library where id = p_id;
  if not found then
    raise exception 'media_not_found';
  end if;

  if r.entity_type is not null and r.entity_id is not null then
    update public.media_library
    set is_primary = false
    where entity_type = r.entity_type
      and entity_id = r.entity_id
      and id <> p_id;
  else
    update public.media_library
    set is_primary = false
    where category = r.category
      and coalesce(entity_type, '') = coalesce(r.entity_type, '')
      and coalesce(entity_id, '') = coalesce(r.entity_id, '')
      and id <> p_id;
  end if;

  update public.media_library
  set is_primary = true, status = 'approved', approved_by = uid::text
  where id = p_id;

  return jsonb_build_object('ok', true, 'id', p_id, 'is_primary', true, 'status', 'approved');
end;
$$;

create or replace function public.platform_media_delete(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.media_library%rowtype;
begin
  perform public.platform_assert_media_owner();

  select * into r from public.media_library where id = p_id;
  if not found then
    raise exception 'media_not_found';
  end if;

  if coalesce(trim(r.storage_path), '') <> '' then
    begin
      delete from storage.objects
      where bucket_id = 'alpha-media'
        and name = trim(r.storage_path);
    exception
      when others then
        null;
    end;
  end if;

  delete from public.media_library where id = p_id;

  return jsonb_build_object('ok', true, 'id', p_id);
end;
$$;

revoke all on function public.platform_media_approve(uuid) from public;
grant execute on function public.platform_media_approve(uuid) to authenticated;

revoke all on function public.platform_media_reject(uuid, text) from public;
grant execute on function public.platform_media_reject(uuid, text) to authenticated;

revoke all on function public.platform_media_set_primary(uuid) from public;
grant execute on function public.platform_media_set_primary(uuid) to authenticated;

revoke all on function public.platform_media_delete(uuid) from public;
grant execute on function public.platform_media_delete(uuid) to authenticated;

-- Owner RLS (idempotent)
drop policy if exists media_library_owner_select on public.media_library;
create policy media_library_owner_select
  on public.media_library for select to authenticated
  using (public.is_platform_owner());

drop policy if exists media_library_owner_update on public.media_library;
create policy media_library_owner_update
  on public.media_library for update to authenticated
  using (public.is_platform_owner()) with check (public.is_platform_owner());

drop policy if exists media_library_owner_delete on public.media_library;
create policy media_library_owner_delete
  on public.media_library for delete to authenticated
  using (public.is_platform_owner());

drop policy if exists alpha_media_owner_delete on storage.objects;
create policy alpha_media_owner_delete
  on storage.objects for delete to authenticated
  using (bucket_id = 'alpha-media' and public.is_platform_owner());

notify pgrst, 'reload schema';

-- Verify (optional — should return 4 rows)
select proname
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in (
    'platform_media_approve',
    'platform_media_reject',
    'platform_media_set_primary',
    'platform_media_delete',
    'is_platform_owner'
  )
order by proname;
