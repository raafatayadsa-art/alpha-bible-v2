-- Any publisher content edit returns to pending_review (re-verification), including trusted publishers.
-- Trusted publishers still get instant approve on *new* submit via submit_publisher_content.

create or replace function public.update_publisher_content(
  p_content_id uuid,
  p_title text default null,
  p_description text default null,
  p_cover_url text default null,
  p_media_url text default null,
  p_payload jsonb default null,
  p_visibility public.publisher_content_visibility default null,
  p_allow_download boolean default null,
  p_duration_seconds int default null,
  p_legal_consent boolean default false
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_item record;
  v_status public.publisher_content_status := 'pending_review';
  v_new_media text;
  v_approval_id uuid;
  v_request_no text;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if coalesce(p_legal_consent, false) is not true then raise exception 'legal_consent_required'; end if;

  select ci.*, p.is_trusted, p.status as pub_status, p.name as pub_name
  into v_item
  from public.publisher_content_items ci
  join public.publishers p on p.id = ci.publisher_id
  where ci.id = p_content_id;

  if not found then raise exception 'not_found'; end if;
  if v_item.pub_status = 'suspended' then raise exception 'suspended'; end if;
  if not public.publisher_team_has_perm(v_item.publisher_id, 'manage_content', v_user) then
    raise exception 'forbidden';
  end if;

  if p_title is not null and coalesce(length(trim(p_title)), 0) < 2 then
    raise exception 'invalid_title';
  end if;

  insert into public.publisher_legal_consents (user_id, publisher_id, consent_kind, policy_version)
  values (v_user, v_item.publisher_id, 'content_upload', '1.0');

  v_new_media := case
    when p_media_url is not null then nullif(trim(p_media_url), '')
    else v_item.media_url
  end;

  update public.publisher_content_items
  set
    title = coalesce(nullif(trim(p_title), ''), title),
    description = case when p_description is not null then nullif(trim(p_description), '') else description end,
    cover_url = case when p_cover_url is not null then nullif(trim(p_cover_url), '') else cover_url end,
    media_url = v_new_media,
    payload = case when p_payload is not null then p_payload else payload end,
    visibility = coalesce(p_visibility, visibility),
    allow_download = coalesce(p_allow_download, allow_download),
    duration_seconds = coalesce(p_duration_seconds, duration_seconds),
    status = v_status,
    updated_at = now()
  where id = p_content_id;

  v_request_no := 'CR-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
  insert into public.platform_approvals (request_no, kind, title, kind_label, status, priority, payload)
  values (
    v_request_no, 'content_review', 'مراجعة محتوى — ' || coalesce(nullif(trim(p_title), ''), v_item.title),
    'محتوى ناشر', 'pending', 'normal',
    jsonb_build_object(
      'contentId', p_content_id::text, 'publisherId', v_item.publisher_id::text,
      'publisherName', v_item.pub_name, 'contentKind', v_item.content_kind::text,
      'title', coalesce(nullif(trim(p_title), ''), v_item.title), 'isUpdate', true
    )
  )
  returning id into v_approval_id;

  update public.publisher_content_items
  set approval_id = v_approval_id, updated_at = now()
  where id = p_content_id;

  perform public.refresh_publisher_readiness(v_item.publisher_id);
  return json_build_object(
    'ok', true,
    'contentId', p_content_id,
    'status', v_status::text,
    'reReview', true
  );
end;
$$;
