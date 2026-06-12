-- Step 1â€“2: Bible data fixes (run once in Supabase SQL Editor)
-- 1) Merge 5 misspelled book_name duplicates
-- 2) Renumber Sirach (ÙŠØ´ÙˆØ¹ Ø¨Ù† Ø³ÙŠØ±Ø§Ø®) chapter 29 verses 18â€“35 â†’ 16â€“33

-- â”€â”€ Book name typos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
UPDATE bible_verses
SET book_name = 'Ø±Ø³Ø§Ù„Ø© Ø¨ÙˆÙ„Ø³ Ø§Ù„Ø±Ø³ÙˆÙ„ Ø¥Ù„Ù‰ ØªÙŠØ·Ø³'
WHERE book_name = 'Ø±Ø³Ø§Ù„Ø© Ø¨ÙˆÙ„ Ø§Ù„Ø±Ø³ÙˆÙ„ Ø¥Ù„Ù‰ ØªÙŠØ·Ø³';

UPDATE bible_verses
SET book_name = 'Ø±Ø³Ø§Ù„Ø© Ø¨ÙˆÙ„Ø³ Ø§Ù„Ø±Ø³ÙˆÙ„ Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø¥Ù„Ù‰ Ø£Ù‡Ù„ ØªØ³Ø§Ù„ÙˆÙ†ÙŠÙƒÙŠ'
WHERE book_name = 'Ø±Ø³Ø§Ù„Ø© Ø¨ÙˆÙ„Ø³ Ø§Ù„Ø±Ø³ÙˆÙ„ Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø¥Ù„Ù‰ Ø£Ù‡Ù„ ØªØ³Ø§Ù„ÙˆÙ†ÙŠÙƒ';

UPDATE bible_verses
SET book_name = 'Ø³ÙØ± Ø£Ø®Ø¨Ø§Ø± Ø§Ù„Ø£ÙŠØ§Ù… Ø§Ù„Ø«Ø§Ù†ÙŠ'
WHERE book_name = 'Ø³ÙØ± Ø£Ø®Ø¨Ø§Ø± Ù„Ø£ÙŠØ§Ù… Ø§Ù„Ø«Ø§Ù†ÙŠ';

UPDATE bible_verses
SET book_name = 'Ø³ÙØ± Ø§Ù„Ù…Ø²Ø§Ù…ÙŠØ±'
WHERE book_name = 'Ø³ÙØ± Ø§Ù„Ù…Ø²Ø§ÙŠØ±';

UPDATE bible_verses
SET book_name = 'Ø³ÙØ± ÙŠÙ‡ÙˆØ¯ÙŠØª'
WHERE book_name = 'Ø³ÙØ± ÙŠÙˆØ¯ÙŠØª';

-- â”€â”€ Sirach 29 verse numbering â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
UPDATE bible_verses
SET verse_number = verse_number + 1000
WHERE book_name = 'Ø³ÙØ± ÙŠØ´ÙˆØ¹ Ø¨Ù† Ø³ÙŠØ±Ø§Ø®'
  AND chapter_number = 29
  AND verse_number >= 18;

UPDATE bible_verses
SET verse_number = verse_number - 1002
WHERE book_name = 'Ø³ÙØ± ÙŠØ´ÙˆØ¹ Ø¨Ù† Ø³ÙŠØ±Ø§Ø®'
  AND chapter_number = 29
  AND verse_number >= 1000;

-- â”€â”€ Verify â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SELECT book_name, COUNT(*) FROM bible_verses
-- WHERE book_name IN (
--   'Ø±Ø³Ø§Ù„Ø© Ø¨ÙˆÙ„ Ø§Ù„Ø±Ø³ÙˆÙ„ Ø¥Ù„Ù‰ ØªÙŠØ·Ø³','Ø³ÙØ± Ø§Ù„Ù…Ø²Ø§ÙŠØ±','Ø³ÙØ± ÙŠÙˆØ¯ÙŠØª',
--   'Ø³ÙØ± Ø£Ø®Ø¨Ø§Ø± Ù„Ø£ÙŠØ§Ù… Ø§Ù„Ø«Ø§Ù†ÙŠ','Ø±Ø³Ø§Ù„Ø© Ø¨ÙˆÙ„Ø³ Ø§Ù„Ø±Ø³ÙˆÙ„ Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø¥Ù„Ù‰ Ø£Ù‡Ù„ ØªØ³Ø§Ù„ÙˆÙ†ÙŠÙƒ'
-- ) GROUP BY book_name;
-- Expected: 0 rows

