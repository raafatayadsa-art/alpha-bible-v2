-- Alpha Bible — safe seed data (UTF-8)
-- INSERT / UPSERT only — no DROP, TRUNCATE, DELETE, or schema changes
-- Source: src/features/katameros/data.ts + src/features/synaxarium/data.ts
-- Prerequisite: tables from 20250611160000_ensure_katamaros_synaxarium_schema.sql

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
  '[{"id":"saint-today","kind":"synaxarium","title":"سنكسار اليوم","subtitle":"ذكرى آلام السيد المسيح","to":"/synaxarium"},{"id":"feast-today","kind":"feast","title":"مناسبة اليوم","subtitle":"الجمعة العظيمة","to":"/feasts"},{"id":"prayer-related","kind":"prayer","title":"صلاة الساعة السادسة","subtitle":"من الأجبية","to":"/agpeya"},{"id":"meditation-related","kind":"meditation","title":"تأمل في الصليب","subtitle":"محبة الله الفائقة"}]'::jsonb
) on conflict (id) do update set
  coptic_date_label = excluded.coptic_date_label,
  gregorian_date_label = excluded.gregorian_date_label,
  coptic_month = excluded.coptic_month,
  coptic_day = excluded.coptic_day,
  occasion = excluded.occasion,
  liturgical_day = excluded.liturgical_day,
  accent_hex = excluded.accent_hex,
  related = excluded.related;

insert into public.katamaros_readings (
  day_id, reading_key, reading_type, title, reference, source, estimated_min, body, display_order
) values
  ('today', 'psalm', 'psalm', 'المزمور', 'مز ٢٢: ١-١٨', 'باكر', 2, 'إلهي إلهي لماذا تركتني، بعيداً عن خلاصي عن كلام زفيري. إلهي في النهار أدعو فلا تستجيب، وفي الليل فلا هدوء لي. أما أنت فقدوس، الجالس بين تسبيحات إسرائيل. عليك اتكل آباؤنا، اتكلوا فنجيتهم. إليك صرخوا فنجوا، عليك اتكلوا فلم يخزوا.', 1),
  ('today', 'pauline', 'pauline', 'البولس', 'عب ١٠: ١٩-٢٥', 'القداس', 3, 'فإذ لنا أيها الإخوة ثقة بالدخول إلى الأقداس بدم يسوع، طريقاً كرَّسه لنا حديثاً حياً، بالحجاب أي جسده، وكاهن عظيم على بيت الله، لنتقدم بقلب صادق في يقين الإيمان، مرشوشة قلوبنا من ضمير شرير.', 2),
  ('today', 'catholic', 'catholic', 'الكاثوليكون', '١بط ٣: ١٧-٢٢', 'القداس', 2, 'لأن تألمكم إن شاءت مشيئة الله وأنتم صانعون خيراً، أفضل منه وأنتم صانعون شراً. فإن المسيح أيضاً تألم مرة واحدة من أجل الخطايا، البار من أجل الأثمة، لكي يقربنا إلى الله، مماتاً في الجسد ولكن محيى في الروح.', 3),
  ('today', 'praxis', 'praxis', 'الإبركسيس', 'أع ١٠: ٣٤-٤٣', 'القداس', 3, 'ففتح بطرس فاه وقال: بالحق أنا أجد أن الله لا يقبل الوجوه، بل في كل أمة، الذي يتقيه ويصنع البر مقبول عنده. الكلمة التي أرسلها إلى بني إسرائيل يبشر بالسلام بيسوع المسيح. هذا هو رب الكل.', 4),
  ('today', 'gospel', 'gospel', 'الإنجيل', 'يو ١٩: ١٦-٣٧', 'القداس', 5, 'فحينئذٍ أسلمه إليهم ليُصلب. فأخذوا يسوع ومضوا به. فخرج وهو حامل صليبه إلى الموضع الذي يقال له موضع الجمجمة، ويقال له بالعبرانية جلجثة، حيث صلبوه. وصلبوا معه آخرَين من هنا ومن هنا، ويسوع في الوسط.', 5)
