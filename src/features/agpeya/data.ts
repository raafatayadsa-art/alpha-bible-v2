import type {
  AgpeyaFragment,
  AgpeyaGospelPassage,
  AgpeyaInfoEntry,
  AgpeyaPrayer,
  AgpeyaPsalm,
  AgpeyaTabContent,
  AgpeyaTabKey,
} from "./types";

/**
 * Agpeya catalog — placeholder content.
 *
 * IMPORTANT: All text below is a CLEARLY MARKED placeholder used to
 * scaffold the user experience until verified Coptic Orthodox Agpeya
 * sources are loaded. The reader displays a visible "محتوى تجريبي"
 * banner so users do not mistake this for the verified liturgical text.
 *
 * Do NOT treat this as canonical content.
 */

export const AGPEYA_DRAFT_NOTICE =
  "محتوى تجريبي — قيد المراجعة من مصادر الأجبية القبطية المعتمدة.";

/* ---------- Helpers to generate consistent placeholder content ---------- */

const PSALM_TITLES = [
  "ترنيمة الصباح", "صلاة المرتل", "تسبيح الرب", "ثقة المؤمن",
  "رحمة الله", "طلبة القلب", "أنشودة الصعود", "نور النهار",
  "ذكر مراحم الرب", "رجاء الخلاص", "تسبحة الفرح", "صلاة الإتكال",
];

const PSALM_VERSES_POOL = [
  "إرحمني يا الله كعظيم رحمتك، ومثل كثرة رأفاتك تمحو إثمي.",
  "إغسلني كثيراً من إثمي، ومن خطيتي طهرني.",
  "قلباً نقياً اخلق فيَّ يا الله، وروحاً مستقيماً جدد في أحشائي.",
  "الرب نوري وخلاصي ممن أخاف، الرب حصن حياتي ممن أرتعب.",
  "إلى متى يا رب تنساني إلى الإنقضاء، إلى متى تصرف وجهك عني.",
  "أحبك يا رب يا قوتي، الرب صخرتي وحصني ومنقذي.",
  "السماوات تذيع مجد الله، والفلك يخبر بعمل يديه.",
  "إفتقد كرمتك واصلحها، التي غرستها يمينك.",
  "بارك يا نفسي الرب، يا الرب إلهي قد عظمت جداً.",
  "هلموا نبتهج بالرب، نهتف لله مخلصنا.",
  "أعترف لك يا رب بكل قلبي، أحدث بجميع عجائبك.",
  "طوبى للرجل الذي لم يسلك في مشورة الأشرار.",
];

function makePsalms(count: number, seed: number): AgpeyaPsalm[] {
  const out: AgpeyaPsalm[] = [];
  for (let i = 0; i < count; i++) {
    const number = ((seed + i * 7) % 150) + 1;
    const verses: string[] = [];
    const vCount = 4 + ((seed + i) % 3);
    for (let v = 0; v < vCount; v++) {
      verses.push(PSALM_VERSES_POOL[(seed + i + v) % PSALM_VERSES_POOL.length]);
    }
    out.push({
      number,
      title: PSALM_TITLES[(seed + i) % PSALM_TITLES.length],
      verses,
    });
  }
  return out;
}

