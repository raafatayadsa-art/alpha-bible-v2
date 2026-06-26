-- Auto-sync publisher state when approval status changes + trust on publish + repair stuck rows.

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

  if v_kind = 'publisher_setup' then
    if v_norm = 'approved' then
      update public.publishers
      set status = 'draft', updated_at = now()
      where id = v_publisher_id;
      perform public.refresh_publisher_readiness(v_publisher_id);
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
    'status', v_norm
  );
exception
  when others then
    return json_build_object('ok', false, 'reason', SQLERRM, 'kind', v_kind);
end;
$$;

create or replace function public.trg_platform_approval_publisher_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_kind text;
begin
  v_kind := coalesce(nullif(trim(NEW.type), ''), NEW.kind);
  if v_kind not in ('publisher_setup', 'publisher_publication') then
    return NEW;
  end if;
  if NEW.status is distinct from OLD.status
     and NEW.status in ('approved', 'rejected', 'needs_info', 'needs_changes') then
    perform public.apply_publisher_approval_sync(NEW.id, NEW.status);
  end if;
  return NEW;
end;
$$;

drop trigger if exists platform_approval_publisher_sync_trg on public.platform_approvals;
create trigger platform_approval_publisher_sync_trg
  after update of status on public.platform_approvals
  for each row
  execute function public.trg_platform_approval_publisher_sync();

-- Repair rows approved before sync existed.
do $$
declare
  r record;
  v_result json;
begin
  for r in
    select a.id
    from public.platform_approvals a
    where a.kind in ('publisher_setup', 'publisher_publication')
      and a.status = 'approved'
  loop
    v_result := public.apply_publisher_approval_sync(r.id, 'approved');
    raise notice 'publisher repair % => %', r.id, v_result;
  end loop;
end;
$$;
