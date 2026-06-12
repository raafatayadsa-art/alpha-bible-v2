-- Ensure Katamaros + Synaxarium schema exists (no seed data).
-- Apply this in Supabase SQL Editor, then run RUN_IN_SQL_EDITOR_CLEAN.sql for data.

-- ── Synaxarium saints ───────────────────────────────────────────
create table if not exists public.synaxarium_saints (
  id text primary key,
  name text not null,
  title text not null default '',
  feast text not null default '',
  gregorian_date_label text not null default '',
  coptic_date_label text not null default '',
  coptic_month smallint,
  coptic_day smallint,
  liturgical_color text not null default '',
  liturgical_color_hex text not null default '#b8893a',
  summary text not null default '',
  quote text not null default '',
  quote_ref text not null default '',
  repose_date text not null default '',
  repose_place text not null default '',
  service text not null default '',
  commemoration text not null default '',
  bio text not null default '',
  events jsonb not null default '[]'::jsonb,
  image_key text not null default 'antony',
  saint_type text,
  era text,
  service_place text,
  occasion text,
  virtues jsonb not null default '[]'::jsonb,
  timeline_phases jsonb not null default '[]'::jsonb,
  related_prayers jsonb not null default '[]'::jsonb,
  related_meditations jsonb not null default '[]'::jsonb,
  related_events jsonb not null default '[]'::jsonb,
  similar_saints jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ── Synaxarium events (normalized; optional alongside saints.events jsonb) ─
create table if not exists public.synaxarium_events (
  id uuid primary key default gen_random_uuid(),
  saint_id text not null references public.synaxarium_saints (id) on delete cascade,
  year text not null default '',
  text text not null default '',
  display_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists synaxarium_events_saint_order_idx
  on public.synaxarium_events (saint_id, display_order);

-- ── Katamaros ───────────────────────────────────────────────────
create table if not exists public.katamaros_days (
  id text primary key,
  coptic_date_label text not null,
  gregorian_date_label text not null,
  coptic_month smallint,
  coptic_day smallint,
  occasion text not null default '',
  liturgical_day text not null default '',
  accent_hex text not null default '#6a4ab5',
  related jsonb not null default '[]'::jsonb
);

create table if not exists public.katamaros_readings (
  id uuid primary key default gen_random_uuid(),
  day_id text not null references public.katamaros_days (id) on delete cascade,
  reading_key text not null,
  reading_type text not null check (
    reading_type in ('psalm', 'gospel', 'pauline', 'catholic', 'praxis')
  ),
  title text not null default '',
  reference text not null default '',
  source text not null default '',
  estimated_min smallint not null default 3,
  body text not null default '',
  display_order smallint not null default 0,
  unique (day_id, reading_key)
);

create index if not exists katamaros_readings_day_order_idx
  on public.katamaros_readings (day_id, display_order);

-- ── RLS: public read-only for app ───────────────────────────────
alter table public.synaxarium_saints enable row level security;
alter table public.synaxarium_events enable row level security;
alter table public.katamaros_days enable row level security;
alter table public.katamaros_readings enable row level security;

drop policy if exists synaxarium_saints_public_read on public.synaxarium_saints;
create policy synaxarium_saints_public_read
  on public.synaxarium_saints for select to anon, authenticated using (true);

drop policy if exists synaxarium_events_public_read on public.synaxarium_events;
create policy synaxarium_events_public_read
  on public.synaxarium_events for select to anon, authenticated using (true);

drop policy if exists katamaros_days_public_read on public.katamaros_days;
create policy katamaros_days_public_read
  on public.katamaros_days for select to anon, authenticated using (true);

drop policy if exists katamaros_readings_public_read on public.katamaros_readings;
create policy katamaros_readings_public_read
  on public.katamaros_readings for select to anon, authenticated using (true);