function makeGospel(count: number, seed: number): AgpeyaGospelPassage[] {
  const refs = [
    "إنجيل معلمنا متى الإصحاح الخامس",
    "إنجيل معلمنا مرقس الإصحاح الرابع",
    "إنجيل معلمنا لوقا الإصحاح الحادي عشر",
    "إنجيل معلمنا يوحنا الإصحاح السادس عشر",
  ];
  const passages = [
    "في ذلك الزمان، لما رأى يسوع الجموع صعد إلى الجبل، فلما جلس تقدم إليه تلاميذه. ففتح فاه وعلمهم قائلاً: طوبى للمساكين بالروح، لأن لهم ملكوت السماوات. طوبى للحزانى، لأنهم يتعزون.\n\nأنتم نور العالم. لا يمكن أن تخفى مدينة موضوعة على جبل. أنتم ملح الأرض، فإن فسد الملح فبماذا يملح؟",
    "وقال لهم: هكذا ملكوت الله، كأن إنساناً يلقي البذار على الأرض، وينام ويقوم ليلاً ونهاراً، والبذار يطلع وينمو وهو لا يعلم كيف.",
    "وقال لهم مثلاً: من منكم يكون له صديق ويمضي إليه نصف الليل ويقول له: يا صديق، أقرضني ثلاثة أرغفة.",
    "الحق الحق أقول لكم: إن كل ما طلبتم من الآب باسمي يعطيكم. إلى الآن لم تطلبوا شيئاً باسمي. اطلبوا تأخذوا، ليكون فرحكم كاملاً.",
  ];
  const out: AgpeyaGospelPassage[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      reference: refs[(seed + i) % refs.length],
      intro: "مبارك الآتي باسم الرب، ربنا وإلهنا ومخلصنا يسوع المسيح، له المجد دائماً.",
      passage: passages[(seed + i) % passages.length],
      conclusion: "والمجد لله دائماً. آمين.",
    });
  }
  return out;
}

function makeFragments(seed: number): AgpeyaFragment[] {
  const all: AgpeyaFragment[] = [
    {
      title: "قدوس الله",
      body: "قدوس الله، قدوس القوي، قدوس الحي الذي لا يموت، الذي وُلِد من العذراء، ارحمنا.\nقدوس الله، قدوس القوي، قدوس الحي الذي لا يموت، الذي صُلِب عنا، ارحمنا.\nقدوس الله، قدوس القوي، قدوس الحي الذي لا يموت، الذي قام من الأموات وصعد إلى السماوات، ارحمنا.",
    },
    {
      title: "الذكصولوجية",
      body: "المجد للآب والإبن والروح القدس، الآن وكل أوان وإلى دهر الدهور آمين. يا والدة الإله، أنتِ هي الكرمة الحقيقية الحاملة عنقود الحياة.",
    },
    {
      title: "طلبة الشفاعة",
      body: "اطلبي عنا أيتها السيدة الكل، السيدة والدة الإله، مريم أم مخلصنا، ليصنع معنا رحمة، ويغفر لنا خطايانا.",
    },
    {
      title: "صلاة قبل الإنجيل",
      body: "أيها السيد الرب يسوع المسيح إلهنا، الذي قال لتلاميذه القديسين: إن أنبياء وأبراراً كثيرين اشتهوا أن يروا ما أنتم ترون ولم يروا، اجعلنا مستحقين سماع الإنجيل المقدس وحفظ وصاياك.",
    },
  ];
  const start = seed % all.length;
  return [all[start], all[(start + 1) % all.length], all[(start + 2) % all.length]];
}

function makeOpeningText(prayer: { title: string; clock?: string }): string {
  return [
    `بسم الآب والإبن والروح القدس، الإله الواحد، آمين.`,
    `نسجد للآب والإبن والروح القدس، الثالوث القدوس المساوي في الجوهر، الآن وكل أوان وإلى دهر الدهور. آمين.`,
    `أبانا الذي في السماوات، ليتقدس اسمك، ليأت ملكوتك، لتكن مشيئتك كما في السماء كذلك على الأرض. خبزنا كفافنا أعطنا اليوم، واغفر لنا ذنوبنا كما نغفر نحن أيضاً للمذنبين إلينا، ولا تدخلنا في تجربة لكن نجنا من الشرير.`,
    `صلاة الشكر: فلنشكر صانع الخيرات، الرحوم، الله أبا ربنا وإلهنا ومخلصنا يسوع المسيح، لأنه سترنا وأعاننا، وحفظنا وقبلنا إليه، وأشفق علينا وعضدنا، وأتى بنا إلى هذه الساعة.`,
    `لنطلب من الرب القدير، إله آبائنا، أن يحرسنا في هذا اليوم، وفي ساعة ${prayer.clock ?? "هذه الصلاة"} المباركة، بكل سلام ضابط الكل الرب إلهنا.`,
  ].join("\n\n");
}

