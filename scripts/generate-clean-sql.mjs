/**
 * Generates supabase/RUN_IN_SQL_EDITOR_CLEAN.sql (UTF-8, no BOM).
 * Source text: src/features/katameros/data.ts + src/features/synaxarium/data.ts
 */
import fs from "node:fs";
import path from "node:path";

const out = path.join("supabase", "RUN_IN_SQL_EDITOR_CLEAN.sql");

function sqlStr(s) {
  return `'${String(s).replace(/\\/g, "\\\\").replace(/'/g, "''").replace(/\r/g, "").replace(/\n/g, " ")}'`;
}

function sqlJson(obj) {
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

const katamarosDay = {
  id: "today",
  coptic_date_label: "٧ بشنس ١٧٤٢",
  gregorian_date_label: "١٥ مايو ٢٠٢٦",
  coptic_month: 8,
  coptic_day: 7,
  occasion: "الجمعة العظيمة",
  liturgical_day: "قراءات أسبوع الآلام",
  accent_hex: "#6a4ab5",
  related: [
    {
      id: "saint-today",
      kind: "synaxarium",
      title: "سنكسار اليوم",
      subtitle: "ذكرى آلام السيد المسيح",
      to: "/synaxarium",
    },
    {
      id: "feast-today",
      kind: "feast",
      title: "مناسبة اليوم",
      subtitle: "الجمعة العظيمة",
      to: "/feasts",
    },
    {
      id: "prayer-related",
      kind: "prayer",
      title: "صلاة الساعة السادسة",
      subtitle: "من الأجبية",
      to: "/agpeya",
    },
    {
      id: "meditation-related",
      kind: "meditation",
      title: "تأمل في الصليب",
      subtitle: "محبة الله الفائقة",
    },
  ],
};

const readings = [
  {
    reading_key: "psalm",
    reading_type: "psalm",
    title: "المزمور",
    reference: "مز ٢٢: ١-١٨",
    source: "باكر",
    estimated_min: 2,
    body: "إلهي إلهي لماذا تركتني، بعيداً عن خلاصي عن كلام زفيري. إلهي في النهار أدعو فلا تستجيب، وفي الليل فلا هدوء لي. أما أنت فقدوس، الجالس بين تسبيحات إسرائيل. عليك اتكل آباؤنا، اتكلوا فنجيتهم. إليك صرخوا فنجوا، عليك اتكلوا فلم يخزوا.",
    display_order: 1,
  },
  {
    reading_key: "pauline",
    reading_type: "pauline",
    title: "البولس",
    reference: "عب ١٠: ١٩-٢٥",
    source: "القداس",
    estimated_min: 3,
    body: "فإذ لنا أيها الإخوة ثقة بالدخول إلى الأقداس بدم يسوع، طريقاً كرَّسه لنا حديثاً حياً، بالحجاب أي جسده، وكاهن عظيم على بيت الله، لنتقدم بقلب صادق في يقين الإيمان، مرشوشة قلوبنا من ضمير شرير.",
    display_order: 2,
  },
  {
    reading_key: "catholic",
    reading_type: "catholic",
    title: "الكاثوليكون",
    reference: "١بط ٣: ١٧-٢٢",
    source: "القداس",
    estimated_min: 2,
    body: "لأن تألمكم إن شاءت مشيئة الله وأنتم صانعون خيراً، أفضل منه وأنتم صانعون شراً. فإن المسيح أيضاً تألم مرة واحدة من أجل الخطايا، البار من أجل الأثمة، لكي يقربنا إلى الله، مماتاً في الجسد ولكن محيى في الروح.",
    display_order: 3,
  },
  {
    reading_key: "praxis",
    reading_type: "praxis",
    title: "الإبركسيس",
    reference: "أع ١٠: ٣٤-٤٣",
    source: "القداس",
    estimated_min: 3,
    body: "ففتح بطرس فاه وقال: بالحق أنا أجد أن الله لا يقبل الوجوه، بل في كل أمة، الذي يتقيه ويصنع البر مقبول عنده. الكلمة التي أرسلها إلى بني إسرائيل يبشر بالسلام بيسوع المسيح. هذا هو رب الكل.",
    display_order: 4,
  },
  {
    reading_key: "gospel",
    reading_type: "gospel",
    title: "الإنجيل",
    reference: "يو ١٩: ١٦-٣٧",
    source: "القداس",
    estimated_min: 5,
    body: "فحينئذٍ أسلمه إليهم ليُصلب. فأخذوا يسوع ومضوا به. فخرج وهو حامل صليبه إلى الموضع الذي يقال له موضع الجمجمة، ويقال له بالعبرانية جلجثة، حيث صلبوه. وصلبوا معه آخرَين من هنا ومن هنا، ويسوع في الوسط.",
    display_order: 5,
  },
];

const virtues = ["الإيمان", "الصلاة", "المحبة", "الاتضاع", "الصبر"];

const saints = [
  {
    id: "shenouda",
    name: "القديس شنودة رئيس المتوحدين",
    title: "الراهب العظيم، أب الرهبان",
    feast: "اليوم: استشهاد القديس شنودة رئيس المتوحدين",
    gregorian_date_label: "الجمعة 15 مايو 2026",
    coptic_date_label: "7 بشنس 1742",
    coptic_month: 8,
    coptic_day: 7,
    liturgical_color: "أخضر",
    liturgical_color_hex: "#3e7a55",
    summary: "أب الرهبان وأحد أعمدة الرهبنة القبطية في البرية المصرية.",
    quote: "إن كنت تريد أن تصير كاملاً، فاذهب وبعْ كل ما لك وتعال اتبعني.",
    quote_ref: "(مت 21:29)",
    repose_date: "حوالي 466 م",
    repose_place: "برية شيهيت",
    service: "راهب ومتوحد",
    commemoration: "7 بشنس",
    bio: "القديس شنودة رئيس المتوحدين هو أب الرهبان في البرية المصرية، وأحد أعظم آباء الرهبنة القبطية الذين تركوا بصمة لا تُمحى في تاريخ الكنيسة. عاش حياة نسكية صارمة في البرية منذ صغره، فكان نموذجاً للزهد والطاعة والصلاة الدائمة.\n\nجمع حوله الكثير من التلاميذ والرهبان في الدير الأبيض، ووضع لهم قوانين الرهبنة التي ما زالت تُقتدى إلى اليوم. اشتُهر بمحبته للفقراء وحمايته للمظلومين، ووقف في وجه ظلم الولاة دفاعاً عن أبناء شعبه.\n\nترك لنا الكثير من الميامر والعظات والأقوال الروحية النافعة، التي تُعدّ كنزاً للأدب القبطي. تنيح بسلام عن عمر يناهز 118 سنة، تاركاً ميراثاً روحياً عظيماً.",
    image_key: "shenouda",
    saint_type: "راهب ومتوحد",
    era: "القرن الرابع الميلادي",
    service_place: "الدير الأبيض - سوهاج",
    occasion: "تذكار النياحة",
    events: [
      { year: "348 م", text: "ولد في قرية شندويل بصعيد مصر." },
      { year: "370 م", text: "ترهب على يد خاله الأنبا بجول." },
      { year: "385 م", text: "صار رئيساً للدير الأبيض." },
      { year: "431 م", text: "حضر مجمع أفسس مع البابا كيرلس." },
      { year: "466 م", text: "تنيح بسلام عن عمر يناهز 118 سنة." },
    ],
    timeline_phases: [
      { id: "birth", label: "الميلاد", year: "348 م", body: "وُلد في قرية شندويل بصعيد مصر لأسرة تقية." },
      { id: "service", label: "الخدمة", year: "385 م", body: "تولّى رئاسة الدير الأبيض وأرشد آلاف الرهبان." },
      { id: "events", label: "أحداث مهمة", year: "431 م", body: "حضر مجمع أفسس مع البابا كيرلس دفاعاً عن الإيمان." },
      { id: "repose", label: "النياحة", year: "466 م", body: "تنيح بسلام عن عمر يناهز 118 سنة في برية شيهيت." },
    ],
    related_prayers: [
      { id: "p1", title: "صلاة الرهبان", subtitle: "من الأجبية" },
      { id: "p2", title: "تسبحة نصف الليل", subtitle: "هوس آدام" },
    ],
    related_meditations: [
      { id: "m1", title: "الزهد والنسك", subtitle: "تأمل روحي" },
      { id: "m2", title: "حياة البرية", subtitle: "من أقوال الآباء" },
    ],
    related_events: [
      { id: "e1", title: "مجمع أفسس", subtitle: "431 م" },
      { id: "e2", title: "عيد الرهبان", subtitle: "بشنس" },
    ],
    similar_saints: [
      { id: "antony", title: "الأنبا أنطونيوس", subtitle: "أب الرهبان" },
      { id: "shenouda-2", title: "الأنبا مكاريوس", subtitle: "كوكب البرية" },
    ],
  },
  {
    id: "antony",
    name: "القديس أنبا أنطونيوس الكبير",
    title: "أب الرهبنة في العالم كله",
    feast: "تذكار نياحة الأنبا أنطونيوس",
    gregorian_date_label: "السبت 30 يناير 2026",
    coptic_date_label: "22 طوبه 1742",
    coptic_month: 5,
    coptic_day: 22,
    liturgical_color: "أبيض",
    liturgical_color_hex: "#b8893a",
    summary: "أب الرهبنة المسيحية وقدوة المتوحدين في كل العصور.",
    quote: "لا تخف يا أنطونيوس، فأنا معك في كل حين.",
    quote_ref: "(صوت من السماء)",
    repose_date: "356 م",
    repose_place: "جبل القلزم",
    service: "أب الرهبان",
    commemoration: "22 طوبه",
    bio: "ولد الأنبا أنطونيوس في قرية قمن العروس بمصر سنة 251 م لأسرة غنية تقية. ومن صغره أحب حياة العبادة والصلاة، وكان مواظباً على حضور القداسات.\n\nبعد وفاة والديه، سمع في الكنيسة قول الرب: «إن أردت أن تكون كاملاً فاذهب وبع أملاكك وأعطها للفقراء»، فباع كل ما يملك وتفرغ للنسك. انفرد في القبور أولاً ثم توغل في البرية، فصار أباً لرهبان البرية المصرية كلها.\n\nعاش 105 سنوات، أمضى أكثرها في البرية متعبداً، ونزل مرّتين إلى الإسكندرية: مرة لتشجيع الشهداء، ومرة للوقوف ضد الهرطقة الأريوسية. تنيح بسلام في جبل القلزم سنة 356 م.",
    image_key: "antony",
    saint_type: "راهب وأب روحي",
    era: "القرن الثالث والرابع",
    service_place: "جبل القلزم - البحر الأحمر",
    occasion: "تذكار النياحة",
    events: [
      { year: "251 م", text: "ولد في قرية قمن العروس." },
      { year: "271 م", text: "سمع كلمة الإنجيل وباع كل ما يملك." },
      { year: "285 م", text: "انفرد في القبور للنسك والصلاة." },
      { year: "311 م", text: "نزل إلى الإسكندرية لتشجيع الشهداء." },
      { year: "356 م", text: "تنيح بسلام في جبل القلزم." },
    ],
    timeline_phases: [
      { id: "birth", label: "الميلاد", year: "251 م", body: "وُلد في قرية قمن العروس بمصر لأسرة تقية." },
      { id: "service", label: "الخدمة", year: "285 م", body: "بدأ حياة النسك وجذب إليه تلاميذ كثيرين." },
      { id: "events", label: "أحداث مهمة", year: "311 م", body: "نزل إلى الإسكندرية لتشجيع الشهداء في عصر الاضطهاد." },
      { id: "repose", label: "النياحة", year: "356 م", body: "تنيح بسلام في جبل القلزم عن عمر 105 سنة." },
    ],
    related_prayers: [
      { id: "p1", title: "صلاة الراهب", subtitle: "من الأجبية" },
      { id: "p2", title: "صلاة الستار", subtitle: "صلاة المساء" },
    ],
    related_meditations: [
      { id: "m1", title: "حرب الأفكار", subtitle: "من أقوال أنطونيوس" },
      { id: "m2", title: "الصمت والوحدة", subtitle: "تأمل" },
    ],
    related_events: [
      { id: "e1", title: "عيد الرهبان", subtitle: "بشنس" },
      { id: "e2", title: "تذكار النياحة", subtitle: "22 طوبه" },
    ],
    similar_saints: [
      { id: "shenouda", title: "الأنبا شنودة", subtitle: "رئيس المتوحدين" },
      { id: "shenouda-2", title: "الأنبا مكاريوس", subtitle: "كوكب البرية" },
    ],
  },
  {
    id: "shenouda-2",
    name: "القديس مكاريوس الكبير",
    title: "كوكب البرية، أب رهبان شيهيت",
    feast: "تذكار نياحة الأنبا مكاريوس الكبير",
    gregorian_date_label: "الأحد 7 فبراير 2026",
    coptic_date_label: "27 طوبه 1742",
    coptic_month: 5,
    coptic_day: 27,
    liturgical_color: "أبيض",
    liturgical_color_hex: "#b8893a",
    summary: "كوكب البرية وأحد أعظم رهبان شيهيت.",
    quote: "إن صلّيت بفمك وقلبك متشتت فلا فائدة من صلاتك.",
    quote_ref: "(أقوال الآباء)",
    repose_date: "390 م",
    repose_place: "برية شيهيت",
    service: "راهب وأب روحي",
    commemoration: "27 طوبه",
    bio: "ولد القديس مكاريوس الكبير في قرية شبشير بمصر حوالي سنة 300 م. اشتهر منذ صغره بالوداعة والتقوى، وكان مولعاً بالخلوة والصلاة.\n\nترك العالم وتوجه إلى البرية في الثلاثين من عمره، حيث عاش حياة نسكية صارمة. اشتُهر بنسكه الشديد وحكمته العميقة، وكان يُلقَّب بالكبير لعظم فضائله.\n\nأسس دير القديس مكاريوس بشيهيت الذي صار منارة للرهبنة في العالم كله. ترك لنا ميراثاً عظيماً من العظات والأقوال الروحية، وتنيح بسلام عن عمر 90 سنة.",
    image_key: "antony",
    saint_type: "راهب وأب روحي",
    era: "القرن الرابع الميلادي",
    service_place: "برية شيهيت - وادي النطرون",
    occasion: "تذكار النياحة",
    events: [
      { year: "300 م", text: "ولد في قرية شبشير." },
      { year: "330 م", text: "ترك العالم وتوجه إلى البرية." },
      { year: "360 م", text: "أسس دير القديس مكاريوس بشيهيت." },
      { year: "390 م", text: "تنيح بسلام عن عمر 90 سنة." },
    ],
    timeline_phases: [
      { id: "birth", label: "الميلاد", year: "300 م", body: "وُلد في قرية شبشير بمصر." },
      { id: "service", label: "الخدمة", year: "360 م", body: "أسس دير القديس مكاريوس بشيهيت." },
      { id: "events", label: "أحداث مهمة", year: "370 م", body: "جمع حوله تلاميذ كثيرين وصار أباً لرهبان البرية." },
      { id: "repose", label: "النياحة", year: "390 م", body: "تنيح بسلام عن عمر 90 سنة في برية شيهيت." },
    ],
    related_prayers: [
      { id: "p1", title: "صلاة شيهيت", subtitle: "من تراث الآباء" },
      { id: "p2", title: "تسبحة باكر", subtitle: "هوس واطس" },
    ],
    related_meditations: [
      { id: "m1", title: "الصلاة القلبية", subtitle: "تأمل" },
      { id: "m2", title: "حياة الشركة", subtitle: "من أقوال الآباء" },
    ],
    related_events: [
      { id: "e1", title: "عيد رهبان شيهيت", subtitle: "وادي النطرون" },
      { id: "e2", title: "تذكار النياحة", subtitle: "27 طوبه" },
    ],
    similar_saints: [
      { id: "antony", title: "الأنبا أنطونيوس", subtitle: "أب الرهبان" },
      { id: "shenouda", title: "الأنبا شنودة", subtitle: "رئيس المتوحدين" },
    ],
  },
];

for (const s of saints) {
  s.virtues = virtues;
}

const lines = [];
lines.push("-- Alpha Bible — safe seed data (UTF-8)");
lines.push("-- INSERT / UPSERT only — no DROP, TRUNCATE, DELETE, or schema changes");
lines.push("-- Source: src/features/katameros/data.ts + src/features/synaxarium/data.ts");
lines.push("-- Prerequisite: tables from 20250611160000_ensure_katamaros_synaxarium_schema.sql");
lines.push("");

lines.push("insert into public.katamaros_days (");
lines.push("  id, coptic_date_label, gregorian_date_label, coptic_month, coptic_day,");
lines.push("  occasion, liturgical_day, accent_hex, related");
lines.push(") values (");
lines.push(`  ${sqlStr(katamarosDay.id)},`);
lines.push(`  ${sqlStr(katamarosDay.coptic_date_label)},`);
lines.push(`  ${sqlStr(katamarosDay.gregorian_date_label)},`);
lines.push(`  ${katamarosDay.coptic_month}, ${katamarosDay.coptic_day},`);
lines.push(`  ${sqlStr(katamarosDay.occasion)},`);
lines.push(`  ${sqlStr(katamarosDay.liturgical_day)},`);
lines.push(`  ${sqlStr(katamarosDay.accent_hex)},`);
lines.push(`  ${sqlJson(katamarosDay.related)}`);
lines.push(") on conflict (id) do update set");
lines.push("  coptic_date_label = excluded.coptic_date_label,");
lines.push("  gregorian_date_label = excluded.gregorian_date_label,");
lines.push("  coptic_month = excluded.coptic_month,");
lines.push("  coptic_day = excluded.coptic_day,");
lines.push("  occasion = excluded.occasion,");
lines.push("  liturgical_day = excluded.liturgical_day,");
lines.push("  accent_hex = excluded.accent_hex,");
lines.push("  related = excluded.related;");
lines.push("");

lines.push("insert into public.katamaros_readings (");
lines.push("  day_id, reading_key, reading_type, title, reference, source, estimated_min, body, display_order");
lines.push(") values");
readings.forEach((r, i) => {
  const comma = i < readings.length - 1 ? "," : "";
  lines.push(
    `  (${sqlStr("today")}, ${sqlStr(r.reading_key)}, ${sqlStr(r.reading_type)}, ${sqlStr(r.title)}, ${sqlStr(r.reference)}, ${sqlStr(r.source)}, ${r.estimated_min}, ${sqlStr(r.body)}, ${r.display_order})${comma}`,
  );
});
lines.push("on conflict (day_id, reading_key) do update set");
lines.push("  reading_type = excluded.reading_type,");
lines.push("  title = excluded.title,");
lines.push("  reference = excluded.reference,");
lines.push("  source = excluded.source,");
lines.push("  estimated_min = excluded.estimated_min,");
lines.push("  body = excluded.body,");
lines.push("  display_order = excluded.display_order;");
lines.push("");

lines.push("insert into public.synaxarium_saints (");
lines.push("  id, name, title, feast, gregorian_date_label, coptic_date_label,");
lines.push("  coptic_month, coptic_day, liturgical_color, liturgical_color_hex,");
lines.push("  summary, quote, quote_ref, repose_date, repose_place, service, commemoration,");
lines.push("  bio, image_key, saint_type, era, service_place, occasion,");
lines.push("  events, virtues, timeline_phases, related_prayers, related_meditations,");
lines.push("  related_events, similar_saints");
lines.push(") values");

saints.forEach((s, i) => {
  const comma = i < saints.length - 1 ? "," : "";
  lines.push("(");
  lines.push(`  ${sqlStr(s.id)},`);
  lines.push(`  ${sqlStr(s.name)},`);
  lines.push(`  ${sqlStr(s.title)},`);
  lines.push(`  ${sqlStr(s.feast)},`);
  lines.push(`  ${sqlStr(s.gregorian_date_label)},`);
  lines.push(`  ${sqlStr(s.coptic_date_label)},`);
  lines.push(`  ${s.coptic_month}, ${s.coptic_day},`);
  lines.push(`  ${sqlStr(s.liturgical_color)}, ${sqlStr(s.liturgical_color_hex)},`);
  lines.push(`  ${sqlStr(s.summary)},`);
  lines.push(`  ${sqlStr(s.quote)},`);
  lines.push(`  ${sqlStr(s.quote_ref)},`);
  lines.push(`  ${sqlStr(s.repose_date)}, ${sqlStr(s.repose_place)}, ${sqlStr(s.service)}, ${sqlStr(s.commemoration)},`);
  lines.push(`  ${sqlStr(s.bio)},`);
  lines.push(`  ${sqlStr(s.image_key)}, ${sqlStr(s.saint_type)}, ${sqlStr(s.era)}, ${sqlStr(s.service_place)}, ${sqlStr(s.occasion)},`);
  lines.push(`  ${sqlJson(s.events)},`);
  lines.push(`  ${sqlJson(s.virtues)},`);
  lines.push(`  ${sqlJson(s.timeline_phases)},`);
  lines.push(`  ${sqlJson(s.related_prayers ?? [])},`);
  lines.push(`  ${sqlJson(s.related_meditations ?? [])},`);
  lines.push(`  ${sqlJson(s.related_events ?? [])},`);
  lines.push(`  ${sqlJson(s.similar_saints ?? [])}`);
  lines.push(`)${comma}`);
});

lines.push("on conflict (id) do update set");
lines.push("  name = excluded.name,");
lines.push("  title = excluded.title,");
lines.push("  feast = excluded.feast,");
lines.push("  gregorian_date_label = excluded.gregorian_date_label,");
lines.push("  coptic_date_label = excluded.coptic_date_label,");
lines.push("  coptic_month = excluded.coptic_month,");
lines.push("  coptic_day = excluded.coptic_day,");
lines.push("  liturgical_color = excluded.liturgical_color,");
lines.push("  liturgical_color_hex = excluded.liturgical_color_hex,");
lines.push("  summary = excluded.summary,");
lines.push("  quote = excluded.quote,");
lines.push("  quote_ref = excluded.quote_ref,");
lines.push("  repose_date = excluded.repose_date,");
lines.push("  repose_place = excluded.repose_place,");
lines.push("  service = excluded.service,");
lines.push("  commemoration = excluded.commemoration,");
lines.push("  bio = excluded.bio,");
lines.push("  image_key = excluded.image_key,");
lines.push("  saint_type = excluded.saint_type,");
lines.push("  era = excluded.era,");
lines.push("  service_place = excluded.service_place,");
lines.push("  occasion = excluded.occasion,");
lines.push("  events = excluded.events,");
lines.push("  virtues = excluded.virtues,");
lines.push("  timeline_phases = excluded.timeline_phases,");
lines.push("  related_prayers = excluded.related_prayers,");
lines.push("  related_meditations = excluded.related_meditations,");
lines.push("  related_events = excluded.related_events,");
lines.push("  similar_saints = excluded.similar_saints;");

const sql = lines.join("\n") + "\n";
fs.writeFileSync(out, sql, { encoding: "utf8" });

const mojibake = /[ØÙÃÂ]|Ø£|Ù/;
if (mojibake.test(sql)) {
  console.error("ERROR: mojibake detected in output");
  process.exit(1);
}

console.log(`Wrote ${out} (${sql.length} bytes, ${lines.length} lines)`);