-- SELECT MIN(verse_number), MAX(verse_number), COUNT(*)
-- FROM bible_verses
-- WHERE book_name = 'Ø³ÙØ± ÙŠØ´ÙˆØ¹ Ø¨Ù† Ø³ÙŠØ±Ø§Ø®' AND chapter_number = 29;
-- Expected: min=1, max=33, count=33
-- Step 3: Katamaros + Synaxarium tables (public read, dev-friendly RLS)

-- â”€â”€ Synaxarium â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€ Katamaros â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€ RLS: read-only for app â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
alter table public.synaxarium_saints enable row level security;
alter table public.katamaros_days enable row level security;
alter table public.katamaros_readings enable row level security;

drop policy if exists synaxarium_saints_public_read on public.synaxarium_saints;
create policy synaxarium_saints_public_read
  on public.synaxarium_saints for select to anon, authenticated using (true);

drop policy if exists katamaros_days_public_read on public.katamaros_days;
create policy katamaros_days_public_read
  on public.katamaros_days for select to anon, authenticated using (true);

drop policy if exists katamaros_readings_public_read on public.katamaros_readings;
create policy katamaros_readings_public_read
  on public.katamaros_readings for select to anon, authenticated using (true);

-- â”€â”€ Seed: today's katamaros (matches local mock) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
insert into public.katamaros_days (
  id, coptic_date_label, gregorian_date_label, coptic_month, coptic_day,
  occasion, liturgical_day, accent_hex, related
) values (
  'today',
  'Ù§ Ø¨Ø´Ù†Ø³ Ù¡Ù§Ù¤Ù¢',
  'Ù¡Ù¥ Ù…Ø§ÙŠÙˆ Ù¢Ù Ù¢Ù¦',
  8, 7,
  'Ø§Ù„Ø¬Ù…Ø¹Ø© Ø§Ù„Ø¹Ø¸ÙŠÙ…Ø©',
  'Ù‚Ø±Ø§Ø¡Ø§Øª Ø£Ø³Ø¨ÙˆØ¹ Ø§Ù„Ø¢Ù„Ø§Ù…',
  '#6a4ab5',
  '[
    {"id":"saint-today","kind":"synaxarium","title":"Ø³Ù†ÙƒØ³Ø§Ø± Ø§Ù„ÙŠÙˆÙ…","subtitle":"Ø°ÙƒØ±Ù‰ Ø¢Ù„Ø§Ù… Ø§Ù„Ø³ÙŠØ¯ Ø§Ù„Ù…Ø³ÙŠØ­","to":"/synaxarium"},
    {"id":"feast-today","kind":"feast","title":"Ù…Ù†Ø§Ø³Ø¨Ø© Ø§Ù„ÙŠÙˆÙ…","subtitle":"Ø§Ù„Ø¬Ù…Ø¹Ø© Ø§Ù„Ø¹Ø¸ÙŠÙ…Ø©","to":"/feasts"},
    {"id":"prayer-related","kind":"prayer","title":"ØµÙ„Ø§Ø© Ø§Ù„Ø³Ø§Ø¹Ø© Ø§Ù„Ø³Ø§Ø¯Ø³Ø©","subtitle":"Ù…Ù† Ø§Ù„Ø£Ø¬Ø¨ÙŠØ©","to":"/agpeya"},
    {"id":"meditation-related","kind":"meditation","title":"ØªØ£Ù…Ù„ ÙÙŠ Ø§Ù„ØµÙ„ÙŠØ¨","subtitle":"Ù…Ø­Ø¨Ø© Ø§Ù„Ù„Ù‡ Ø§Ù„ÙØ§Ø¦Ù‚Ø©"}
  ]'::jsonb
) on conflict (id) do nothing;

