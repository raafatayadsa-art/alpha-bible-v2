-- Church setup requests + platform_approvals source linking

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

-- Extend platform_approvals for source-linked workflow
alter table public.platform_approvals
  add column if not exists type text,
  add column if not exists source_table text,
  add column if not exists source_id uuid,
  add column if not exists created_at timestamptz default now();

update public.platform_approvals
set type = coalesce(type, kind),
    created_at = coalesce(created_at, submitted_at, now())
where type is null or created_at is null;

create index if not exists platform_approvals_source_idx
  on public.platform_approvals (source_table, source_id);

create index if not exists platform_approvals_type_idx
  on public.platform_approvals (type);

-- RLS — dev-friendly (matches post_registrations pattern)
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
