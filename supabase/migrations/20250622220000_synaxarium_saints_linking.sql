-- Link saints_index, synaxarium_entries, katamaros_days, and synaxarium_saints.

-- ── Coptic month registry ───────────────────────────────────────
create table if not exists public.coptic_months (
  month_num smallint primary key check (month_num between 1 and 13),
  slug_en text not null unique,
  name_ar text not null,
  name_en text not null unique
);

insert into public.coptic_months (month_num, slug_en, name_ar, name_en) values
  (1,  '01-Toot',     'توت',     'Tut'),
  (2,  '02-Baba',     'بابه',    'Baba'),
  (3,  '03-Hator',    'هاتور',   'Hator'),
  (4,  '04-Kiahk',    'كيهك',    'Kiahk'),
  (5,  '05-Toba',     'طوبه',    'Toba'),
  (6,  '06-Amshir',   'أمشير',   'Amshir'),
  (7,  '07-Baramhat', 'برمهات',  'Baramhat'),
  (8,  '08-Baramouda','برموده',  'Baramouda'),
  (9,  '09-Bashans',  'بشنس',    'Bashans'),
  (10, '10-Paoni',    'بؤونه',   'Paoni'),
  (11, '11-Epep',     'أبيب',    'Epep'),
  (12, '12-Mesra',    'مسرى',    'Mesra'),
  (13, '13-Nesi',     'نسئ',     'Nesi')
on conflict (month_num) do nothing;

