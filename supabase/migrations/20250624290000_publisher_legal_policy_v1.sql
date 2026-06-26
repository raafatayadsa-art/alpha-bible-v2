-- Align publisher legal policy version to Version 1.0 (ALPHA LEGAL PUBLISHING TERMS)

alter table public.publisher_legal_consents
  alter column policy_version set default '1.0';

create or replace function public.record_publisher_legal_consent(
  p_consent_kind text,
  p_publisher_id uuid default null,
  p_policy_version text default '1.0'
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if p_consent_kind not in ('publisher_application', 'content_upload') then
    raise exception 'invalid_consent_kind';
  end if;

  insert into public.publisher_legal_consents (user_id, publisher_id, consent_kind, policy_version)
  values (v_user, p_publisher_id, p_consent_kind, coalesce(nullif(trim(p_policy_version), ''), '1.0'))
  returning id into v_id;

  return json_build_object('ok', true, 'consentId', v_id);
end;
$$;

-- submit_publisher_content: policy_version 1.0
create or replace function public.submit_publisher_content(
  p_publisher_id uuid,
  p_kind public.publisher_content_kind,
  p_title text,
  p_description text default null,
  p_cover_url text default null,
  p_payload jsonb default '{}'::jsonb,
  p_visibility public.publisher_content_visibility default 'private',
  p_allow_download boolean default false,
  p_duration_seconds int default null,
  p_media_url text default null,
  p_legal_consent boolean default false
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_pub record;
  v_id uuid;
  v_approval_id uuid;
  v_request_no text;
  v_status public.publisher_content_status := 'pending_review';
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if coalesce(p_legal_consent, false) is not true then raise exception 'legal_consent_required'; end if;

  if not public.publisher_team_has_perm(p_publisher_id, 'manage_content', v_user) then
    raise exception 'forbidden';
  end if;

  select * into v_pub from public.publishers where id = p_publisher_id;
  if not found then raise exception 'not_found'; end if;
  if v_pub.status not in ('under_review', 'draft', 'pending_publication') then
    raise exception 'invalid_publisher_state';
  end if;
  if coalesce(length(trim(p_title)), 0) < 2 then raise exception 'invalid_title'; end if;

  insert into public.publisher_legal_consents (user_id, publisher_id, consent_kind, policy_version)
  values (v_user, p_publisher_id, 'content_upload', '1.0');

  if v_pub.is_trusted then
    v_status := 'approved';
  end if;

  insert into public.publisher_content_items (
    publisher_id, content_kind, title, description, cover_url, payload, status, created_by,
    visibility, allow_download, duration_seconds, media_url
  )
  values (
    p_publisher_id, p_kind, trim(p_title), nullif(trim(p_description), ''),
    nullif(trim(p_cover_url), ''), coalesce(p_payload, '{}'::jsonb), v_status, v_user,
    coalesce(p_visibility, 'private'::public.publisher_content_visibility),
    coalesce(p_allow_download, false), p_duration_seconds, nullif(trim(p_media_url), '')
  )
  returning id into v_id;

  if v_status = 'pending_review' then
    v_request_no := 'CR-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
    insert into public.platform_approvals (request_no, kind, title, kind_label, status, priority, payload)
    values (
      v_request_no, 'content_review', 'مراجعة محتوى — ' || trim(p_title), 'محتوى ناشر', 'pending', 'normal',
      jsonb_build_object(
        'contentId', v_id::text, 'publisherId', p_publisher_id::text,
        'publisherName', v_pub.name, 'contentKind', p_kind::text, 'title', trim(p_title),
        'visibility', p_visibility::text, 'allowDownload', coalesce(p_allow_download, false)
      )
    )
    returning id into v_approval_id;
    update public.publisher_content_items set approval_id = v_approval_id, updated_at = now() where id = v_id;
  end if;

  perform public.refresh_publisher_readiness(p_publisher_id);
  return json_build_object('ok', true, 'contentId', v_id, 'status', v_status::text, 'trustedFastTrack', v_pub.is_trusted);
end;
$$;

-- submit_publisher_application: policy_version 1.0
create or replace function public.submit_publisher_application(
  p_type public.publisher_type,
  p_name text,
  p_bio text default null,
  p_logo_url text default null,
  p_cover_url text default null,
  p_phone text default null,
  p_email text default null,
  p_website_url text default null,
  p_legal_consent boolean default false
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
  v_approval_id uuid;
  v_request_no text;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if coalesce(p_legal_consent, false) is not true then raise exception 'legal_consent_required'; end if;
  if p_type in ('church', 'monastery', 'priest', 'bishop') then raise exception 'use_claim_flow'; end if;
  if public.user_owns_self_service_publisher(v_user) then raise exception 'already_has_publisher'; end if;
  if coalesce(length(trim(p_name)), 0) < 2 then raise exception 'invalid_name'; end if;

  insert into public.publishers (
    publisher_type, name, bio, logo_url, cover_url,
    phone, email, website_url, owner_user_id, status, is_public
  )
  values (
    p_type, trim(p_name), nullif(trim(p_bio), ''), nullif(trim(p_logo_url), ''),
    nullif(trim(p_cover_url), ''), nullif(trim(p_phone), ''), nullif(trim(p_email), ''),
    nullif(trim(p_website_url), ''), v_user, 'under_review', false
  )
  returning id into v_id;

  insert into public.publisher_legal_consents (user_id, publisher_id, consent_kind, policy_version)
  values (v_user, v_id, 'publisher_application', '1.0');

  v_request_no := 'PB-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
  insert into public.platform_approvals (request_no, kind, title, kind_label, status, priority, payload)
  values (
    v_request_no, 'publisher_setup', 'طلب ناشر — ' || trim(p_name), 'صفحة ناشر', 'pending', 'normal',
    jsonb_build_object('publisherId', v_id::text, 'publisherType', p_type::text, 'submittedBy', v_user::text, 'name', trim(p_name))
  )
  returning id into v_approval_id;

  update public.publishers set identity_approval_id = v_approval_id, updated_at = now() where id = v_id;
  perform public.refresh_publisher_readiness(v_id);
  return json_build_object('ok', true, 'publisherId', v_id::text, 'approvalId', v_approval_id);
end;
$$;