function makeInfo(p: { title: string; description?: string; clock?: string; hour?: number; durationMin?: number; psalmsCount?: number; gospelCount?: number }): AgpeyaInfoEntry[] {
  const entries: AgpeyaInfoEntry[] = [];
  if (p.description) entries.push({ label: "المعنى", value: p.description });
  if (p.clock) entries.push({ label: "الوقت", value: p.clock });
  if (typeof p.hour === "number") entries.push({ label: "الساعة الليتورجية", value: `${p.hour}:00` });
  if (p.psalmsCount) entries.push({ label: "عدد المزامير", value: `${p.psalmsCount} مزمور` });
  if (p.gospelCount) entries.push({ label: "عدد القطع الإنجيلية", value: `${p.gospelCount} قطعة` });
  if (p.durationMin) entries.push({ label: "زمن القراءة التقريبي", value: `${p.durationMin} دقيقة` });
  entries.push({ label: "الوضعية الموصى بها", value: "الوقوف باتجاه الشرق مع علامة الصليب" });
  entries.push({ label: "المصدر", value: "الأجبية القبطية الأرثوذكسية (نسخة تجريبية قيد المراجعة)" });
  return entries;
}

function buildTabs(p: {
  title: string;
  description?: string;
  clock?: string;
  hour?: number;
  durationMin?: number;
  psalmsCount?: number;
  gospelCount?: number;
  seed: number;
  includeAll?: boolean;
}): Partial<Record<AgpeyaTabKey, AgpeyaTabContent>> {
  const tabs: Partial<Record<AgpeyaTabKey, AgpeyaTabContent>> = {};
  tabs.text = { body: makeOpeningText(p) };
  if (p.psalmsCount && p.psalmsCount > 0) {
    tabs.psalms = { psalms: makePsalms(p.psalmsCount, p.seed) };
  }
  if (p.gospelCount && p.gospelCount > 0) {
    tabs.gospel = { gospel: makeGospel(p.gospelCount, p.seed) };
  }
  tabs.fragments = { fragments: makeFragments(p.seed) };
  tabs.info = { info: makeInfo(p) };
  return tabs;
}

/* ---------- Catalog ---------- */

interface BaseDef {
  id: string; title: string; subtitle?: string; description?: string;
  hour?: number; clock?: string; durationMin?: number;
  psalmsCount?: number; gospelCount?: number;
  section: AgpeyaPrayer["section"]; accent: NonNullable<AgpeyaPrayer["accent"]>;
}

