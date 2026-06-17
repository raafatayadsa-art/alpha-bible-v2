-- Prayer Requests — Complete Schema Fix
-- Safe to run multiple times (idempotent)
-- Run this in Supabase SQL Editor if prayer requests are failing

-- 1. Ensure table exists with base columns
create table if not exists public.prayer_requests (
  id           uuid         primary key default gen_random_uuid(),
  church_id    uuid         not null references public.churches (id) on delete cascade,
  user_id      text         not null,
  title        text         not null,
  body         text         not null default '',
  created_at   timestamptz  not null default now(),
  updated_at   timestamptz  not null default now()
);

-- 2. Add all required columns (safe if already present)
alter table public.prayer_requests add column if not exists body         text         not null default '';
alter table public.prayer_requests add column if not exists request      text;
alter table public.prayer_requests add column if not exists user_name    text         not null default '';
alter table public.prayer_requests add column if not exists category     text         not null default 'طلبة';
alter table public.prayer_requests add column if not exists status       text         not null default 'active';
alter table public.prayer_requests add column if not exists anonymous    boolean      not null default false;
alter table public.prayer_requests add column if not exists visibility   text         not null default 'community';
alter table public.prayer_requests add column if not exists prayer_count int          not null default 0;

-- 3. Backfill: copy request → body where body is empty
update public.prayer_requests
set    body = coalesce(nullif(trim(body), ''), request, '')
where  body is null or trim(body) = '';

-- 4. Constraints (skip if already present)
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'prayer_requests_status_check'
  ) then
    alter table public.prayer_requests
      add constraint prayer_requests_status_check
      check (status in ('active', 'urgent', 'answered'));
  end if;
exception when others then null;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'prayer_requests_visibility_check'
  ) then
    alter table public.prayer_requests
      add constraint prayer_requests_visibility_check
      check (visibility in ('community', 'private', 'leaders_only'));
  end if;
exception when others then null;
end $$;

-- 5. Indexes
create index if not exists prayer_requests_church_idx       on public.prayer_requests (church_id);
create index if not exists prayer_requests_visibility_idx   on public.prayer_requests (church_id, visibility);
create index if not exists prayer_requests_user_idx         on public.prayer_requests (user_id);
create index if not exists prayer_requests_status_idx       on public.prayer_requests (status);

-- 6. RLS
alter table public.prayer_requests enable row level security;

drop policy if exists prayer_requests_public_read  on public.prayer_requests;
create policy prayer_requests_public_read
  on public.prayer_requests for select to anon, authenticated
  using (visibility = 'community');

drop policy if exists prayer_requests_public_write on public.prayer_requests;
create policy prayer_requests_public_write
  on public.prayer_requests for all to anon, authenticated
  using (true) with check (true);

-- 7. Reload PostgREST schema cache (clears "schema cache" errors)
notify pgrst, 'reload schema';
