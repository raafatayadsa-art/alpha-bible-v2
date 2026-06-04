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
  { id: "baker", title: "صلاة باكر", subtitle: "الساعة الأولى من النهار", hour: 6, section: "day", accent: "dawn", tabs: emptyTabs() },
  { id: "third", title: "الثالثة", subtitle: "الساعة الثالثة من النهار", hour: 9, section: "day", accent: "dawn", tabs: emptyTabs() },
  { id: "sixth", title: "السادسة", subtitle: "الساعة السادسة من النهار", hour: 12, section: "day", accent: "noon", tabs: emptyTabs() },
  { id: "ninth", title: "التاسعة", subtitle: "الساعة التاسعة من النهار", hour: 15, section: "day", accent: "noon", tabs: emptyTabs() },
  { id: "vespers", title: "الغروب", subtitle: "الساعة الحادية عشرة", hour: 17, section: "day", accent: "evening", tabs: emptyTabs() },
  { id: "compline", title: "النوم", subtitle: "الساعة الثانية عشرة", hour: 20, section: "day", accent: "evening", tabs: emptyTabs() },

  // ===== Night =====
  { id: "veil", title: "الستار", subtitle: "صلاة الستار", hour: 21, section: "night", accent: "night", tabs: emptyTabs() },
  { id: "midnight-1", title: "نصف الليل الأولى", subtitle: "الخدمة الأولى", hour: 0, section: "night", accent: "night", tabs: emptyTabs() },
  { id: "midnight-2", title: "نصف الليل الثانية", subtitle: "الخدمة الثانية", hour: 1, section: "night", accent: "night", tabs: emptyTabs() },
  { id: "midnight-3", title: "نصف الليل الثالثة", subtitle: "الخدمة الثالثة", hour: 2, section: "night", accent: "night", tabs: emptyTabs() },

  // ===== Extra =====
  { id: "misc", title: "صلوات متفرقة", section: "extra", accent: "extra", tabs: { text: { body: PLACEHOLDER }, info: { body: PLACEHOLDER } } },
  { id: "david-repentance", title: "توبة داود", subtitle: "المزمور الخمسين", section: "extra", accent: "extra", tabs: { text: { body: PLACEHOLDER }, psalms: { body: PLACEHOLDER }, info: { body: PLACEHOLDER } } },
  { id: "thanksgiving", title: "صلاة الشكر", section: "extra", accent: "extra", tabs: { text: { body: PLACEHOLDER }, info: { body: PLACEHOLDER } } },
  { id: "creed", title: "قانون الإيمان", section: "extra", accent: "extra", tabs: { text: { body: PLACEHOLDER }, info: { body: PLACEHOLDER } } },
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