on conflict (day_id, reading_key) do update set
  reading_type = excluded.reading_type,
  title = excluded.title,
  reference = excluded.reference,
  source = excluded.source,
  estimated_min = excluded.estimated_min,
  body = excluded.body,
  display_order = excluded.display_order;

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
  'القديس شنودة رئيس المتوحدين هو أب الرهبان في البرية المصرية، وأحد أعظم آباء الرهبنة القبطية الذين تركوا بصمة لا تُمحى في تاريخ الكنيسة. عاش حياة نسكية صارمة في البرية منذ صغره، فكان نموذجاً للزهد والطاعة والصلاة الدائمة.  جمع حوله الكثير من التلاميذ والرهبان في الدير الأبيض، ووضع لهم قوانين الرهبنة التي ما زالت تُقتدى إلى اليوم. اشتُهر بمحبته للفقراء وحمايته للمظلومين، ووقف في وجه ظلم الولاة دفاعاً عن أبناء شعبه.  ترك لنا الكثير من الميامر والعظات والأقوال الروحية النافعة، التي تُعدّ كنزاً للأدب القبطي. تنيح بسلام عن عمر يناهز 118 سنة، تاركاً ميراثاً روحياً عظيماً.',
  'shenouda', 'راهب ومتوحد', 'القرن الرابع الميلادي', 'الدير الأبيض - سوهاج', 'تذكار النياحة',
  '[{"year":"348 م","text":"ولد في قرية شندويل بصعيد مصر."},{"year":"370 م","text":"ترهب على يد خاله الأنبا بجول."},{"year":"385 م","text":"صار رئيساً للدير الأبيض."},{"year":"431 م","text":"حضر مجمع أفسس مع البابا كيرلس."},{"year":"466 م","text":"تنيح بسلام عن عمر يناهز 118 سنة."}]'::jsonb,
  '["الإيمان","الصلاة","المحبة","الاتضاع","الصبر"]'::jsonb,
  '[{"id":"birth","label":"الميلاد","year":"348 م","body":"وُلد في قرية شندويل بصعيد مصر لأسرة تقية."},{"id":"service","label":"الخدمة","year":"385 م","body":"تولّى رئاسة الدير الأبيض وأرشد آلاف الرهبان."},{"id":"events","label":"أحداث مهمة","year":"431 م","body":"حضر مجمع أفسس مع البابا كيرلس دفاعاً عن الإيمان."},{"id":"repose","label":"النياحة","year":"466 م","body":"تنيح بسلام عن عمر يناهز 118 سنة في برية شيهيت."}]'::jsonb,
  '[{"id":"p1","title":"صلاة الرهبان","subtitle":"من الأجبية"},{"id":"p2","title":"تسبحة نصف الليل","subtitle":"هوس آدام"}]'::jsonb,
  '[{"id":"m1","title":"الزهد والنسك","subtitle":"تأمل روحي"},{"id":"m2","title":"حياة البرية","subtitle":"من أقوال الآباء"}]'::jsonb,
  '[{"id":"e1","title":"مجمع أفسس","subtitle":"431 م"},{"id":"e2","title":"عيد الرهبان","subtitle":"بشنس"}]'::jsonb,
  '[{"id":"antony","title":"الأنبا أنطونيوس","subtitle":"أب الرهبان"},{"id":"shenouda-2","title":"الأنبا مكاريوس","subtitle":"كوكب البرية"}]'::jsonb
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
  'ولد الأنبا أنطونيوس في قرية قمن العروس بمصر سنة 251 م لأسرة غنية تقية. ومن صغره أحب حياة العبادة والصلاة، وكان مواظباً على حضور القداسات.  بعد وفاة والديه، سمع في الكنيسة قول الرب: «إن أردت أن تكون كاملاً فاذهب وبع أملاكك وأعطها للفقراء»، فباع كل ما يملك وتفرغ للنسك. انفرد في القبور أولاً ثم توغل في البرية، فصار أباً لرهبان البرية المصرية كلها.  عاش 105 سنوات، أمضى أكثرها في البرية متعبداً، ونزل مرّتين إلى الإسكندرية: مرة لتشجيع الشهداء، ومرة للوقوف ضد الهرطقة الأريوسية. تنيح بسلام في جبل القلزم سنة 356 م.',
  'antony', 'راهب وأب روحي', 'القرن الثالث والرابع', 'جبل القلزم - البحر الأحمر', 'تذكار النياحة',
  '[{"year":"251 م","text":"ولد في قرية قمن العروس."},{"year":"271 م","text":"سمع كلمة الإنجيل وباع كل ما يملك."},{"year":"285 م","text":"انفرد في القبور للنسك والصلاة."},{"year":"311 م","text":"نزل إلى الإسكندرية لتشجيع الشهداء."},{"year":"356 م","text":"تنيح بسلام في جبل القلزم."}]'::jsonb,
  '["الإيمان","الصلاة","المحبة","الاتضاع","الصبر"]'::jsonb,
  '[{"id":"birth","label":"الميلاد","year":"251 م","body":"وُلد في قرية قمن العروس بمصر لأسرة تقية."},{"id":"service","label":"الخدمة","year":"285 م","body":"بدأ حياة النسك وجذب إليه تلاميذ كثيرين."},{"id":"events","label":"أحداث مهمة","year":"311 م","body":"نزل إلى الإسكندرية لتشجيع الشهداء في عصر الاضطهاد."},{"id":"repose","label":"النياحة","year":"356 م","body":"تنيح بسلام في جبل القلزم عن عمر 105 سنة."}]'::jsonb,
  '[{"id":"p1","title":"صلاة الراهب","subtitle":"من الأجبية"},{"id":"p2","title":"صلاة الستار","subtitle":"صلاة المساء"}]'::jsonb,
  '[{"id":"m1","title":"حرب الأفكار","subtitle":"من أقوال أنطونيوس"},{"id":"m2","title":"الصمت والوحدة","subtitle":"تأمل"}]'::jsonb,
  '[{"id":"e1","title":"عيد الرهبان","subtitle":"بشنس"},{"id":"e2","title":"تذكار النياحة","subtitle":"22 طوبه"}]'::jsonb,
  '[{"id":"shenouda","title":"الأنبا شنودة","subtitle":"رئيس المتوحدين"},{"id":"shenouda-2","title":"الأنبا مكاريوس","subtitle":"كوكب البرية"}]'::jsonb
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
  'ولد القديس مكاريوس الكبير في قرية شبشير بمصر حوالي سنة 300 م. اشتهر منذ صغره بالوداعة والتقوى، وكان مولعاً بالخلوة والصلاة.  ترك العالم وتوجه إلى البرية في الثلاثين من عمره، حيث عاش حياة نسكية صارمة. اشتُهر بنسكه الشديد وحكمته العميقة، وكان يُلقَّب بالكبير لعظم فضائله.  أسس دير القديس مكاريوس بشيهيت الذي صار منارة للرهبنة في العالم كله. ترك لنا ميراثاً عظيماً من العظات والأقوال الروحية، وتنيح بسلام عن عمر 90 سنة.',
  'antony', 'راهب وأب روحي', 'القرن الرابع الميلادي', 'برية شيهيت - وادي النطرون', 'تذكار النياحة',
  '[{"year":"300 م","text":"ولد في قرية شبشير."},{"year":"330 م","text":"ترك العالم وتوجه إلى البرية."},{"year":"360 م","text":"أسس دير القديس مكاريوس بشيهيت."},{"year":"390 م","text":"تنيح بسلام عن عمر 90 سنة."}]'::jsonb,
  '["الإيمان","الصلاة","المحبة","الاتضاع","الصبر"]'::jsonb,
  '[{"id":"birth","label":"الميلاد","year":"300 م","body":"وُلد في قرية شبشير بمصر."},{"id":"service","label":"الخدمة","year":"360 م","body":"أسس دير القديس مكاريوس بشيهيت."},{"id":"events","label":"أحداث مهمة","year":"370 م","body":"جمع حوله تلاميذ كثيرين وصار أباً لرهبان البرية."},{"id":"repose","label":"النياحة","year":"390 م","body":"تنيح بسلام عن عمر 90 سنة في برية شيهيت."}]'::jsonb,
  '[{"id":"p1","title":"صلاة شيهيت","subtitle":"من تراث الآباء"},{"id":"p2","title":"تسبحة باكر","subtitle":"هوس واطس"}]'::jsonb,
  '[{"id":"m1","title":"الصلاة القلبية","subtitle":"تأمل"},{"id":"m2","title":"حياة الشركة","subtitle":"من أقوال الآباء"}]'::jsonb,
  '[{"id":"e1","title":"عيد رهبان شيهيت","subtitle":"وادي النطرون"},{"id":"e2","title":"تذكار النياحة","subtitle":"27 طوبه"}]'::jsonb,
  '[{"id":"antony","title":"الأنبا أنطونيوس","subtitle":"أب الرهبان"},{"id":"shenouda","title":"الأنبا شنودة","subtitle":"رئيس المتوحدين"}]'::jsonb
)
on conflict (id) do update set
  name = excluded.name,
  title = excluded.title,
  feast = excluded.feast,
  gregorian_date_label = excluded.gregorian_date_label,
  coptic_date_label = excluded.coptic_date_label,
  coptic_month = excluded.coptic_month,
  coptic_day = excluded.coptic_day,
  liturgical_color = excluded.liturgical_color,
  liturgical_color_hex = excluded.liturgical_color_hex,
  summary = excluded.summary,
  quote = excluded.quote,
  quote_ref = excluded.quote_ref,
  repose_date = excluded.repose_date,
  repose_place = excluded.repose_place,
  service = excluded.service,
  commemoration = excluded.commemoration,
  bio = excluded.bio,
  image_key = excluded.image_key,
  saint_type = excluded.saint_type,
  era = excluded.era,
  service_place = excluded.service_place,
  occasion = excluded.occasion,
  events = excluded.events,
  virtues = excluded.virtues,
  timeline_phases = excluded.timeline_phases,
  related_prayers = excluded.related_prayers,
  related_meditations = excluded.related_meditations,
  related_events = excluded.related_events,
  similar_saints = excluded.similar_saints;
