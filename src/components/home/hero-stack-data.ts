import { getTodayFeast, type FeastEvent } from "@/features/feasts";
import type { KatamerosDay } from "@/features/katameros";
import type { Saint } from "@/features/synaxarium";
import { parseVerseReference } from "@/lib/bible-labels";
import artReadings from "@/assets/home/art-readings.jpg";
import artSaint from "@/assets/home/art-saint.jpg";
import artFeast from "@/assets/home/art-feast.jpg";
import type { HeroDailyCardData } from "./HeroDailyCard";

export type HeroCardRoute =
  | { to: "/katameros" }
  | { to: "/bible" }
  | { to: "/synaxarium" }
  | { to: "/synaxarium/$saintId"; params: { saintId: string } }
  | { to: "/feasts/$eventId"; params: { eventId: string } }
  | { to: "/$book/$chapter"; params: { book: string; chapter: string } };

const FEAST_ACCENT_HEX: Record<FeastEvent["accent"], string> = {
  purple: "#6a4ab5",
  gold: "#b8893a",
  green: "#3e7a55",
  blue: "#3a6a9b",
};

export const HERO_CARD_FALLBACKS: Record<1 | 2 | 3, HeroDailyCardData> = {
  1: {
    id: "readings",
    badge: "قراءات",
    title: "قطمارس اليوم",
    subtitle: "قراءات اليوم من القطمارس القبطي",
    image: artReadings,
    accent: "#d8a64f",
    link: { to: "/katameros" },
  },
  2: {
    id: "saint",
    badge: "قديس",
    title: "قديس اليوم",
    subtitle: "سيرة قديس اليوم من السنكسار",
    image: artSaint,
    accent: "#c98a3c",
    link: { to: "/synaxarium" },
  },
  3: {
    id: "feast",
    badge: "مناسبة",
    title: "مناسبة اليوم",
    subtitle: "الأعياد والمناسبات القبطية",
    image: artFeast,
    accent: "#d4a574",
    link: { to: "/feasts/$eventId", params: { eventId: getTodayFeast().id } },
  },
};

export function resolveHeroVerseLink(reference: string, fallback: HeroCardRoute = { to: "/bible" }): HeroCardRoute {
  const parsed = parseVerseReference(reference);
  if (!parsed) return fallback;
  return {
    to: "/$book/$chapter",
    params: { book: parsed.book, chapter: String(parsed.chapter) },
  };
}

export function navigateHeroCard(
  navigate: (opts: { to: string; params?: Record<string, string> }) => void | Promise<void>,
  link: HeroCardRoute,
) {
  if ("params" in link && link.params) {
    void navigate({ to: link.to, params: link.params });
    return;
  }
  void navigate({ to: link.to });
}

function trimSubtitle(text: string, max = 96) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function buildKatamerosHeroCard(day: KatamerosDay | null | undefined): HeroDailyCardData {
  const base = HERO_CARD_FALLBACKS[1];
  if (!day) return base;

  const primary = day.readings.find((r) => r.type === "gospel") ?? day.readings[0];
  const title = day.occasion?.trim() || day.liturgicalDay?.trim() || base.title;
  const subtitle = primary
    ? trimSubtitle(`${primary.title}${primary.reference ? ` · ${primary.reference}` : ""}`)
    : trimSubtitle(`${day.copticDate} · ${day.gregorianDate}`);

  return {
    ...base,
    title,
    subtitle,
    accent: day.accentHex?.trim() || base.accent,
    link: { to: "/katameros" },
  };
}

export function buildSaintHeroCard(saint: Saint | null | undefined): HeroDailyCardData {
  const base = HERO_CARD_FALLBACKS[2];
  if (!saint) return base;

  return {
    ...base,
    title: saint.name,
    subtitle: trimSubtitle(saint.summary || saint.feast || base.subtitle),
    image: saint.image || base.image,
    accent: saint.liturgicalColorHex?.trim() || base.accent,
    link: { to: "/synaxarium/$saintId", params: { saintId: saint.id } },
  };
}

export function buildFeastHeroCard(feast: FeastEvent = getTodayFeast()): HeroDailyCardData {
  const base = HERO_CARD_FALLBACKS[3];

  return {
    ...base,
    title: feast.title,
    subtitle: trimSubtitle(feast.subtitle || feast.description),
    image: feast.image,
    accent: FEAST_ACCENT_HEX[feast.accent] ?? base.accent,
    link: { to: "/feasts/$eventId", params: { eventId: feast.id } },
  };
}

export function buildHeroDailyCards(input: {
  katamerosDay?: KatamerosDay | null;
  todaySaint?: Saint | null;
  todayFeast?: FeastEvent;
}): Record<1 | 2 | 3, HeroDailyCardData> {
  return {
    1: buildKatamerosHeroCard(input.katamerosDay),
    2: buildSaintHeroCard(input.todaySaint),
    3: buildFeastHeroCard(input.todayFeast ?? getTodayFeast()),
  };
}