insert into public.katamaros_readings (
  day_id, reading_key, reading_type, title, reference, source, estimated_min, body, display_order
) values
  ('today', 'psalm', 'psalm', 'Ø§Ù„Ù…Ø²Ù…ÙˆØ±', 'Ù…Ø² Ù¢Ù¢: Ù¡-Ù¡Ù¨', 'Ø¨Ø§ÙƒØ±', 2,
   'Ø¥Ù„Ù‡ÙŠ Ø¥Ù„Ù‡ÙŠ Ù„Ù…Ø§Ø°Ø§ ØªØ±ÙƒØªÙ†ÙŠØŒ Ø¨Ø¹ÙŠØ¯Ø§Ù‹ Ø¹Ù† Ø®Ù„Ø§ØµÙŠ Ø¹Ù† ÙƒÙ„Ø§Ù… Ø²ÙÙŠØ±ÙŠ. Ø¥Ù„Ù‡ÙŠ ÙÙŠ Ø§Ù„Ù†Ù‡Ø§Ø± Ø£Ø¯Ø¹Ùˆ ÙÙ„Ø§ ØªØ³ØªØ¬ÙŠØ¨ØŒ ÙˆÙÙŠ Ø§Ù„Ù„ÙŠÙ„ ÙÙ„Ø§ Ù‡Ø¯ÙˆØ¡ Ù„ÙŠ. Ø£Ù…Ø§ Ø£Ù†Øª ÙÙ‚Ø¯ÙˆØ³ØŒ Ø§Ù„Ø¬Ø§Ù„Ø³ Ø¨ÙŠÙ† ØªØ³Ø¨ÙŠØ­Ø§Øª Ø¥Ø³Ø±Ø§Ø¦ÙŠÙ„. Ø¹Ù„ÙŠÙƒ Ø§ØªÙƒÙ„ Ø¢Ø¨Ø§Ø¤Ù†Ø§ØŒ Ø§ØªÙƒÙ„ÙˆØ§ ÙÙ†Ø¬ÙŠØªÙ‡Ù…. Ø¥Ù„ÙŠÙƒ ØµØ±Ø®ÙˆØ§ ÙÙ†Ø¬ÙˆØ§ØŒ Ø¹Ù„ÙŠÙƒ Ø§ØªÙƒÙ„ÙˆØ§ ÙÙ„Ù… ÙŠØ®Ø²ÙˆØ§.',
   1),
  ('today', 'pauline', 'pauline', 'Ø§Ù„Ø¨ÙˆÙ„Ø³', 'Ø¹Ø¨ Ù¡Ù : Ù¡Ù©-Ù¢Ù¥', 'Ø§Ù„Ù‚Ø¯Ø§Ø³', 3,
   'ÙØ¥Ø° Ù„Ù†Ø§ Ø£ÙŠÙ‡Ø§ Ø§Ù„Ø¥Ø®ÙˆØ© Ø«Ù‚Ø© Ø¨Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¥Ù„Ù‰ Ø§Ù„Ø£Ù‚Ø¯Ø§Ø³ Ø¨Ø¯Ù… ÙŠØ³ÙˆØ¹ØŒ Ø·Ø±ÙŠÙ‚Ø§Ù‹ ÙƒØ±ÙŽÙ‘Ø³Ù‡ Ù„Ù†Ø§ Ø­Ø¯ÙŠØ«Ø§Ù‹ Ø­ÙŠØ§Ù‹ØŒ Ø¨Ø§Ù„Ø­Ø¬Ø§Ø¨ Ø£ÙŠ Ø¬Ø³Ø¯Ù‡ØŒ ÙˆÙƒØ§Ù‡Ù† Ø¹Ø¸ÙŠÙ… Ø¹Ù„Ù‰ Ø¨ÙŠØª Ø§Ù„Ù„Ù‡ØŒ Ù„Ù†ØªÙ‚Ø¯Ù… Ø¨Ù‚Ù„Ø¨ ØµØ§Ø¯Ù‚ ÙÙŠ ÙŠÙ‚ÙŠÙ† Ø§Ù„Ø¥ÙŠÙ…Ø§Ù†ØŒ Ù…Ø±Ø´ÙˆØ´Ø© Ù‚Ù„ÙˆØ¨Ù†Ø§ Ù…Ù† Ø¶Ù…ÙŠØ± Ø´Ø±ÙŠØ±.',
   2),
  ('today', 'catholic', 'catholic', 'Ø§Ù„ÙƒØ§Ø«ÙˆÙ„ÙŠÙƒÙˆÙ†', 'Ù¡Ø¨Ø· Ù£: Ù¡Ù§-Ù¢Ù¢', 'Ø§Ù„Ù‚Ø¯Ø§Ø³', 2,
   'Ù„Ø£Ù† ØªØ£Ù„Ù…ÙƒÙ… Ø¥Ù† Ø´Ø§Ø¡Øª Ù…Ø´ÙŠØ¦Ø© Ø§Ù„Ù„Ù‡ ÙˆØ£Ù†ØªÙ… ØµØ§Ù†Ø¹ÙˆÙ† Ø®ÙŠØ±Ø§Ù‹ØŒ Ø£ÙØ¶Ù„ Ù…Ù†Ù‡ ÙˆØ£Ù†ØªÙ… ØµØ§Ù†Ø¹ÙˆÙ† Ø´Ø±Ø§Ù‹. ÙØ¥Ù† Ø§Ù„Ù…Ø³ÙŠØ­ Ø£ÙŠØ¶Ø§Ù‹ ØªØ£Ù„Ù… Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø© Ù…Ù† Ø£Ø¬Ù„ Ø§Ù„Ø®Ø·Ø§ÙŠØ§ØŒ Ø§Ù„Ø¨Ø§Ø± Ù…Ù† Ø£Ø¬Ù„ Ø§Ù„Ø£Ø«Ù…Ø©ØŒ Ù„ÙƒÙŠ ÙŠÙ‚Ø±Ø¨Ù†Ø§ Ø¥Ù„Ù‰ Ø§Ù„Ù„Ù‡ØŒ Ù…Ù…Ø§ØªØ§Ù‹ ÙÙŠ Ø§Ù„Ø¬Ø³Ø¯ ÙˆÙ„ÙƒÙ† Ù…Ø­ÙŠÙ‰ ÙÙŠ Ø§Ù„Ø±ÙˆØ­.',
   3),
  ('today', 'praxis', 'praxis', 'Ø§Ù„Ø¥Ø¨Ø±ÙƒØ³ÙŠØ³', 'Ø£Ø¹ Ù¡Ù : Ù£Ù¤-Ù¤Ù£', 'Ø§Ù„Ù‚Ø¯Ø§Ø³', 3,
   'ÙÙØªØ­ Ø¨Ø·Ø±Ø³ ÙØ§Ù‡ ÙˆÙ‚Ø§Ù„: Ø¨Ø§Ù„Ø­Ù‚ Ø£Ù†Ø§ Ø£Ø¬Ø¯ Ø£Ù† Ø§Ù„Ù„Ù‡ Ù„Ø§ ÙŠÙ‚Ø¨Ù„ Ø§Ù„ÙˆØ¬ÙˆÙ‡ØŒ Ø¨Ù„ ÙÙŠ ÙƒÙ„ Ø£Ù…Ø©ØŒ Ø§Ù„Ø°ÙŠ ÙŠØªÙ‚ÙŠÙ‡ ÙˆÙŠØµÙ†Ø¹ Ø§Ù„Ø¨Ø± Ù…Ù‚Ø¨ÙˆÙ„ Ø¹Ù†Ø¯Ù‡. Ø§Ù„ÙƒÙ„Ù…Ø© Ø§Ù„ØªÙŠ Ø£Ø±Ø³Ù„Ù‡Ø§ Ø¥Ù„Ù‰ Ø¨Ù†ÙŠ Ø¥Ø³Ø±Ø§Ø¦ÙŠÙ„ ÙŠØ¨Ø´Ø± Ø¨Ø§Ù„Ø³Ù„Ø§Ù… Ø¨ÙŠØ³ÙˆØ¹ Ø§Ù„Ù…Ø³ÙŠØ­. Ù‡Ø°Ø§ Ù‡Ùˆ Ø±Ø¨ Ø§Ù„ÙƒÙ„.',
   4),
  ('today', 'gospel', 'gospel', 'Ø§Ù„Ø¥Ù†Ø¬ÙŠÙ„', 'ÙŠÙˆ Ù¡Ù©: Ù¡Ù¦-Ù£Ù§', 'Ø§Ù„Ù‚Ø¯Ø§Ø³', 5,
   'ÙØ­ÙŠÙ†Ø¦Ø°Ù Ø£Ø³Ù„Ù…Ù‡ Ø¥Ù„ÙŠÙ‡Ù… Ù„ÙŠÙØµÙ„Ø¨. ÙØ£Ø®Ø°ÙˆØ§ ÙŠØ³ÙˆØ¹ ÙˆÙ…Ø¶ÙˆØ§ Ø¨Ù‡. ÙØ®Ø±Ø¬ ÙˆÙ‡Ùˆ Ø­Ø§Ù…Ù„ ØµÙ„ÙŠØ¨Ù‡ Ø¥Ù„Ù‰ Ø§Ù„Ù…ÙˆØ¶Ø¹ Ø§Ù„Ø°ÙŠ ÙŠÙ‚Ø§Ù„ Ù„Ù‡ Ù…ÙˆØ¶Ø¹ Ø§Ù„Ø¬Ù…Ø¬Ù…Ø©ØŒ ÙˆÙŠÙ‚Ø§Ù„ Ù„Ù‡ Ø¨Ø§Ù„Ø¹Ø¨Ø±Ø§Ù†ÙŠØ© Ø¬Ù„Ø¬Ø«Ø©ØŒ Ø­ÙŠØ« ØµÙ„Ø¨ÙˆÙ‡. ÙˆØµÙ„Ø¨ÙˆØ§ Ù…Ø¹Ù‡ Ø¢Ø®Ø±ÙŽÙŠÙ† Ù…Ù† Ù‡Ù†Ø§ ÙˆÙ…Ù† Ù‡Ù†Ø§ØŒ ÙˆÙŠØ³ÙˆØ¹ ÙÙŠ Ø§Ù„ÙˆØ³Ø·.',
   5)
