-- Step 3: Katamaros + Synaxarium tables (public read, dev-friendly RLS)

-- ── Synaxarium ──────────────────────────────────────────────────
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

-- ── RLS: read-only for app ──────────────────────────────────────
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

-- ── Seed: today's katamaros (matches local mock) ────────────────
insert into public.katamaros_days (
  id, coptic_date_label, gregorian_date_label, coptic_month, coptic_day,
  occasion, liturgical_day, accent_hex, related
) values (
  'today',
  '٧ بشنس ١٧٤٢',
  '١٥ مايو ٢٠٢٦',
  8, 7,
  'الجمعة العظيمة',
  'قراءات أسبوع الآلام',
  '#6a4ab5',
  '[
    {"id":"saint-today","kind":"synaxarium","title":"سنكسار اليوم","subtitle":"ذكرى آلام السيد المسيح","to":"/synaxarium"},
    {"id":"feast-today","kind":"feast","title":"مناسبة اليوم","subtitle":"الجمعة العظيمة","to":"/feasts"},
    {"id":"prayer-related","kind":"prayer","title":"صلاة الساعة السادسة","subtitle":"من الأجبية","to":"/agpeya"},
    {"id":"meditation-related","kind":"meditation","title":"تأمل في الصليب","subtitle":"محبة الله الفائقة"}
  ]'::jsonb
) on conflict (id) do nothing;

insert into public.katamaros_readings (
  day_id, reading_key, reading_type, title, reference, source, estimated_min, body, display_order
) values
  ('today', 'psalm', 'psalm', 'المزمور', 'مز ٢٢: ١-١٨', 'باكر', 2,
   'إلهي إلهي لماذا تركتني، بعيداً عن خلاصي عن كلام زفيري. إلهي في النهار أدعو فلا تستجيب، وفي الليل فلا هدوء لي. أما أنت فقدوس، الجالس بين تسبيحات إسرائيل. عليك اتكل آباؤنا، اتكلوا فنجيتهم. إليك صرخوا فنجوا، عليك اتكلوا فلم يخزوا.',
   1),
  ('today', 'pauline', 'pauline', 'البولس', 'عب ١٠: ١٩-٢٥', 'القداس', 3,
   'فإذ لنا أيها الإخوة ثقة بالدخول إلى الأقداس بدم يسوع، طريقاً كرَّسه لنا حديثاً حياً، بالحجاب أي جسده، وكاهن عظيم على بيت الله، لنتقدم بقلب صادق في يقين الإيمان، مرشوشة قلوبنا من ضمير شرير.',
   2),
  ('today', 'catholic', 'catholic', 'الكاثوليكون', '١بط ٣: ١٧-٢٢', 'القداس', 2,
   'لأن تألمكم إن شاءت مشيئة الله وأنتم صانعون خيراً، أفضل منه وأنتم صانعون شراً. فإن المسيح أيضاً تألم مرة واحدة من أجل الخطايا، البار من أجل الأثمة، لكي يقربنا إلى الله، مماتاً في الجسد ولكن محيى في الروح.',
   3),
  ('today', 'praxis', 'praxis', 'الإبركسيس', 'أع ١٠: ٣٤-٤٣', 'القداس', 3,
   'ففتح بطرس فاه وقال: بالحق أنا أجد أن الله لا يقبل الوجوه، بل في كل أمة، الذي يتقيه ويصنع البر مقبول عنده. الكلمة التي أرسلها إلى بني إسرائيل يبشر بالسلام بيسوع المسيح. هذا هو رب الكل.',
   4),
  ('today', 'gospel', 'gospel', 'الإنجيل', 'يو ١٩: ١٦-٣٧', 'القداس', 5,
   'فحينئذٍ أسلمه إليهم ليُصلب. فأخذوا يسوع ومضوا به. فخرج وهو حامل صليبه إلى الموضع الذي يقال له موضع الجمجمة، ويقال له بالعبرانية جلجثة، حيث صلبوه. وصلبوا معه آخرَين من هنا ومن هنا، ويسوع في الوسط.',
   5)
on conflict (day_id, reading_key) do nothing;