const BASE: BaseDef[] = [
  // Day
  { id: "baker", title: "صلاة باكر", subtitle: "بداية اليوم بالصلاة والتسبيح", description: "بداية اليوم بالصلاة والتسبيح", hour: 6, clock: "06:00 ص", durationMin: 35, psalmsCount: 12, gospelCount: 3, section: "day", accent: "dawn" },
  { id: "third", title: "صلاة الثالثة", subtitle: "تذكار حلول الروح القدس", description: "تذكار حلول الروح القدس على التلاميذ", hour: 9, clock: "09:00 ص", durationMin: 25, psalmsCount: 12, gospelCount: 1, section: "day", accent: "midmorning" },
  { id: "sixth", title: "صلاة السادسة", subtitle: "تذكار صلب السيد المسيح", description: "تذكار صلب السيد المسيح على الصليب", hour: 12, clock: "12:00 م", durationMin: 25, psalmsCount: 12, gospelCount: 1, section: "day", accent: "noon" },
  { id: "ninth", title: "صلاة التاسعة", subtitle: "تذكار موت السيد المسيح في الجسد", description: "تذكار موت السيد المسيح في الجسد", hour: 15, clock: "03:00 م", durationMin: 22, psalmsCount: 12, gospelCount: 1, section: "day", accent: "evening" },
  { id: "vespers", title: "صلاة الغروب", subtitle: "تذكار إنزال السيد المسيح عن الصليب", description: "تذكار إنزال السيد المسيح عن الصليب", hour: 17, clock: "06:00 م", durationMin: 20, psalmsCount: 12, gospelCount: 1, section: "day", accent: "evening" },
  { id: "compline", title: "صلاة النوم", subtitle: "تذكار دفن السيد المسيح", description: "تذكار دفن السيد المسيح في القبر", hour: 20, clock: "09:00 م", durationMin: 22, psalmsCount: 12, gospelCount: 1, section: "day", accent: "compline" },
  // Night
  { id: "veil", title: "صلاة الستار", subtitle: "صلاة قبل النوم — للرهبان", description: "صلاة الستار للرهبان والمتعبدين", hour: 22, clock: "10:00 م", durationMin: 18, psalmsCount: 6, gospelCount: 1, section: "night", accent: "veil" },
  { id: "midnight-1", title: "نصف الليل الأولى", subtitle: "الخدمة الأولى", description: "الخدمة الأولى من نصف الليل — تذكار مجيء الرب", hour: 0, clock: "12:00 ص", durationMin: 20, psalmsCount: 12, gospelCount: 1, section: "night", accent: "midnight" },
  { id: "midnight-2", title: "نصف الليل الثانية", subtitle: "الخدمة الثانية", description: "الخدمة الثانية من نصف الليل — السهر والصلاة", hour: 2, clock: "02:00 ص", durationMin: 20, psalmsCount: 12, gospelCount: 1, section: "night", accent: "midnight" },
  { id: "midnight-3", title: "نصف الليل الثالثة", subtitle: "الخدمة الثالثة", description: "الخدمة الثالثة من نصف الليل — انتظار المجيء", hour: 4, clock: "04:00 ص", durationMin: 20, psalmsCount: 12, gospelCount: 1, section: "night", accent: "midnight" },
  // Extra
  { id: "misc", title: "صلوات متفرقة", subtitle: "صلوات متنوعة", description: "صلوات متنوعة للمناسبات", section: "extra", accent: "extra" },
  { id: "david-repentance", title: "توبة داود", subtitle: "(المزمور 50)", description: "المزمور الخمسين — صلاة التوبة", psalmsCount: 1, section: "extra", accent: "extra" },
  { id: "thanksgiving", title: "صلاة الشكر", subtitle: "تسبيح وامتنان", description: "تسبيح وامتنان لله صانع الخيرات", section: "extra", accent: "extra" },
  { id: "creed", title: "قانون الإيمان", subtitle: "إيمان الكنيسة", description: "قانون إيمان الكنيسة الجامعة", section: "extra", accent: "extra" },
];

export const AGPEYA_PRAYERS: AgpeyaPrayer[] = BASE.map((d, i) => ({
  ...d,
  tabs: buildTabs({ ...d, seed: i + 1 }),
}));

export function getAgpeyaPrayer(id: string): AgpeyaPrayer | undefined {
  return AGPEYA_PRAYERS.find((p) => p.id === id);
}

export function getAgpeyaBySection(section: AgpeyaPrayer["section"]) {
  return AGPEYA_PRAYERS.filter((p) => p.section === section);
}

/** Pick the prayer closest to the current hour, preferring the most recent past hour. */
export function getCurrentAgpeyaPrayer(now = new Date()): AgpeyaPrayer {
  const h = now.getHours();
  const scheduled = AGPEYA_PRAYERS.filter((p) => p.section === "day" && typeof p.hour === "number");
  let best = scheduled[0];
  let bestDelta = Infinity;
  for (const p of scheduled) {
    const delta = (h - (p.hour ?? 0) + 24) % 24;
    if (delta < bestDelta) {
      bestDelta = delta;
      best = p;
    }
  }
  return best;
}

export function adjacentAgpeyaPrayers(id: string) {
  const i = AGPEYA_PRAYERS.findIndex((p) => p.id === id);
  return {
    prev: i > 0 ? AGPEYA_PRAYERS[i - 1] : undefined,
    next: i >= 0 && i < AGPEYA_PRAYERS.length - 1 ? AGPEYA_PRAYERS[i + 1] : undefined,
  };
}
