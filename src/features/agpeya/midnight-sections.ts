/**
 * Midnight Prayer section structure.
 *
 * All three midnight routes share one Supabase prayer_key ("midnight").
 * Rows are filtered by route, grouped into liturgical services, and each
 * service preserves its opening/beginning rows before the first Psalm.
 */

import type { AgpeyaSupabaseSection } from "./use-agpeya-sections";

export interface MidnightDisplayGroup {
  id: string;
  label: string;
  rows: AgpeyaSupabaseSection[];
}

const MIDNIGHT_ROUTE_RE = /^midnight(-[123])?$/;

export function isMidnightRoute(routeId: string): boolean {
  return MIDNIGHT_ROUTE_RE.test(routeId);
}

const SHARED_OPENING_ORDERS = [6, 7] as const;

const ROUTE_BOUNDS: Record<
  "midnight-1" | "midnight-2" | "midnight-3",
  { min: number; max: number; prependSharedOpening: boolean }
> = {
  "midnight-1": { min: 1, max: 41, prependSharedOpening: false },
  "midnight-2": { min: 42, max: 54, prependSharedOpening: true },
  "midnight-3": { min: 55, max: 74, prependSharedOpening: true },
};

function isPsalmRow(title: string): boolean {
  return /مزمور/i.test(title.trim()) && !/إنجيل/i.test(title);
}

function isGospelRow(title: string): boolean {
  return /إنجيل/i.test(title);
}

function resolveMidnightRoute(routeId: string): "midnight-1" | "midnight-2" | "midnight-3" | null {
  if (routeId === "midnight-1" || routeId === "midnight-2" || routeId === "midnight-3") {
    return routeId;
  }
  if (routeId === "midnight") return "midnight-1";
  return null;
}

function sortByDisplayOrder(sections: AgpeyaSupabaseSection[]): AgpeyaSupabaseSection[] {
  return [...sections].sort((a, b) => a.display_order - b.display_order);
}

function rowsInRange(
  sections: AgpeyaSupabaseSection[],
  min: number,
  max: number,
): AgpeyaSupabaseSection[] {
  return sections.filter((s) => s.display_order >= min && s.display_order <= max);
}

function sharedOpeningRows(sections: AgpeyaSupabaseSection[]): AgpeyaSupabaseSection[] {
  return sortByDisplayOrder(
    sections.filter((s) =>
      (SHARED_OPENING_ORDERS as readonly number[]).includes(s.display_order),
    ),
  );
}

function rowsForRoute(
  sections: AgpeyaSupabaseSection[],
  watch: "midnight-1" | "midnight-2" | "midnight-3",
): AgpeyaSupabaseSection[] {
  const { min, max, prependSharedOpening } = ROUTE_BOUNDS[watch];
  const main = rowsInRange(sortByDisplayOrder(sections), min, max);

  if (!prependSharedOpening) return main;

  const opening = sharedOpeningRows(sections);
  const mainIds = new Set(main.map((r) => r.id));
  const prefixed = opening.filter((r) => !mainIds.has(r.id));
  return sortByDisplayOrder([...prefixed, ...main]);
}

function splitBeforeFirstPsalm(rows: AgpeyaSupabaseSection[]): {
  opening: AgpeyaSupabaseSection[];
  body: AgpeyaSupabaseSection[];
} {
  const firstPsalmIdx = rows.findIndex((s) => isPsalmRow(s.title_ar));
  if (firstPsalmIdx === -1) return { opening: [], body: rows };
  if (firstPsalmIdx === 0) return { opening: [], body: rows };
  return {
    opening: rows.slice(0, firstPsalmIdx),
    body: rows.slice(firstPsalmIdx),
  };
}

function pushGroup(
  groups: MidnightDisplayGroup[],
  id: string,
  label: string,
  rows: AgpeyaSupabaseSection[],
): void {
  if (rows.length === 0) return;
  groups.push({ id, label, rows: sortByDisplayOrder(rows) });
}

function buildServiceBodyGroups(
  groups: MidnightDisplayGroup[],
  prefix: string,
  body: AgpeyaSupabaseSection[],
): void {
  let psalmBlock: AgpeyaSupabaseSection[] = [];

  const flushPsalms = () => {
    if (psalmBlock.length === 0) return;
    pushGroup(groups, `${prefix}-psalms`, "المزامير", psalmBlock);
    psalmBlock = [];
  };

  for (const row of body) {
    if (isPsalmRow(row.title_ar)) {
      psalmBlock.push(row);
      continue;
    }

    flushPsalms();

    if (row.title_ar.trim() === "القطع") {
      pushGroup(groups, `${prefix}-fragments`, "القطع", [row]);
    } else if (/قدوس/i.test(row.title_ar)) {
      pushGroup(groups, `${prefix}-trisagion`, row.title_ar, [row]);
    } else if (isGospelRow(row.title_ar)) {
      pushGroup(groups, `${prefix}-gospel`, "الإنجيل", [row]);
    } else if (/قانون الإيمان/i.test(row.title_ar)) {
      pushGroup(groups, `${prefix}-creed`, "قانون الإيمان", [row]);
    } else if (/التحليل/i.test(row.title_ar)) {
      pushGroup(groups, `${prefix}-discharge`, "التحليل", [row]);
    } else if (/طلبة/i.test(row.title_ar)) {
      pushGroup(groups, `${prefix}-closing-prayer`, row.title_ar, [row]);
    } else {
      pushGroup(groups, `${prefix}-section-${row.id}`, row.title_ar, [row]);
    }
  }

  flushPsalms();
}

function buildWatchGroups(
  watch: "midnight-1" | "midnight-2" | "midnight-3",
  routeRows: AgpeyaSupabaseSection[],
): MidnightDisplayGroup[] {
  const groups: MidnightDisplayGroup[] = [];

  if (watch === "midnight-1") {
    pushGroup(groups, "intro", "مقدمة نصف الليل", rowsInRange(routeRows, 1, 3));
    pushGroup(groups, "service-1-opening", "افتتاح الخدمة الأولى", rowsInRange(routeRows, 4, 8));
    buildServiceBodyGroups(groups, "service-1", rowsInRange(routeRows, 9, 41));
    return groups;
  }

  if (watch === "midnight-2") {
    const { opening, body } = splitBeforeFirstPsalm(routeRows);
    pushGroup(groups, "service-2-opening", "افتتاح الخدمة الثانية", opening);
    buildServiceBodyGroups(groups, "service-2", body);
    return groups;
  }

  const { opening, body } = splitBeforeFirstPsalm(routeRows);
  pushGroup(groups, "service-3-opening", "افتتاح الخدمة الثالثة", opening);
  buildServiceBodyGroups(groups, "service-3", body);
  return groups;
}

/**
 * Build grouped midnight sections for a specific route.
 * Returns empty array when route is not a midnight watch.
 */
export function buildMidnightDisplayGroups(
  sections: AgpeyaSupabaseSection[],
  routeId: string,
): MidnightDisplayGroup[] {
  const watch = resolveMidnightRoute(routeId);
  if (!watch) return [];

  const routeRows = rowsForRoute(sections, watch);
  return buildWatchGroups(watch, routeRows);
}

/** Flat midnight rows for a route — used by presentation mode. */
export function flattenMidnightGroups(groups: MidnightDisplayGroup[]): AgpeyaSupabaseSection[] {
  return groups.flatMap((g) => g.rows);
}

export function flattenMidnightRouteSections(
  sections: AgpeyaSupabaseSection[],
  routeId: string,
): AgpeyaSupabaseSection[] {
  return flattenMidnightGroups(buildMidnightDisplayGroups(sections, routeId));
}
