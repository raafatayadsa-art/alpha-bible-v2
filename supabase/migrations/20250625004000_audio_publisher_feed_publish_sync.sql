-- Publish audio publishers for /audio feed + auto-publish on setup approval when ready.

create or replace function public.publisher_has_public_audio_content(p_publisher_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.publisher_content_items c
    where c.publisher_id = p_publisher_id
      and c.status = 'approved'
      and c.visibility = 'public'
      and c.content_kind in ('hymn', 'album', 'playlist', 'lecture')
  );
$$;

create or replace function public.publish_audio_publisher_if_ready(p_publisher_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type text;
begin
  select p.publisher_type::text into v_type
  from public.publishers p
  where p.id = p_publisher_id;

  if v_type is null then
    return false;
  end if;

  if v_type not in ('hymn_team', 'choir', 'church_service') then
    return false;
  end if;

  if not public.publisher_has_public_audio_content(p_publisher_id) then
    return false;
  end if;

  update public.publishers
  set
    status = 'published',
    is_public = true,
    is_trusted = true,
    published_at = coalesce(published_at, now()),
    updated_at = now()
  where id = p_publisher_id
    and (status is distinct from 'published' or is_public is distinct from true);

  perform public.refresh_publisher_readiness(p_publisher_id);
  return true;
end;
$$;

create or replace function public.apply_publisher_approval_sync(
  p_approval_id uuid,
  p_status text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_kind text;
  v_payload jsonb;
  v_publisher_id uuid;
  v_norm text := lower(trim(coalesce(p_status, '')));
  v_publisher_type text;
  v_published boolean := false;
begin
  if p_approval_id is null then
    return json_build_object('ok', false, 'reason', 'missing_approval_id');
  end if;

  select coalesce(nullif(trim(a.type), ''), a.kind), coalesce(a.payload, '{}'::jsonb)
  into v_kind, v_payload
  from public.platform_approvals a
  where a.id = p_approval_id;

  if v_kind is null then
    return json_build_object('ok', false, 'reason', 'approval_not_found');
  end if;

  if v_kind not in ('publisher_setup', 'publisher_publication') then
    return json_build_object('ok', false, 'reason', 'unsupported_kind', 'kind', v_kind);
  end if;

  begin
    v_publisher_id := nullif(trim(v_payload->>'publisherId'), '')::uuid;
  exception when others then
    v_publisher_id := null;
  end;

  if v_publisher_id is null then
    begin
      v_publisher_id := nullif(trim(v_payload->>'publisher_id'), '')::uuid;
    exception when others then
      v_publisher_id := null;
    end;
  end if;

  if v_publisher_id is null then
    select p.id into v_publisher_id
    from public.publishers p
    where p.identity_approval_id = p_approval_id
    limit 1;
  end if;

  if v_publisher_id is null then
    return json_build_object('ok', false, 'reason', 'publisher_id_missing', 'kind', v_kind);
  end if;

  select p.publisher_type::text into v_publisher_type
  from public.publishers p
  where p.id = v_publisher_id;

  if v_kind = 'publisher_setup' then
    if v_norm = 'approved' then
      update public.publishers
      set status = 'draft', updated_at = now()
      where id = v_publisher_id;
      perform public.refresh_publisher_readiness(v_publisher_id);

      -- Audio publishers with public listen content go live immediately after identity approval.
      if v_publisher_type in ('hymn_team', 'choir', 'church_service') then
        v_published := public.publish_audio_publisher_if_ready(v_publisher_id);
      end if;
    elsif v_norm = 'rejected' then
      update public.publishers
      set status = 'suspended', updated_at = now()
      where id = v_publisher_id;
    end if;
  elsif v_kind = 'publisher_publication' then
    if v_norm = 'approved' then
      update public.publishers
      set
        status = 'published',
        is_public = true,
        is_trusted = true,
        published_at = coalesce(published_at, now()),
        updated_at = now()
      where id = v_publisher_id;

      update public.publisher_content_items
      set
        status = 'approved',
        reviewed_at = now(),
        updated_at = now()
      where publisher_id = v_publisher_id
        and status in ('pending_review', 'draft');

      perform public.refresh_publisher_readiness(v_publisher_id);

      update public.publishers p
      set content_count = (
        select count(*)::int
        from public.publisher_content_items c
        where c.publisher_id = p.id and c.status = 'approved'
      ),
      updated_at = now()
      where p.id = v_publisher_id;

      v_published := true;
    elsif v_norm in ('rejected', 'needs_changes', 'needs_info') then
      update public.publishers
      set status = 'draft', updated_at = now()
      where id = v_publisher_id;
    end if;
  end if;

  return json_build_object(
    'ok', true,
    'kind', v_kind,
    'publisherId', v_publisher_id::text,
    'status', v_norm,
    'published', v_published
  );
exception
  when others then
    return json_build_object('ok', false, 'reason', SQLERRM, 'kind', v_kind);
end;
$$;

-- Repair: publish audio publishers that already have public listen content.
do $$
declare
  r record;
begin
  for r in
    select p.id
    from public.publishers p
    where p.publisher_type in ('hymn_team', 'choir', 'church_service')
      and (p.status is distinct from 'published' or p.is_public is distinct from true)
      and public.publisher_has_public_audio_content(p.id)
  loop
    perform public.publish_audio_publisher_if_ready(r.id);
    raise notice 'audio publisher repair published %', r.id;
  end loop;
end;
$$;

grant execute on function public.publisher_has_public_audio_content(uuid) to authenticated, anon;
grant execute on function public.publish_audio_publisher_if_ready(uuid) to authenticated;

comment on function public.publish_audio_publisher_if_ready(uuid) is
  'Sets publisher published+public when audio-type page has approved public listen content.';
