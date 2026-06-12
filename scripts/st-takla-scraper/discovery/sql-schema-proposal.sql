-- PROPOSAL ONLY — do not apply until post-discovery scrape phase.
-- Bilingual-ready (ar + en). Arabic scrape first; en_* columns nullable.
-- Replaces flat synaxarium_saints-only model with synaxarium_days + synaxarium_saints.

-- ── Reading type registry (extensible) ───────────────────────────
create table if not exists public.reading_type_registry (
  reading_type text primary key,
  ui_card_group text not null,
  source_heading_ar text[] not null default '{}',
  source_heading_en text[] not null default '{}',
  is_active boolean not null default true,
  notes text not null default ''
);

insert into public.reading_type_registry (reading_type, ui_card_group, source_heading_ar, source_heading_en) values
  ('prophecy',         'prophecy',             array['النبوة','باكر'],           array['Prophecy']),
  ('vespers_psalm',    'vespers',              array['مزمور العشية','العشية'],   array['Vespers Psalm']),
  ('vespers_gospel',   'vespers',              array['إنجيل العشية'],            array['Vespers Gospel']),
  ('matins_psalm',     'matins',               array['مزمور باكر','باكر'],       array['Matins Psalm']),
  ('matins_gospel',    'matins',               array['إنجيل باكر'],              array['Matins Gospel']),
  ('pauline',          'liturgy',              array['البولس'],                  array['Pauline']),
  ('catholic',         'liturgy',              array['الكاثوليكون'],             array['Catholic']),
  ('praxis',           'liturgy',              array['الإبركسيس'],                array['Praxis']),
  ('synaxarium',       'synaxarium',           array['السنكسار'],                array['Synaxarium']),
  ('liturgy_psalm',    'liturgy_gospel_pair',  array['مزمور القداس'],            array['Liturgy Psalm']),
  ('liturgy_gospel',   'liturgy_gospel_pair',  array['إنجيل القداس'],            array['Liturgy Gospel'])
on conflict (reading_type) do nothing;

-- ── Katamaros ───────────────────────────────────────────────────
create table if not exists public.katamaros_days (
  id text primary key,
  coptic_month smallint not null check (coptic_month between 1 and 13),
  coptic_day smallint not null check (coptic_day between 1 and 30),
  coptic_year smallint not null,
  coptic_date_label_ar text not null default '',
  coptic_date_label_en text,
  gregorian_date_label_ar text not null default '',
  gregorian_date_label_en text,
  liturgical_day_ar text not null default '',
  liturgical_day_en text,
  occasion_ar text not null default '',
  occasion_en text,
  season text not null default 'ordinary',
  accent_hex text not null default '#6a4ab5',
  source_url text not null default '',
  related jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (coptic_year, coptic_month, coptic_day)
);

create table if not exists public.katamaros_readings (
  id uuid primary key default gen_random_uuid(),
  day_id text not null references public.katamaros_days (id) on delete cascade,
  reading_key text not null,
  reading_type text not null references public.reading_type_registry (reading_type),
  title_ar text not null default '',
  title_en text,
  reference_ar text not null default '',
  reference_en text,
  source_ar text not null default '',
  source_en text,
  estimated_min smallint not null default 3,
  body_ar text not null default '',
  body_en text,
  display_order smallint not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  unique (day_id, reading_key)
);

create index if not exists katamaros_readings_day_order_idx
  on public.katamaros_readings (day_id, display_order);

-- ── Synaxarium (two-table model) ────────────────────────────────
create table if not exists public.synaxarium_days (
  id text primary key,
  coptic_month smallint not null check (coptic_month between 1 and 13),
  coptic_day smallint not null check (coptic_day between 1 and 30),
  coptic_year smallint,
  heading_ar text not null default '',
  heading_en text,
  intro_ar text not null default '',
  intro_en text,
  church_reading_suppressed boolean not null default false,
  church_reading_note_ar text,
  church_reading_note_en text,
  source_url_ar text not null default '',
  source_url_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (coptic_month, coptic_day)
);

create table if not exists public.synaxarium_saints (
  id text primary key,
  day_id text not null references public.synaxarium_days (id) on delete cascade,
  display_order smallint not null default 1,
  slug text not null default '',
  name_ar text not null default '',
  name_en text,
  title_ar text not null default '',
  title_en text,
  occasion_type text not null default 'commemoration',
  summary_ar text not null default '',
  summary_en text,
  bio_ar text not null default '',
  bio_en text,
  closing_ar text not null default '',
  closing_en text,
  coptic_date_label_ar text not null default '',
  coptic_date_label_en text,
  gregorian_date_label_ar text not null default '',
  gregorian_date_label_en text,
  liturgical_color text not null default '',
  liturgical_color_hex text not null default '#b8893a',
  image_key text not null default '',
  image_urls jsonb not null default '[]'::jsonb,
  source_url_ar text not null default '',
  source_url_en text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (day_id, display_order)
);

create index if not exists synaxarium_saints_day_order_idx
  on public.synaxarium_saints (day_id, display_order);

-- ── RLS (public read) ───────────────────────────────────────────
alter table public.reading_type_registry enable row level security;
alter table public.katamaros_days enable row level security;
alter table public.katamaros_readings enable row level security;
alter table public.synaxarium_days enable row level security;
alter table public.synaxarium_saints enable row level security;

create policy reading_type_registry_public_read on public.reading_type_registry
  for select to anon, authenticated using (true);
create policy katamaros_days_public_read on public.katamaros_days
  for select to anon, authenticated using (true);
create policy katamaros_readings_public_read on public.katamaros_readings
  for select to anon, authenticated using (true);
create policy synaxarium_days_public_read on public.synaxarium_days
  for select to anon, authenticated using (true);
create policy synaxarium_saints_public_read on public.synaxarium_saints
  for select to anon, authenticated using (true);