-- ── Seed: synaxarium saints (core fields; app maps image_key → assets) ─
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
  'القديس شنودة رئيس المتوحدين',
  'الراهب العظيم، أب الرهبان',
  'اليوم: استشهاد القديس شنودة رئيس المتوحدين',
  'الجمعة 15 مايو 2026',
  '7 بشنس 1742',
  8, 7,
  'أخضر', '#3e7a55',
  'أب الرهبان وأحد أعمدة الرهبنة القبطية في البرية المصرية.',
  'إن كنت تريد أن تصير كاملاً، فاذهب وبعْ كل ما لك وتعال اتبعني.',
  '(مت 21:29)',
  'حوالي 466 م', 'برية شيهيت', 'راهب ومتوحد', '7 بشنس',
  'القديس شنودة رئيس المتوحدين هو أب الرهبان في البرية المصرية، وأحد أعظم آباء الرهبنة القبطية الذين تركوا بصمة لا تُمحى في تاريخ الكنيسة.',
  'shenouda', 'راهب ومتوحد', 'القرن الرابع الميلادي', 'الدير الأبيض - سوهاج', 'تذكار النياحة',
  '[{"year":"348 م","text":"ولد في قرية شندويل بصعيد مصر."},{"year":"466 م","text":"تنيح بسلام عن عمر يناهز 118 سنة."}]'::jsonb,
  '["الإيمان","الصلاة","المحبة","الاتضاع","الصبر"]'::jsonb,
  '[{"id":"birth","label":"الميلاد","year":"348 م","body":"وُلد في قرية شندويل بصعيد مصر لأسرة تقية."},{"id":"repose","label":"النياحة","year":"466 م","body":"تنيح بسلام في برية شيهيت."}]'::jsonb,
  '[{"id":"p1","title":"صلاة الرهبان","subtitle":"من الأجبية"}]'::jsonb,
  '[{"id":"m1","title":"الزهد والنسك","subtitle":"تأمل روحي"}]'::jsonb,
  '[{"id":"e1","title":"مجمع أفسس","subtitle":"431 م"}]'::jsonb,
  '[{"id":"antony","title":"الأنبا أنطونيوس","subtitle":"أب الرهبان"}]'::jsonb
),
(
  'antony',
  'القديس أنبا أنطونيوس الكبير',
  'أب الرهبنة في العالم كله',
  'تذكار نياحة الأنبا أنطونيوس',
  'السبت 30 يناير 2026',
  '22 طوبه 1742',
  5, 22,
  'أبيض', '#b8893a',
  'أب الرهبنة المسيحية وقدوة المتوحدين في كل العصور.',
  'لا تخف يا أنطونيوس، فأنا معك في كل حين.',
  '(صوت من السماء)',
  '356 م', 'جبل القلزم', 'أب الرهبان', '22 طوبه',
  'ولد الأنبا أنطونيوس في قرية قمن العروس بمصر سنة 251 م لأسرة غنية تقية.',
  'antony', 'راهب وأب روحي', 'القرن الثالث والرابع', 'جبل القلزم - البحر الأحمر', 'تذكار النياحة',
  '[{"year":"251 م","text":"ولد في قرية قمن العروس."},{"year":"356 م","text":"تنيح بسلام في جبل القلزم."}]'::jsonb,
  '["الإيمان","الصلاة","المحبة","الاتضاع","الصبر"]'::jsonb,
  '[{"id":"birth","label":"الميلاد","year":"251 م","body":"وُلد في قرية قمن العروس بمصر لأسرة تقية."},{"id":"repose","label":"النياحة","year":"356 م","body":"تنيح بسلام في جبل القلزم."}]'::jsonb,
  '[{"id":"p1","title":"صلاة الراهب","subtitle":"من الأجبية"}]'::jsonb,
  '[{"id":"m1","title":"حرب الأفكار","subtitle":"من أقوال أنطونيوس"}]'::jsonb,
  '[{"id":"e1","title":"عيد الرهبان","subtitle":"بشنس"}]'::jsonb,
  '[{"id":"shenouda","title":"الأنبا شنودة","subtitle":"رئيس المتوحدين"}]'::jsonb
),
(
  'shenouda-2',
  'القديس مكاريوس الكبير',
  'كوكب البرية، أب رهبان شيهيت',
  'تذكار نياحة الأنبا مكاريوس الكبير',
  'الأحد 7 فبراير 2026',
  '27 طوبه 1742',
  5, 27,
  'أبيض', '#b8893a',
  'كوكب البرية وأحد أعظم رهبان شيهيت.',
  'إن صلّيت بفمك وقلبك متشتت فلا فائدة من صلاتك.',
  '(أقوال الآباء)',
  '390 م', 'برية شيهيت', 'راهب وأب روحي', '27 طوبه',
  'ولد القديس مكاريوس الكبير في قرية شبشير بمصر حوالي سنة 300 م.',
  'antony', 'راهب وأب روحي', 'القرن الرابع الميلادي', 'برية شيهيت - وادي النطرون', 'تذكار النياحة',
  '[{"year":"300 م","text":"ولد في قرية شبشير."},{"year":"390 م","text":"تنيح بسلام عن عمر 90 سنة."}]'::jsonb,
  '["الإيمان","الصلاة","المحبة","الاتضاع","الصبر"]'::jsonb,
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  '[{"id":"antony","title":"الأنبا أنطونيوس","subtitle":"أب الرهبان"}]'::jsonb
)
on conflict (id) do nothing;
