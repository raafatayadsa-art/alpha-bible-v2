-- ALPHA-PUBLISHER-LEGAL-001 — consent, copyright reports, investigation, trusted fast-track

-- ---------------------------------------------------------------------------
-- Enum extensions
-- ---------------------------------------------------------------------------
do $$ begin
  alter type public.publisher_content_status add value if not exists 'under_investigation';
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.publisher_copyright_report_kind as enum (
    'ownership_claim',
    'copyright_violation',
    'removal_request'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.publisher_copyright_report_status as enum (
    'pending',
    'under_investigation',
    'resolved_removed',
    'resolved_kept',
    'dismissed'
  );
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Legal consents
-- ---------------------------------------------------------------------------
create table if not exists public.publisher_legal_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  publisher_id uuid references public.publishers (id) on delete cascade,
  consent_kind text not null check (consent_kind in ('publisher_application', 'content_upload')),
  policy_version text not null default 'legal-001',
  accepted_at timestamptz not null default now()
);

create index if not exists publisher_legal_consents_user_idx
  on public.publisher_legal_consents (user_id, consent_kind);

alter table public.publisher_legal_consents enable row level security;

drop policy if exists publisher_legal_consents_self on public.publisher_legal_consents;
create policy publisher_legal_consents_self on public.publisher_legal_consents
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert on public.publisher_legal_consents to authenticated;

-- ---------------------------------------------------------------------------
-- Copyright reports
-- ---------------------------------------------------------------------------
create table if not exists public.publisher_copyright_reports (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.publisher_content_items (id) on delete cascade,
  publisher_id uuid not null references public.publishers (id) on delete cascade,
  reporter_user_id uuid references auth.users (id) on delete set null,
  report_kind public.publisher_copyright_report_kind not null,
  description text not null,
  status public.publisher_copyright_report_status not null default 'pending',
  admin_notes text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists publisher_copyright_reports_status_idx
  on public.publisher_copyright_reports (status, created_at desc);

alter table public.publisher_copyright_reports enable row level security;

drop policy if exists publisher_copyright_reports_insert on public.publisher_copyright_reports;
create policy publisher_copyright_reports_insert on public.publisher_copyright_reports
  for insert to authenticated
  with check (reporter_user_id = auth.uid());

drop policy if exists publisher_copyright_reports_reporter_read on public.publisher_copyright_reports;
create policy publisher_copyright_reports_reporter_read on public.publisher_copyright_reports
  for select to authenticated
  using (reporter_user_id = auth.uid());

drop policy if exists publisher_copyright_reports_admin on public.publisher_copyright_reports;
create policy publisher_copyright_reports_admin on public.publisher_copyright_reports
  for all to authenticated
  using (true)
  with check (true);

grant select, insert, update on public.publisher_copyright_reports to authenticated;

-- ---------------------------------------------------------------------------
-- Consent RPC
-- ---------------------------------------------------------------------------
create or replace function public.record_publisher_legal_consent(
  p_consent_kind text,
  p_publisher_id uuid default null,
  p_policy_version text default 'legal-001'
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
  values (v_user, p_publisher_id, p_consent_kind, coalesce(nullif(trim(p_policy_version), ''), 'legal-001'))
  returning id into v_id;

  return json_build_object('ok', true, 'consentId', v_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- Copyright report RPC
-- ---------------------------------------------------------------------------
create or replace function public.submit_publisher_copyright_report(
  p_content_id uuid,
  p_report_kind public.publisher_copyright_report_kind,
  p_description text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_item record;
  v_id uuid;
  v_request_no text;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if coalesce(length(trim(p_description)), 0) < 10 then raise exception 'invalid_description'; end if;

  select c.*, p.name as publisher_name
  into v_item
  from public.publisher_content_items c
  join public.publishers p on p.id = c.publisher_id
  where c.id = p_content_id and c.status = 'approved';

  if not found then raise exception 'not_found'; end if;

  insert into public.publisher_copyright_reports (
    content_id, publisher_id, reporter_user_id, report_kind, description, status
  )
  values (
    p_content_id, v_item.publisher_id, v_user, p_report_kind,
    trim(p_description), 'under_investigation'
  )
  returning id into v_id;

  update public.publisher_content_items
  set status = 'under_investigation', updated_at = now()
  where id = p_content_id;

  v_request_no := 'CP-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0');

  insert into public.platform_approvals (request_no, kind, title, kind_label, status, priority, payload)
  values (
    v_request_no,
    'critical_report',
    'بلاغ حقوق نشر — ' || v_item.title,
    'حقوق نشر',
    'pending',
    'high',
    jsonb_build_object(
      'reportId', v_id::text,
      'contentId', p_content_id::text,
      'publisherId', v_item.publisher_id::text,
      'publisherName', v_item.publisher_name,
      'reportKind', p_report_kind::text
    )
  );

  return json_build_object('ok', true, 'reportId', v_id);
end;
$$;

create or replace function public.resolve_publisher_copyright_report(
  p_report_id uuid,
  p_action text,
  p_admin_notes text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
  v_status public.publisher_copyright_report_status;
  v_content_status public.publisher_content_status;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;

  select * into v_row from public.publisher_copyright_reports where id = p_report_id;
  if not found then raise exception 'not_found'; end if;

  case p_action
    when 'remove' then
      v_status := 'resolved_removed';
      v_content_status := 'rejected';
    when 'keep' then
      v_status := 'resolved_kept';
      v_content_status := 'approved';
    when 'dismiss' then
      v_status := 'dismissed';
      v_content_status := 'approved';
    else raise exception 'invalid_action';
  end case;

  update public.publisher_copyright_reports
  set status = v_status, admin_notes = nullif(trim(p_admin_notes), ''),
      resolved_at = now(), updated_at = now()
  where id = p_report_id;

  update public.publisher_content_items
  set status = v_content_status, updated_at = now()
  where id = v_row.content_id;

  return json_build_object('ok', true, 'status', v_status::text);
end;
$$;

-- ---------------------------------------------------------------------------
-- Trusted fast-track + legal gate on content submit
-- ---------------------------------------------------------------------------
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
  v_has_consent boolean;
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
  values (v_user, p_publisher_id, 'content_upload', 'legal-001');

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

-- Application legal gate
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
  values (v_user, v_id, 'publisher_application', 'legal-001');

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

grant execute on function public.record_publisher_legal_consent(text, uuid, text) to authenticated;
grant execute on function public.submit_publisher_copyright_report(uuid, public.publisher_copyright_report_kind, text) to authenticated;
grant execute on function public.resolve_publisher_copyright_report(uuid, text, text) to authenticated;
