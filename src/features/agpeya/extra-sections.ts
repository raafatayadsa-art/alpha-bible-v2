/**
 * Extra Agpeya prayers (green bottom tabs).
 *
 * When no dedicated agpeya_prayers row exists, resolve ONE canonical section
 * from Supabase — never aggregate duplicate copies from every hour.
 */

import { supabase } from "@/integrations/supabase/client";
import type { AgpeyaSupabaseSection } from "./use-agpeya-sections";

export const EXTRA_PRAYER_ROUTE_IDS = [
  "misc",
  "david-repentance",
  "thanksgiving",
  "creed",
] as const;

export type ExtraPrayerRouteId = (typeof EXTRA_PRAYER_ROUTE_IDS)[number];

/** Route id → Supabase prayer_key when a dedicated row exists */
const EXTRA_PRAYER_KEY_ALIASES: Record<ExtraPrayerRouteId, string[]> = {
  misc: ["misc", "misc_prayers", "other_prayers"],
  "david-repentance": ["david_repentance", "david-repentance", "david"],
  thanksgiving: ["thanksgiving", "thanksgiving_prayer"],
  creed: ["creed", "creed_prayer"],
};

export function isExtraPrayerRoute(routeId: string): routeId is ExtraPrayerRouteId {
  return (EXTRA_PRAYER_ROUTE_IDS as readonly string[]).includes(routeId);
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function sectionDedupeKey(section: AgpeyaSupabaseSection): string {
  return `${normalizeText(section.title_ar)}::${normalizeText(section.content_ar)}`;
}

async function resolveDedicatedPrayerUuid(
  routeId: ExtraPrayerRouteId,
): Promise<string | null> {
  for (const key of EXTRA_PRAYER_KEY_ALIASES[routeId]) {
    const { data, error } = await supabase
      .from("agpeya_prayers")
      .select("id")
      .eq("prayer_key", key)
      .maybeSingle();
    if (error) throw error;
    if (data?.id) return data.id;
  }
  return null;
}

async function loadPrayerOrderMap(): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from("agpeya_prayers")
    .select("id, display_order")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return new Map((data ?? []).map((p) => [p.id, p.display_order ?? 0]));
}

function sortByCanonicalSource(
  sections: AgpeyaSupabaseSection[],
  prayerOrder: Map<string, number>,
): AgpeyaSupabaseSection[] {
  return [...sections].sort((a, b) => {
    const pa = prayerOrder.get(a.prayer_id) ?? 999;
    const pb = prayerOrder.get(b.prayer_id) ?? 999;
    if (pa !== pb) return pa - pb;
    return a.display_order - b.display_order;
  });
}

/** Keep first occurrence per normalized title + content pair. */
function dedupeSections(sections: AgpeyaSupabaseSection[]): AgpeyaSupabaseSection[] {
  const seen = new Set<string>();
  const out: AgpeyaSupabaseSection[] = [];
  for (const section of sections) {
    const key = sectionDedupeKey(section);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(section);
  }
  return out;
}

/** First canonical source only — one unique section after dedupe. */
function pickFirstCanonicalSection(
  sections: AgpeyaSupabaseSection[],
  prayerOrder: Map<string, number>,
): AgpeyaSupabaseSection[] {
  const canonical = dedupeSections(sortByCanonicalSource(sections, prayerOrder));
  return canonical.length > 0 ? [canonical[0]] : [];
}

async function fetchDedicatedSections(
  prayerUuid: string,
): Promise<AgpeyaSupabaseSection[]> {
  const { data, error } = await supabase
    .from("agpeya_sections")
    .select("id, prayer_id, title_ar, content_ar, display_order")
    .eq("prayer_id", prayerUuid)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as AgpeyaSupabaseSection[];
}

async function fetchThanksgivingSections(): Promise<AgpeyaSupabaseSection[]> {
  const prayerOrder = await loadPrayerOrderMap();
  const { data, error } = await supabase
    .from("agpeya_sections")
    .select("id, prayer_id, title_ar, content_ar, display_order")
    .eq("title_ar", "صلاة الشكر");
  if (error) throw error;
  return pickFirstCanonicalSection((data ?? []) as AgpeyaSupabaseSection[], prayerOrder);
}

async function fetchCreedSections(): Promise<AgpeyaSupabaseSection[]> {
  const prayerOrder = await loadPrayerOrderMap();
  const { data, error } = await supabase
    .from("agpeya_sections")
    .select("id, prayer_id, title_ar, content_ar, display_order")
    .ilike("title_ar", "%قانون الإيمان%");
  if (error) throw error;

  const sorted = sortByCanonicalSource((data ?? []) as AgpeyaSupabaseSection[], prayerOrder);
  const deduped = dedupeSections(sorted);

  const fullCreed = deduped.find((s) =>
    /قانون الإيمان المقدس|الأرثوذكسي/i.test(s.title_ar),
  );
  const chosen = fullCreed ?? deduped.find((s) => !/^بدء\s/i.test(s.title_ar.trim())) ?? deduped[0];

  return chosen ? [chosen] : [];
}

async function fetchDavidRepentanceSections(): Promise<AgpeyaSupabaseSection[]> {
  const prayerOrder = await loadPrayerOrderMap();
  const { data, error } = await supabase
    .from("agpeya_sections")
    .select("id, prayer_id, title_ar, content_ar, display_order")
    .eq("title_ar", "المزمور الخمسون");
  if (error) throw error;
  return pickFirstCanonicalSection((data ?? []) as AgpeyaSupabaseSection[], prayerOrder);
}

async function fetchMiscSections(): Promise<AgpeyaSupabaseSection[]> {
  const prayerOrder = await loadPrayerOrderMap();
  const { data, error } = await supabase
    .from("agpeya_sections")
    .select("id, prayer_id, title_ar, content_ar, display_order")
    .or("title_ar.ilike.%صلوات متفرقة%,title_ar.ilike.%متفرقة%");
  if (error) throw error;
  return pickFirstCanonicalSection((data ?? []) as AgpeyaSupabaseSection[], prayerOrder);
}

export async function fetchExtraPrayerSections(routeId: ExtraPrayerRouteId): Promise<{
  currentPrayerKey: string;
  resolvedUUID: string | null;
  sections: AgpeyaSupabaseSection[];
  error: string | null;
}> {
  try {
    const dedicatedUuid = await resolveDedicatedPrayerUuid(routeId);
    if (dedicatedUuid) {
      const sections = await fetchDedicatedSections(dedicatedUuid);
      return {
        currentPrayerKey: routeId,
        resolvedUUID: dedicatedUuid,
        sections,
        error: null,
      };
    }

    let sections: AgpeyaSupabaseSection[] = [];
    switch (routeId) {
      case "thanksgiving":
        sections = await fetchThanksgivingSections();
        break;
      case "creed":
        sections = await fetchCreedSections();
        break;
      case "david-repentance":
        sections = await fetchDavidRepentanceSections();
        break;
      case "misc":
        sections = await fetchMiscSections();
        break;
    }

    return {
      currentPrayerKey: routeId,
      resolvedUUID: dedicatedUuid,
      sections,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { currentPrayerKey: routeId, resolvedUUID: null, sections: [], error: message };
  }
}