-- ── Synaxarium day (one row per coptic date) ────────────────────
create table if not exists public.synaxarium_days (
  id text primary key,
  coptic_month smallint not null references public.coptic_months (month_num),
  coptic_day smallint not null check (coptic_day between 1 and 30),
  heading_ar text not null default '',
  source_url text not null default '',
  katamaros_day_id text references public.katamaros_days (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (coptic_month, coptic_day)
);

create index if not exists synaxarium_days_month_day_idx
  on public.synaxarium_days (coptic_month, coptic_day);

-- ── Liturgical occasions (feasts / seasons from Katamaros) ──────
create table if not exists public.liturgical_occasions (
  id uuid primary key default gen_random_uuid(),
  katamaros_day_id text references public.katamaros_days (id) on delete cascade,
  synaxarium_day_id text references public.synaxarium_days (id) on delete set null,
  title_ar text not null default '',
  title_en text,
  occasion_type text not null default 'season'
    check (occasion_type in ('feast', 'season', 'fast', 'other')),
  created_at timestamptz not null default now()
);

create index if not exists liturgical_occasions_katamaros_idx
  on public.liturgical_occasions (katamaros_day_id);

-- ── Extend scraped / legacy tables ──────────────────────────────
alter table public.synaxarium_entries
  add column if not exists day_id text references public.synaxarium_days (id) on delete set null,
  add column if not exists entity_type text
    check (entity_type is null or entity_type in (
      'saint', 'patriarch', 'monk', 'feast', 'occasion', 'council', 'other'
    )),
  add column if not exists saint_index_id uuid references public.saints_index (id) on delete set null,
  add column if not exists display_order smallint not null default 0;

create index if not exists synaxarium_entries_day_idx
  on public.synaxarium_entries (day_id);

create index if not exists synaxarium_entries_saint_idx_idx
  on public.synaxarium_entries (saint_index_id);

create index if not exists synaxarium_entries_entity_type_idx
  on public.synaxarium_entries (entity_type);

alter table public.saints
  add column if not exists saint_index_id uuid unique references public.saints_index (id) on delete set null;

alter table public.synaxarium_saints
  add column if not exists saint_index_id uuid references public.saints_index (id) on delete set null,
  add column if not exists synaxarium_entry_id uuid references public.synaxarium_entries (id) on delete set null,
  add column if not exists day_id text references public.synaxarium_days (id) on delete set null;

-- ── Helpers ─────────────────────────────────────────────────────
create or replace function public.parse_synaxarium_url_parts(p_url text)
returns table (month_slug text, day_slug text)
language sql
immutable
as $$
  select
    (regexp_match(p_url, '/Synaxarium-or-Synaxarion/([^/]+)/'))[1],
    (regexp_match(p_url, '/Synaxarium-or-Synaxarion/[^/]+/([^/.]+)'))[1];
$$;

create or replace function public.classify_synaxarium_entity(p_title text)
returns text
language sql
immutable
as $$
  select case
    when p_title ~* '(بابا|بطريرك|البطريرك)' then 'patriarch'
    when p_title ~* '(مجمع|النيروز|نييروز|عيد )' then 'feast'
    when p_title ~* '(أنبا|الأنبا|رهبان|متوحد|راهب|أب )' then 'monk'
    when p_title ~* '(القديس|القديسة|شهيد|شهيدة|رسول|نبي|عذراء)' then 'saint'
    else 'occasion'
  end;
$$;

create or replace function public.extract_synaxarium_subject(p_title text)
returns text
language sql
immutable
as $$
  select trim(both ' ' from regexp_replace(
    regexp_replace(coalesce(p_title, ''), '^(نياحة|استشهاد|تذكار|شفاء|مجمع|تذكار شفاء)\s+', '', 'i'),
    '\s*\([^)]*\)\s*$',
    '',
    'g'
  ));
$$;

-- ── Backfill synaxarium_days from entries ───────────────────────
insert into public.synaxarium_days (id, coptic_month, coptic_day, heading_ar, source_url)
select distinct on (cm.month_num, day_num)
  cm.month_num || '-' || day_num,
  cm.month_num,
  day_num,
  coalesce(e.day_title, ''),
  coalesce(e.source_url, '')
from public.synaxarium_entries e
cross join lateral (
  select
    (regexp_match(e.source_url, '/Synaxarium-or-Synaxarion/([^/]+)/'))[1] as month_slug,
    (regexp_match(e.source_url, '/Synaxarium-or-Synaxarion/[^/]+/([^/.]+)'))[1] as day_slug
) parts
cross join lateral (
  select
    cm.month_num,
    least(
      30,
      greatest(1, nullif(regexp_replace(coalesce(parts.day_slug, ''), '\D', '', 'g'), '')::smallint)
    ) as day_num
  from public.coptic_months cm
  where cm.slug_en = parts.month_slug
) cm
where parts.month_slug is not null
  and day_num is not null
order by cm.month_num, day_num, e.created_at nulls last
on conflict (id) do update set
  heading_ar = excluded.heading_ar,
  source_url = coalesce(nullif(excluded.source_url, ''), synaxarium_days.source_url);

-- Link entries → days + entity type (match by parsed URL when exact URL differs)
update public.synaxarium_entries e
set
  day_id = d.id,
  entity_type = public.classify_synaxarium_entity(e.commemoration_title)
from public.synaxarium_days d
where e.day_id is null
  and d.source_url = e.source_url;

update public.synaxarium_entries e
set day_id = matched.day_id
from (
  select
    e2.id as entry_id,
    d.id as day_id
  from public.synaxarium_entries e2
  cross join lateral public.parse_synaxarium_url_parts(e2.source_url) parts
  join public.coptic_months cm on cm.slug_en = parts.month_slug
  join public.synaxarium_days d
    on d.coptic_month = cm.month_num
   and d.coptic_day = least(
     30,
     greatest(1, nullif(regexp_replace(coalesce(parts.day_slug, ''), '\D', '', 'g'), '')::smallint)
   )
  where e2.day_id is null
) matched
where e.id = matched.entry_id
  and e.day_id is null;

update public.synaxarium_entries e
set entity_type = public.classify_synaxarium_entity(e.commemoration_title)
where e.entity_type is null;

-- Link synaxarium_days → katamaros_days (same coptic date)
update public.synaxarium_days sd
set katamaros_day_id = kd.id
from public.katamaros_days kd
join public.coptic_months cm on cm.name_en = kd.coptic_month
where sd.katamaros_day_id is null
  and sd.coptic_month = cm.month_num
  and sd.coptic_day = kd.coptic_day;

-- Seed liturgical occasions from katamaros (feasts vs seasons)
insert into public.liturgical_occasions (katamaros_day_id, synaxarium_day_id, title_ar, title_en, occasion_type)
select
  kd.id,
  sd.id,
  coalesce(kd.title, kd.occasion, ''),
  kd.occasion,
  case
    when coalesce(kd.occasion, kd.title, '') ~* '(feast|nayrouz|nativity|epiphany|resurrection|pentecost|palm)' then 'feast'
    when coalesce(kd.occasion, kd.title, '') ~* '(fast|lent)' then 'fast'
    else 'season'
  end
from public.katamaros_days kd
left join public.synaxarium_days sd
  on sd.katamaros_day_id = kd.id
where coalesce(kd.occasion, kd.title, '') <> ''
  and not exists (
    select 1 from public.liturgical_occasions lo
    where lo.katamaros_day_id = kd.id
      and lo.title_ar = coalesce(kd.title, kd.occasion, '')
  );

-- Populate saints biography rows from index (empty content shell)
insert into public.saints (id, name, source_url, content, saint_index_id)
select gen_random_uuid(), si.name, si.source_url, null, si.id
from public.saints_index si
where not exists (
  select 1 from public.saints s where s.saint_index_id = si.id
);

-- Link synaxarium entries → saints_index (exact name, then contains)
update public.synaxarium_entries e
set saint_index_id = si.id
from public.saints_index si
where e.saint_index_id is null
  and e.entity_type in ('saint', 'monk', 'patriarch')
  and si.name = public.extract_synaxarium_subject(e.commemoration_title);

update public.synaxarium_entries e
set saint_index_id = si.id
from public.saints_index si
where e.saint_index_id is null
  and e.entity_type in ('saint', 'monk', 'patriarch')
  and si.name ilike '%' || public.extract_synaxarium_subject(e.commemoration_title) || '%'
  and length(public.extract_synaxarium_subject(e.commemoration_title)) >= 6;

-- Link premium synaxarium_saints rows to index by name
update public.synaxarium_saints ss
set saint_index_id = si.id
from public.saints_index si
where ss.saint_index_id is null
  and si.name ilike '%' || regexp_replace(ss.name, '^(القديس|القديسة|الأنبا|أنبا)\s+', '') || '%';

-- Link synaxarium_saints → entries when matched
update public.synaxarium_saints ss
set
  synaxarium_entry_id = e.id,
  day_id = e.day_id
from public.synaxarium_entries e
where ss.synaxarium_entry_id is null
  and ss.saint_index_id is not null
  and e.saint_index_id = ss.saint_index_id
  and e.id = (
    select e2.id from public.synaxarium_entries e2
    where e2.saint_index_id = ss.saint_index_id
    order by e2.created_at nulls last
    limit 1
  );

-- ── Public read view for app ────────────────────────────────────
create or replace view public.synaxarium_catalog_v as
select
  coalesce(ss.id, e.saint_index_id::text, e.id::text) as catalog_id,
  coalesce(ss.id, e.saint_index_id::text, e.id::text) as route_id,
  coalesce(ss.name, si.name, public.extract_synaxarium_subject(e.commemoration_title)) as name,
  coalesce(ss.title, '') as title,
  coalesce(ss.feast, e.commemoration_title, '') as feast,
  coalesce(ss.gregorian_date_label, '') as gregorian_date_label,
  coalesce(ss.coptic_date_label, sd.id, '') as coptic_date_label,
  sd.coptic_month,
  sd.coptic_day,
  coalesce(ss.liturgical_color, '') as liturgical_color,
  coalesce(ss.liturgical_color_hex, '#b8893a') as liturgical_color_hex,
  coalesce(ss.summary, left(e.content, 280), left(si.name, 280), '') as summary,
  coalesce(ss.quote, '') as quote,
  coalesce(ss.quote_ref, '') as quote_ref,
  coalesce(ss.repose_date, '') as repose_date,
  coalesce(ss.repose_place, '') as repose_place,
  coalesce(ss.service, '') as service,
  coalesce(ss.commemoration, e.commemoration_title, '') as commemoration,
  coalesce(ss.bio, s.content, e.content, '') as bio,
  coalesce(ss.events, '[]'::jsonb) as events,
  coalesce(ss.image_key, 'antony') as image_key,
  coalesce(ss.saint_type, e.entity_type, 'saint') as saint_type,
  coalesce(ss.era, '') as era,
  coalesce(ss.service_place, '') as service_place,
  coalesce(ss.occasion, '') as occasion,
  coalesce(ss.virtues, '[]'::jsonb) as virtues,
  coalesce(ss.timeline_phases, '[]'::jsonb) as timeline_phases,
  coalesce(ss.related_prayers, '[]'::jsonb) as related_prayers,
  coalesce(ss.related_meditations, '[]'::jsonb) as related_meditations,
  coalesce(ss.related_events, '[]'::jsonb) as related_events,
  coalesce(ss.similar_saints, '[]'::jsonb) as similar_saints,
  e.entity_type,
  e.id as synaxarium_entry_id,
  si.id as saint_index_id,
  ss.id as synaxarium_saint_id,
  sd.id as day_id,
  si.source_url as saint_story_url,
  e.source_url as synaxarium_source_url
from public.synaxarium_entries e
left join public.synaxarium_days sd on sd.id = e.day_id
left join public.saints_index si on si.id = e.saint_index_id
left join public.saints s on s.saint_index_id = si.id
left join public.synaxarium_saints ss
  on ss.synaxarium_entry_id = e.id
  or (ss.saint_index_id = si.id and ss.synaxarium_entry_id is null)
where e.commemoration_title is not null;

-- Premium-only rows not in entries
union all
select
  ss.id as catalog_id,
  ss.id as route_id,
  ss.name,
  ss.title,
  ss.feast,
  ss.gregorian_date_label,
  ss.coptic_date_label,
  coalesce(ss.coptic_month, sd2.coptic_month),
  coalesce(ss.coptic_day, sd2.coptic_day),
  ss.liturgical_color,
  ss.liturgical_color_hex,
  ss.summary,
  ss.quote,
  ss.quote_ref,
  ss.repose_date,
  ss.repose_place,
  ss.service,
  ss.commemoration,
  ss.bio,
  ss.events,
  ss.image_key,
  ss.saint_type,
  ss.era,
  ss.service_place,
  ss.occasion,
  ss.virtues,
  ss.timeline_phases,
  ss.related_prayers,
  ss.related_meditations,
  ss.related_events,
  ss.similar_saints,
  coalesce(ss.saint_type, 'saint') as entity_type,
  ss.synaxarium_entry_id,
  ss.saint_index_id,
  ss.id as synaxarium_saint_id,
  ss.day_id,
  si.source_url as saint_story_url,
  null::text as synaxarium_source_url
from public.synaxarium_saints ss
left join public.saints_index si on si.id = ss.saint_index_id
left join public.synaxarium_days sd2 on sd2.id = ss.day_id
where not exists (
  select 1 from public.synaxarium_entries e where e.id = ss.synaxarium_entry_id
);

-- ── RLS ─────────────────────────────────────────────────────────
alter table public.coptic_months enable row level security;
alter table public.synaxarium_days enable row level security;
alter table public.liturgical_occasions enable row level security;

drop policy if exists coptic_months_public_read on public.coptic_months;
create policy coptic_months_public_read on public.coptic_months
  for select to anon, authenticated using (true);

drop policy if exists synaxarium_days_public_read on public.synaxarium_days;
create policy synaxarium_days_public_read on public.synaxarium_days
  for select to anon, authenticated using (true);

drop policy if exists liturgical_occasions_public_read on public.liturgical_occasions;
create policy liturgical_occasions_public_read on public.liturgical_occasions
  for select to anon, authenticated using (true);

grant select on public.synaxarium_catalog_v to anon, authenticated;

comment on table public.kholagy is
  'Coptic hymn / tasbeha lyrics (Alhan) — separate from synaxarium; not patriarch records';

comment on view public.synaxarium_catalog_v is
  'Unified synaxarium catalog: entries + saints_index + premium synaxarium_saints';
