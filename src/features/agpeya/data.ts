import type { AgpeyaPrayer, AgpeyaTabKey } from "./types";

/**
 * Agpeya prayer catalog.
 *
 * Content bodies are intentionally left as a verified-source placeholder
 * until the official Agpeya text is loaded from a trusted backend/source.
 * Do NOT invent liturgical text here.
 */
const PLACEHOLDER = "المحتوى الكامل لهذه الصلاة قيد الإعداد من مصادر معتمدة (الأجبية القبطية).";

function emptyTabs(): AgpeyaPrayer["tabs"] {
  const tabs: Partial<Record<AgpeyaTabKey, { body?: string }>> = {
    text: { body: PLACEHOLDER },
    psalms: { body: PLACEHOLDER },
    gospel: { body: PLACEHOLDER },
    fragments: { body: PLACEHOLDER },
    info: { body: PLACEHOLDER },
  };
  return tabs;
}

export const AGPEYA_PRAYERS: AgpeyaPrayer[] = [
  // ===== Day =====
  { id: "baker", title: "صلاة باكر", subtitle: "بداية اليوم بالصلاة والتسبيح", description: "بداية اليوم بالصلاة والتسبيح", hour: 6, clock: "06:00 ص", durationMin: 35, psalmsCount: 12, gospelCount: 3, section: "day", accent: "dawn", tabs: emptyTabs() },
  { id: "third", title: "صلاة الثالثة", subtitle: "تذكار حلول الروح القدس", description: "تذكار حلول الروح القدس", hour: 9, clock: "09:00 ص", durationMin: 25, psalmsCount: 12, gospelCount: 1, section: "day", accent: "midmorning", tabs: emptyTabs() },
  { id: "sixth", title: "صلاة السادسة", subtitle: "تذكار صلب السيد المسيح", description: "تذكار صلب السيد المسيح", hour: 12, clock: "12:00 م", durationMin: 25, psalmsCount: 12, gospelCount: 1, section: "day", accent: "noon", tabs: emptyTabs() },
  { id: "ninth", title: "صلاة التاسعة", subtitle: "تذكار موت السيد المسيح في الجسد", description: "تذكار موت السيد المسيح في الجسد", hour: 15, clock: "03:00 م", durationMin: 22, psalmsCount: 12, gospelCount: 1, section: "day", accent: "evening", tabs: emptyTabs() },
  { id: "vespers", title: "صلاة الغروب", subtitle: "تذكار إنزال السيد المسيح عن الصليب", description: "تذكار إنزال السيد المسيح عن الصليب", hour: 17, clock: "06:00 م", durationMin: 20, psalmsCount: 12, gospelCount: 1, section: "day", accent: "evening", tabs: emptyTabs() },
  { id: "compline", title: "صلاة النوم", subtitle: "تذكار دفن السيد المسيح", description: "تذكار دفن السيد المسيح", hour: 20, clock: "09:00 م", durationMin: 22, psalmsCount: 12, gospelCount: 1, section: "day", accent: "compline", tabs: emptyTabs() },

  // ===== Night =====
  { id: "veil", title: "صلاة الستار", subtitle: "صلاة قبل النوم — للرهبان", description: "صلاة الستار للرهبان والمتعبدين", hour: 22, clock: "10:00 م", durationMin: 18, psalmsCount: 6, gospelCount: 1, section: "night", accent: "veil", tabs: emptyTabs() },
  { id: "midnight-1", title: "نصف الليل الأولى", subtitle: "الخدمة الأولى", description: "الخدمة الأولى من نصف الليل", hour: 0, clock: "12:00 ص", durationMin: 20, psalmsCount: 12, gospelCount: 1, section: "night", accent: "midnight", tabs: emptyTabs() },
  { id: "midnight-2", title: "نصف الليل الثانية", subtitle: "الخدمة الثانية", description: "الخدمة الثانية من نصف الليل", hour: 2, clock: "02:00 ص", durationMin: 20, psalmsCount: 12, gospelCount: 1, section: "night", accent: "midnight", tabs: emptyTabs() },
  { id: "midnight-3", title: "نصف الليل الثالثة", subtitle: "الخدمة الثالثة", description: "الخدمة الثالثة من نصف الليل", hour: 4, clock: "04:00 ص", durationMin: 20, psalmsCount: 12, gospelCount: 1, section: "night", accent: "midnight", tabs: emptyTabs() },

  // ===== Extra =====
  { id: "misc", title: "صلوات متفرقة", subtitle: "صلوات متنوعة", description: "صلوات متنوعة", section: "extra", accent: "extra", tabs: { text: { body: PLACEHOLDER }, info: { body: PLACEHOLDER } } },
  { id: "david-repentance", title: "توبة داود", subtitle: "(المزمور 50)", description: "المزمور الخمسين", section: "extra", accent: "extra", tabs: { text: { body: PLACEHOLDER }, psalms: { body: PLACEHOLDER }, info: { body: PLACEHOLDER } } },
  { id: "thanksgiving", title: "صلاة الشكر", subtitle: "تسبيح وامتنان", description: "تسبيح وامتنان", section: "extra", accent: "extra", tabs: { text: { body: PLACEHOLDER }, info: { body: PLACEHOLDER } } },
  { id: "creed", title: "قانون الإيمان", subtitle: "إيمان الكنيسة", description: "إيمان الكنيسة", section: "extra", accent: "extra", tabs: { text: { body: PLACEHOLDER }, info: { body: PLACEHOLDER } } },
];

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