on conflict (day_id, reading_key) do nothing;

-- â”€â”€ Seed: synaxarium saints (core fields; app maps image_key â†’ assets) â”€
insert into public.synaxarium_saints (
  id, name, title, feast, gregorian_date_label, coptic_date_label,
  coptic_month, coptic_day, liturgical_color, liturgical_color_hex,
  summary, quote, quote_ref, repose_date, repose_place, service, commemoration,
  bio, image_key, saint_type, era, service_place, occasion,
  events, virtues, timeline_phases, related_prayers, related_meditations,
  related_events, similar_saints
) values
(
  'shenouda',
  'Ø§Ù„Ù‚Ø¯ÙŠØ³ Ø´Ù†ÙˆØ¯Ø© Ø±Ø¦ÙŠØ³ Ø§Ù„Ù…ØªÙˆØ­Ø¯ÙŠÙ†',
  'Ø§Ù„Ø±Ø§Ù‡Ø¨ Ø§Ù„Ø¹Ø¸ÙŠÙ…ØŒ Ø£Ø¨ Ø§Ù„Ø±Ù‡Ø¨Ø§Ù†',
  'Ø§Ù„ÙŠÙˆÙ…: Ø§Ø³ØªØ´Ù‡Ø§Ø¯ Ø§Ù„Ù‚Ø¯ÙŠØ³ Ø´Ù†ÙˆØ¯Ø© Ø±Ø¦ÙŠØ³ Ø§Ù„Ù…ØªÙˆØ­Ø¯ÙŠÙ†',
  'Ø§Ù„Ø¬Ù…Ø¹Ø© 15 Ù…Ø§ÙŠÙˆ 2026',
  '7 Ø¨Ø´Ù†Ø³ 1742',
  8, 7,
  'Ø£Ø®Ø¶Ø±', '#3e7a55',
  'Ø£Ø¨ Ø§Ù„Ø±Ù‡Ø¨Ø§Ù† ÙˆØ£Ø­Ø¯ Ø£Ø¹Ù…Ø¯Ø© Ø§Ù„Ø±Ù‡Ø¨Ù†Ø© Ø§Ù„Ù‚Ø¨Ø·ÙŠØ© ÙÙŠ Ø§Ù„Ø¨Ø±ÙŠØ© Ø§Ù„Ù…ØµØ±ÙŠØ©.',
  'Ø¥Ù† ÙƒÙ†Øª ØªØ±ÙŠØ¯ Ø£Ù† ØªØµÙŠØ± ÙƒØ§Ù…Ù„Ø§Ù‹ØŒ ÙØ§Ø°Ù‡Ø¨ ÙˆØ¨Ø¹Ù’ ÙƒÙ„ Ù…Ø§ Ù„Ùƒ ÙˆØªØ¹Ø§Ù„ Ø§ØªØ¨Ø¹Ù†ÙŠ.',
  '(Ù…Øª 21:29)',
  'Ø­ÙˆØ§Ù„ÙŠ 466 Ù…', 'Ø¨Ø±ÙŠØ© Ø´ÙŠÙ‡ÙŠØª', 'Ø±Ø§Ù‡Ø¨ ÙˆÙ…ØªÙˆØ­Ø¯', '7 Ø¨Ø´Ù†Ø³',
  'Ø§Ù„Ù‚Ø¯ÙŠØ³ Ø´Ù†ÙˆØ¯Ø© Ø±Ø¦ÙŠØ³ Ø§Ù„Ù…ØªÙˆØ­Ø¯ÙŠÙ† Ù‡Ùˆ Ø£Ø¨ Ø§Ù„Ø±Ù‡Ø¨Ø§Ù† ÙÙŠ Ø§Ù„Ø¨Ø±ÙŠØ© Ø§Ù„Ù…ØµØ±ÙŠØ©ØŒ ÙˆØ£Ø­Ø¯ Ø£Ø¹Ø¸Ù… Ø¢Ø¨Ø§Ø¡ Ø§Ù„Ø±Ù‡Ø¨Ù†Ø© Ø§Ù„Ù‚Ø¨Ø·ÙŠØ© Ø§Ù„Ø°ÙŠÙ† ØªØ±ÙƒÙˆØ§ Ø¨ØµÙ…Ø© Ù„Ø§ ØªÙÙ…Ø­Ù‰ ÙÙŠ ØªØ§Ø±ÙŠØ® Ø§Ù„ÙƒÙ†ÙŠØ³Ø©.',
  'shenouda', 'Ø±Ø§Ù‡Ø¨ ÙˆÙ…ØªÙˆØ­Ø¯', 'Ø§Ù„Ù‚Ø±Ù† Ø§Ù„Ø±Ø§Ø¨Ø¹ Ø§Ù„Ù…ÙŠÙ„Ø§Ø¯ÙŠ', 'Ø§Ù„Ø¯ÙŠØ± Ø§Ù„Ø£Ø¨ÙŠØ¶ - Ø³ÙˆÙ‡Ø§Ø¬', 'ØªØ°ÙƒØ§Ø± Ø§Ù„Ù†ÙŠØ§Ø­Ø©',
  '[{"year":"348 Ù…","text":"ÙˆÙ„Ø¯ ÙÙŠ Ù‚Ø±ÙŠØ© Ø´Ù†Ø¯ÙˆÙŠÙ„ Ø¨ØµØ¹ÙŠØ¯ Ù…ØµØ±."},{"year":"466 Ù…","text":"ØªÙ†ÙŠØ­ Ø¨Ø³Ù„Ø§Ù… Ø¹Ù† Ø¹Ù…Ø± ÙŠÙ†Ø§Ù‡Ø² 118 Ø³Ù†Ø©."}]'::jsonb,
  '["Ø§Ù„Ø¥ÙŠÙ…Ø§Ù†","Ø§Ù„ØµÙ„Ø§Ø©","Ø§Ù„Ù…Ø­Ø¨Ø©","Ø§Ù„Ø§ØªØ¶Ø§Ø¹","Ø§Ù„ØµØ¨Ø±"]'::jsonb,
  '[{"id":"birth","label":"Ø§Ù„Ù…ÙŠÙ„Ø§Ø¯","year":"348 Ù…","body":"ÙˆÙÙ„Ø¯ ÙÙŠ Ù‚Ø±ÙŠØ© Ø´Ù†Ø¯ÙˆÙŠÙ„ Ø¨ØµØ¹ÙŠØ¯ Ù…ØµØ± Ù„Ø£Ø³Ø±Ø© ØªÙ‚ÙŠØ©."},{"id":"repose","label":"Ø§Ù„Ù†ÙŠØ§Ø­Ø©","year":"466 Ù…","body":"ØªÙ†ÙŠØ­ Ø¨Ø³Ù„Ø§Ù… ÙÙŠ Ø¨Ø±ÙŠØ© Ø´ÙŠÙ‡ÙŠØª."}]'::jsonb,
  '[{"id":"p1","title":"ØµÙ„Ø§Ø© Ø§Ù„Ø±Ù‡Ø¨Ø§Ù†","subtitle":"Ù…Ù† Ø§Ù„Ø£Ø¬Ø¨ÙŠØ©"}]'::jsonb,
  '[{"id":"m1","title":"Ø§Ù„Ø²Ù‡Ø¯ ÙˆØ§Ù„Ù†Ø³Ùƒ","subtitle":"ØªØ£Ù…Ù„ Ø±ÙˆØ­ÙŠ"}]'::jsonb,
  '[{"id":"e1","title":"Ù…Ø¬Ù…Ø¹ Ø£ÙØ³Ø³","subtitle":"431 Ù…"}]'::jsonb,
  '[{"id":"antony","title":"Ø§Ù„Ø£Ù†Ø¨Ø§ Ø£Ù†Ø·ÙˆÙ†ÙŠÙˆØ³","subtitle":"Ø£Ø¨ Ø§Ù„Ø±Ù‡Ø¨Ø§Ù†"}]'::jsonb
),
(
  'antony',
  'Ø§Ù„Ù‚Ø¯ÙŠØ³ Ø£Ù†Ø¨Ø§ Ø£Ù†Ø·ÙˆÙ†ÙŠÙˆØ³ Ø§Ù„ÙƒØ¨ÙŠØ±',
  'Ø£Ø¨ Ø§Ù„Ø±Ù‡Ø¨Ù†Ø© ÙÙŠ Ø§Ù„Ø¹Ø§Ù„Ù… ÙƒÙ„Ù‡',
  'ØªØ°ÙƒØ§Ø± Ù†ÙŠØ§Ø­Ø© Ø§Ù„Ø£Ù†Ø¨Ø§ Ø£Ù†Ø·ÙˆÙ†ÙŠÙˆØ³',
  'Ø§Ù„Ø³Ø¨Øª 30 ÙŠÙ†Ø§ÙŠØ± 2026',
  '22 Ø·ÙˆØ¨Ù‡ 1742',
  5, 22,
  'Ø£Ø¨ÙŠØ¶', '#b8893a',
  'Ø£Ø¨ Ø§Ù„Ø±Ù‡Ø¨Ù†Ø© Ø§Ù„Ù…Ø³ÙŠØ­ÙŠØ© ÙˆÙ‚Ø¯ÙˆØ© Ø§Ù„Ù…ØªÙˆØ­Ø¯ÙŠÙ† ÙÙŠ ÙƒÙ„ Ø§Ù„Ø¹ØµÙˆØ±.',
  'Ù„Ø§ ØªØ®Ù ÙŠØ§ Ø£Ù†Ø·ÙˆÙ†ÙŠÙˆØ³ØŒ ÙØ£Ù†Ø§ Ù…Ø¹Ùƒ ÙÙŠ ÙƒÙ„ Ø­ÙŠÙ†.',
  '(ØµÙˆØª Ù…Ù† Ø§Ù„Ø³Ù…Ø§Ø¡)',
  '356 Ù…', 'Ø¬Ø¨Ù„ Ø§Ù„Ù‚Ù„Ø²Ù…', 'Ø£Ø¨ Ø§Ù„Ø±Ù‡Ø¨Ø§Ù†', '22 Ø·ÙˆØ¨Ù‡',
  'ÙˆÙ„Ø¯ Ø§Ù„Ø£Ù†Ø¨Ø§ Ø£Ù†Ø·ÙˆÙ†ÙŠÙˆØ³ ÙÙŠ Ù‚Ø±ÙŠØ© Ù‚Ù…Ù† Ø§Ù„Ø¹Ø±ÙˆØ³ Ø¨Ù…ØµØ± Ø³Ù†Ø© 251 Ù… Ù„Ø£Ø³Ø±Ø© ØºÙ†ÙŠØ© ØªÙ‚ÙŠØ©.',
  'antony', 'Ø±Ø§Ù‡Ø¨ ÙˆØ£Ø¨ Ø±ÙˆØ­ÙŠ', 'Ø§Ù„Ù‚Ø±Ù† Ø§Ù„Ø«Ø§Ù„Ø« ÙˆØ§Ù„Ø±Ø§Ø¨Ø¹', 'Ø¬Ø¨Ù„ Ø§Ù„Ù‚Ù„Ø²Ù… - Ø§Ù„Ø¨Ø­Ø± Ø§Ù„Ø£Ø­Ù…Ø±', 'ØªØ°ÙƒØ§Ø± Ø§Ù„Ù†ÙŠØ§Ø­Ø©',
  '[{"year":"251 Ù…","text":"ÙˆÙ„Ø¯ ÙÙŠ Ù‚Ø±ÙŠØ© Ù‚Ù…Ù† Ø§Ù„Ø¹Ø±ÙˆØ³."},{"year":"356 Ù…","text":"ØªÙ†ÙŠØ­ Ø¨Ø³Ù„Ø§Ù… ÙÙŠ Ø¬Ø¨Ù„ Ø§Ù„Ù‚Ù„Ø²Ù…."}]'::jsonb,
  '["Ø§Ù„Ø¥ÙŠÙ…Ø§Ù†","Ø§Ù„ØµÙ„Ø§Ø©","Ø§Ù„Ù…Ø­Ø¨Ø©","Ø§Ù„Ø§ØªØ¶Ø§Ø¹","Ø§Ù„ØµØ¨Ø±"]'::jsonb,
  '[{"id":"birth","label":"Ø§Ù„Ù…ÙŠÙ„Ø§Ø¯","year":"251 Ù…","body":"ÙˆÙÙ„Ø¯ ÙÙŠ Ù‚Ø±ÙŠØ© Ù‚Ù…Ù† Ø§Ù„Ø¹Ø±ÙˆØ³ Ø¨Ù…ØµØ± Ù„Ø£Ø³Ø±Ø© ØªÙ‚ÙŠØ©."},{"id":"repose","label":"Ø§Ù„Ù†ÙŠØ§Ø­Ø©","year":"356 Ù…","body":"ØªÙ†ÙŠØ­ Ø¨Ø³Ù„Ø§Ù… ÙÙŠ Ø¬Ø¨Ù„ Ø§Ù„Ù‚Ù„Ø²Ù…."}]'::jsonb,
  '[{"id":"p1","title":"ØµÙ„Ø§Ø© Ø§Ù„Ø±Ø§Ù‡Ø¨","subtitle":"Ù…Ù† Ø§Ù„Ø£Ø¬Ø¨ÙŠØ©"}]'::jsonb,
  '[{"id":"m1","title":"Ø­Ø±Ø¨ Ø§Ù„Ø£ÙÙƒØ§Ø±","subtitle":"Ù…Ù† Ø£Ù‚ÙˆØ§Ù„ Ø£Ù†Ø·ÙˆÙ†ÙŠÙˆØ³"}]'::jsonb,
  '[{"id":"e1","title":"Ø¹ÙŠØ¯ Ø§Ù„Ø±Ù‡Ø¨Ø§Ù†","subtitle":"Ø¨Ø´Ù†Ø³"}]'::jsonb,
  '[{"id":"shenouda","title":"Ø§Ù„Ø£Ù†Ø¨Ø§ Ø´Ù†ÙˆØ¯Ø©","subtitle":"Ø±Ø¦ÙŠØ³ Ø§Ù„Ù…ØªÙˆØ­Ø¯ÙŠÙ†"}]'::jsonb
),
(
  'shenouda-2',
  'Ø§Ù„Ù‚Ø¯ÙŠØ³ Ù…ÙƒØ§Ø±ÙŠÙˆØ³ Ø§Ù„ÙƒØ¨ÙŠØ±',
  'ÙƒÙˆÙƒØ¨ Ø§Ù„Ø¨Ø±ÙŠØ©ØŒ Ø£Ø¨ Ø±Ù‡Ø¨Ø§Ù† Ø´ÙŠÙ‡ÙŠØª',
  'ØªØ°ÙƒØ§Ø± Ù†ÙŠØ§Ø­Ø© Ø§Ù„Ø£Ù†Ø¨Ø§ Ù…ÙƒØ§Ø±ÙŠÙˆØ³ Ø§Ù„ÙƒØ¨ÙŠØ±',
  'Ø§Ù„Ø£Ø­Ø¯ 7 ÙØ¨Ø±Ø§ÙŠØ± 2026',
  '27 Ø·ÙˆØ¨Ù‡ 1742',
  5, 27,
  'Ø£Ø¨ÙŠØ¶', '#b8893a',
  'ÙƒÙˆÙƒØ¨ Ø§Ù„Ø¨Ø±ÙŠØ© ÙˆØ£Ø­Ø¯ Ø£Ø¹Ø¸Ù… Ø±Ù‡Ø¨Ø§Ù† Ø´ÙŠÙ‡ÙŠØª.',
  'Ø¥Ù† ØµÙ„Ù‘ÙŠØª Ø¨ÙÙ…Ùƒ ÙˆÙ‚Ù„Ø¨Ùƒ Ù…ØªØ´ØªØª ÙÙ„Ø§ ÙØ§Ø¦Ø¯Ø© Ù…Ù† ØµÙ„Ø§ØªÙƒ.',
  '(Ø£Ù‚ÙˆØ§Ù„ Ø§Ù„Ø¢Ø¨Ø§Ø¡)',
  '390 Ù…', 'Ø¨Ø±ÙŠØ© Ø´ÙŠÙ‡ÙŠØª', 'Ø±Ø§Ù‡Ø¨ ÙˆØ£Ø¨ Ø±ÙˆØ­ÙŠ', '27 Ø·ÙˆØ¨Ù‡',
  'ÙˆÙ„Ø¯ Ø§Ù„Ù‚Ø¯ÙŠØ³ Ù…ÙƒØ§Ø±ÙŠÙˆØ³ Ø§Ù„ÙƒØ¨ÙŠØ± ÙÙŠ Ù‚Ø±ÙŠØ© Ø´Ø¨Ø´ÙŠØ± Ø¨Ù…ØµØ± Ø­ÙˆØ§Ù„ÙŠ Ø³Ù†Ø© 300 Ù….',
  'antony', 'Ø±Ø§Ù‡Ø¨ ÙˆØ£Ø¨ Ø±ÙˆØ­ÙŠ', 'Ø§Ù„Ù‚Ø±Ù† Ø§Ù„Ø±Ø§Ø¨Ø¹ Ø§Ù„Ù…ÙŠÙ„Ø§Ø¯ÙŠ', 'Ø¨Ø±ÙŠØ© Ø´ÙŠÙ‡ÙŠØª - ÙˆØ§Ø¯ÙŠ Ø§Ù„Ù†Ø·Ø±ÙˆÙ†', 'ØªØ°ÙƒØ§Ø± Ø§Ù„Ù†ÙŠØ§Ø­Ø©',
  '[{"year":"300 Ù…","text":"ÙˆÙ„Ø¯ ÙÙŠ Ù‚Ø±ÙŠØ© Ø´Ø¨Ø´ÙŠØ±."},{"year":"390 Ù…","text":"ØªÙ†ÙŠØ­ Ø¨Ø³Ù„Ø§Ù… Ø¹Ù† Ø¹Ù…Ø± 90 Ø³Ù†Ø©."}]'::jsonb,
  '["Ø§Ù„Ø¥ÙŠÙ…Ø§Ù†","Ø§Ù„ØµÙ„Ø§Ø©","Ø§Ù„Ù…Ø­Ø¨Ø©","Ø§Ù„Ø§ØªØ¶Ø§Ø¹","Ø§Ù„ØµØ¨Ø±"]'::jsonb,
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  '[{"id":"antony","title":"Ø§Ù„Ø£Ù†Ø¨Ø§ Ø£Ù†Ø·ÙˆÙ†ÙŠÙˆØ³","subtitle":"Ø£Ø¨ Ø§Ù„Ø±Ù‡Ø¨Ø§Ù†"}]'::jsonb
)
on conflict (id) do nothing;
