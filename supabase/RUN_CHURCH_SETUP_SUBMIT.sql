-- Paste in Supabase Dashboard → SQL Editor → Run
-- Fixes: church setup submit failures (missing table / RLS / direct insert errors)

-- (same as migration 20260630120000_church_setup_submit_rpc.sql)

create table if not exists public.church_setup_requests (
  id uuid primary key default gen_random_uuid(),
  church_name text not null,
  diocese text,
  governorate text,
  city text,
  address text,
  location_lat numeric,
  location_lng numeric,
  priest_name text,
  priest_phone text,
  priest_email text,
  submitted_by uuid,
  status text not null default 'pending',
  documents jsonb not null default '[]'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists church_setup_requests_status_idx
  on public.church_setup_requests (status);

create index if not exists church_setup_requests_submitted_by_idx
  on public.church_setup_requests (submitted_by);

alter table public.platform_approvals
  add column if not exists type text,
  add column if not exists source_table text,
  add column if not exists source_id uuid,
  add column if not exists created_at timestamptz default now(),
  add column if not exists documents jsonb not null default '[]'::jsonb,
  add column if not exists submitted_by text,
  add column if not exists admin_notes text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.church_setup_requests enable row level security;

drop policy if exists church_setup_requests_public_read on public.church_setup_requests;
create policy church_setup_requests_public_read
  on public.church_setup_requests for select to anon, authenticated using (true);

drop policy if exists church_setup_requests_public_insert on public.church_setup_requests;
create policy church_setup_requests_public_insert
  on public.church_setup_requests for insert to anon, authenticated with check (true);

drop policy if exists church_setup_requests_public_update on public.church_setup_requests;
create policy church_setup_requests_public_update
  on public.church_setup_requests for update to anon, authenticated using (true) with check (true);

drop policy if exists platform_approvals_anon_all on public.platform_approvals;
create policy platform_approvals_anon_all
  on public.platform_approvals for all to anon, authenticated using (true) with check (true);

create or replace function public.submit_church_setup_request(p_row jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_setup_id uuid;
  v_approval_id uuid;
  v_request_no text;
  v_church_name text;
  v_priest_name text;
  v_submitted_by uuid;
  v_documents jsonb;
  v_payload jsonb;
  v_notes text;
  v_approval_payload jsonb;
  v_submitter_label text;
begin
  v_church_name := nullif(btrim(p_row->>'church_name'), '');
  v_priest_name := nullif(btrim(p_row->>'priest_name'), '');

  if v_church_name is null then
    raise exception 'invalid_form:church_name_required';
  end if;

  if v_priest_name is null then
    raise exception 'invalid_form:priest_name_required';
  end if;

  v_submitted_by := case
    when nullif(btrim(p_row->>'submitted_by'), '') is not null
      then (p_row->>'submitted_by')::uuid
    else v_user
  end;

  v_documents := coalesce(p_row->'documents', '[]'::jsonb);
  v_payload := coalesce(p_row->'payload', '{}'::jsonb);
  v_notes := nullif(btrim(p_row->>'notes'), '');

  insert into public.church_setup_requests (
    church_name, diocese, governorate, city, address,
    location_lat, location_lng, priest_name, priest_phone, priest_email,
    submitted_by, status, documents, payload, notes, updated_at
  )
  values (
    v_church_name,
    nullif(btrim(p_row->>'diocese'), ''),
    nullif(btrim(p_row->>'governorate'), ''),
    nullif(btrim(p_row->>'city'), ''),
    nullif(btrim(p_row->>'address'), ''),
    nullif(p_row->>'location_lat', '')::numeric,
    nullif(p_row->>'location_lng', '')::numeric,
    v_priest_name,
    nullif(btrim(p_row->>'priest_phone'), ''),
    nullif(btrim(p_row->>'priest_email'), ''),
    v_submitted_by,
    coalesce(nullif(btrim(p_row->>'status'), ''), 'pending'),
    v_documents,
    v_payload,
    v_notes,
    now()
  )
  returning id into v_setup_id;

  v_request_no := 'CH-' || to_char(now(), 'YYYY') || '-'
    || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  v_submitter_label := coalesce(v_submitted_by::text, v_priest_name);

  v_approval_payload := jsonb_build_object(
    'churchName', v_church_name,
    'diocese', coalesce(p_row->>'diocese', ''),
    'governorate', coalesce(p_row->>'governorate', ''),
    'city', coalesce(p_row->>'city', ''),
    'address', coalesce(p_row->>'address', ''),
    'priestName', v_priest_name,
    'phone', coalesce(
      nullif(btrim(p_row->>'priest_phone'), ''),
      nullif(btrim(p_row->>'church_phone'), ''),
      nullif(btrim(v_payload->>'churchPhone'), '')
    ),
    'email', coalesce(p_row->>'priest_email', ''),
    'responsiblePriest', v_priest_name,
    'submittedBy', v_submitter_label,
    'verificationStatus', 'قيد المراجعة',
    'applicantNotes', coalesce(v_notes, '')
  );

  insert into public.platform_approvals (
    request_no, kind, type, title, kind_label, submitted_at, status, priority,
    source_table, source_id, submitted_by, payload, documents, updated_at
  )
  values (
    v_request_no, 'church_setup', 'church_setup',
    'طلب تأسيس — ' || v_church_name, 'تأسيس كنيسة',
    now(), 'pending', 'high',
    'church_setup_requests', v_setup_id, v_submitter_label,
    v_approval_payload, v_documents, now()
  )
  returning id into v_approval_id;

  return jsonb_build_object(
    'ok', true,
    'setupRequestId', v_setup_id,
    'approvalId', v_approval_id,
    'requestNo', v_request_no
  );
end;
$$;

create or replace function public.update_church_setup_request(
  p_setup_id uuid,
  p_approval_id uuid,
  p_row jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_church_name text;
  v_priest_name text;
  v_documents jsonb;
  v_payload jsonb;
  v_notes text;
  v_request_no text;
  v_approval_payload jsonb;
begin
  v_church_name := nullif(btrim(p_row->>'church_name'), '');
  v_priest_name := nullif(btrim(p_row->>'priest_name'), '');

  if v_church_name is null or v_priest_name is null then
    raise exception 'invalid_form:required_fields';
  end if;

  v_documents := coalesce(p_row->'documents', '[]'::jsonb);
  v_payload := coalesce(p_row->'payload', '{}'::jsonb);
  v_notes := nullif(btrim(p_row->>'notes'), '');

  update public.church_setup_requests
  set
    church_name = v_church_name,
    diocese = nullif(btrim(p_row->>'diocese'), ''),
    governorate = nullif(btrim(p_row->>'governorate'), ''),
    city = nullif(btrim(p_row->>'city'), ''),
    address = nullif(btrim(p_row->>'address'), ''),
    location_lat = nullif(p_row->>'location_lat', '')::numeric,
    location_lng = nullif(p_row->>'location_lng', '')::numeric,
    priest_name = v_priest_name,
    priest_phone = nullif(btrim(p_row->>'priest_phone'), ''),
    priest_email = nullif(btrim(p_row->>'priest_email'), ''),
    status = 'pending',
    documents = v_documents,
    payload = v_payload,
    notes = v_notes,
    updated_at = now()
  where id = p_setup_id;

  if not found then
    raise exception 'not_found:setup_request';
  end if;

  v_approval_payload := jsonb_build_object(
    'churchName', v_church_name,
    'diocese', coalesce(p_row->>'diocese', ''),
    'city', coalesce(p_row->>'city', ''),
    'address', coalesce(p_row->>'address', ''),
    'priestName', v_priest_name,
    'phone', coalesce(
      nullif(btrim(p_row->>'priest_phone'), ''),
      nullif(btrim(p_row->>'church_phone'), ''),
      nullif(btrim(v_payload->>'churchPhone'), '')
    ),
    'email', coalesce(p_row->>'priest_email', ''),
    'responsiblePriest', v_priest_name,
    'applicantNotes', coalesce(v_notes, '')
  );

  update public.platform_approvals
  set
    status = 'pending',
    payload = v_approval_payload,
    documents = v_documents,
    admin_notes = null,
    rejection_reason = null,
    updated_at = now()
  where id = p_approval_id;

  if not found then
    raise exception 'not_found:approval';
  end if;

  select request_no into v_request_no
  from public.platform_approvals
  where id = p_approval_id;

  return jsonb_build_object(
    'ok', true,
    'setupRequestId', p_setup_id,
    'approvalId', p_approval_id,
    'requestNo', coalesce(v_request_no, 'CH-' || to_char(now(), 'YYYY'))
  );
end;
$$;

grant execute on function public.submit_church_setup_request(jsonb) to anon, authenticated;
grant execute on function public.update_church_setup_request(uuid, uuid, jsonb) to anon, authenticated;
