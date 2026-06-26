import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { gregorianToCoptic } from "@/lib/coptic-calendar";
import saintAntony from "@/assets/synaxarium/saint-antony.jpg";
import saintShenouda from "@/assets/synaxarium/saint-shenouda.jpg";
import type { RelatedItem, Saint, SaintEvent, TimelinePhase } from "./types";

const IMAGE_BY_KEY: Record<string, string> = {
  shenouda: saintShenouda,
  antony: saintAntony,
};

type CatalogRow = {
  route_id: string;
  name: string;
  title: string;
  feast: string;
  gregorian_date_label: string;
  coptic_date_label: string;
  coptic_month: number | null;
  coptic_day: number | null;
  liturgical_color: string;
  liturgical_color_hex: string;
  summary: string;
  quote: string;
  quote_ref: string;
  repose_date: string;
  repose_place: string;
  service: string;
  commemoration: string;
  bio: string;
  events: SaintEvent[];
  image_key: string;
  saint_type: string | null;
  entity_type: string | null;
  era: string | null;
  service_place: string | null;
  occasion: string | null;
  virtues: string[];
  timeline_phases: TimelinePhase[];
  related_prayers: RelatedItem[];
  related_meditations: RelatedItem[];
  related_events: RelatedItem[];
  similar_saints: RelatedItem[];
  saint_story_url: string | null;
};

type LegacySaintRow = {
  id: string;
  name: string;
  title: string;
  feast: string;
  gregorian_date_label: string;
  coptic_date_label: string;
  liturgical_color: string;
  liturgical_color_hex: string;
  summary: string;
  quote: string;
  quote_ref: string;
  repose_date: string;
  repose_place: string;
  service: string;
  commemoration: string;
  bio: string;
  events: SaintEvent[];
  image_key: string;
  saint_type: string | null;
  era: string | null;
  service_place: string | null;
  occasion: string | null;
  virtues: string[];
  timeline_phases: TimelinePhase[];
  related_prayers: RelatedItem[];
  related_meditations: RelatedItem[];
  related_events: RelatedItem[];
  similar_saints: RelatedItem[];
};

function entityTypeLabel(row: Pick<CatalogRow, "entity_type" | "saint_type">): string | undefined {
  const t = row.saint_type ?? row.entity_type ?? undefined;
  if (!t) return undefined;
  const map: Record<string, string> = {
    patriarch: "بطريرك",
    monk: "راهب",
    saint: "قديس",
    feast: "عيد",
    occasion: "مناسبة",
    council: "مجمع",
  };
  return map[t] ?? t;
}

function mapCatalogRow(row: CatalogRow): Saint {
  return {
    id: row.route_id,
    name: row.name,
    title: row.title || entityTypeLabel(row) || "قديس",
    feast: row.feast,
    gregorianDate: row.gregorian_date_label,
    copticDate: row.coptic_date_label,
    liturgicalColor: row.liturgical_color,
    liturgicalColorHex: row.liturgical_color_hex,
    summary: row.summary || row.commemoration || row.feast,
    quote: row.quote,
    quoteRef: row.quote_ref,
    reposeDate: row.repose_date,
    reposePlace: row.repose_place,
    service: row.service,
    commemoration: row.commemoration,
    bio: row.bio || row.summary,
    events: row.events ?? [],
    image: IMAGE_BY_KEY[row.image_key] ?? saintAntony,
    type: entityTypeLabel(row),
    era: row.era ?? undefined,
    servicePlace: row.service_place ?? undefined,
    occasion: row.occasion ?? undefined,
    virtues: row.virtues ?? [],
    timelinePhases: row.timeline_phases ?? [],
    relatedPrayers: row.related_prayers ?? [],
    relatedMeditations: row.related_meditations ?? [],
    relatedEvents: row.related_events ?? [],
    similarSaints: row.similar_saints ?? [],
  };
}

function mapLegacyRow(row: LegacySaintRow): Saint {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    feast: row.feast,
    gregorianDate: row.gregorian_date_label,
    copticDate: row.coptic_date_label,
    liturgicalColor: row.liturgical_color,
    liturgicalColorHex: row.liturgical_color_hex,
    summary: row.summary,
    quote: row.quote,
    quoteRef: row.quote_ref,
    reposeDate: row.repose_date,
    reposePlace: row.repose_place,
    service: row.service,
    commemoration: row.commemoration,
    bio: row.bio,
    events: row.events ?? [],
    image: IMAGE_BY_KEY[row.image_key] ?? saintAntony,
    type: row.saint_type ?? undefined,
    era: row.era ?? undefined,
    servicePlace: row.service_place ?? undefined,
    occasion: row.occasion ?? undefined,
    virtues: row.virtues ?? [],
    timelinePhases: row.timeline_phases ?? [],
    relatedPrayers: row.related_prayers ?? [],
    relatedMeditations: row.related_meditations ?? [],
    relatedEvents: row.related_events ?? [],
    similarSaints: row.similar_saints ?? [],
  };
}

function dedupeSaints(rows: Saint[]): Saint[] {
  const seen = new Set<string>();
  return rows.filter((s) => {
    const key = s.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchCatalogSaints(): Promise<Saint[]> {
  const { data, error } = await supabase
    .from("synaxarium_catalog_v")
    .select("*")
    .order("name");
  if (error || !data?.length) return [];
  return dedupeSaints((data as CatalogRow[]).map(mapCatalogRow));
}

async function fetchLegacySaints(): Promise<Saint[]> {
  const { data, error } = await supabase
    .from("synaxarium_saints")
    .select("*")
    .order("name");
  if (error || !data?.length) return [];
  return (data as LegacySaintRow[]).map(mapLegacyRow);
}

export async function fetchSynaxariumSaints(): Promise<Saint[]> {
  const catalog = await fetchCatalogSaints();
  if (catalog.length > 0) return catalog;
  return fetchLegacySaints();
}

export async function fetchSynaxariumSaint(id: string): Promise<Saint | null> {
  const { data: fromCatalog, error: catalogErr } = await supabase
    .from("synaxarium_catalog_v")
    .select("*")
    .eq("route_id", id)
    .maybeSingle();
  if (!catalogErr && fromCatalog) {
    return mapCatalogRow(fromCatalog as CatalogRow);
  }

  const { data: legacy, error: legacyErr } = await supabase
    .from("synaxarium_saints")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!legacyErr && legacy) {
    return mapLegacyRow(legacy as LegacySaintRow);
  }

  const saints = await fetchSynaxariumSaints();
  return saints.find((s) => s.id === id) ?? null;
}

/** Today: entries on current coptic month/day from linked catalog. */
export async function fetchTodaySynaxariumSaint(): Promise<Saint | null> {
  let copticMonth: number;
  let copticDay: number;
  try {
    ({ copticMonth, copticDay } = gregorianToCoptic(new Date()));
  } catch {
    const saints = await fetchSynaxariumSaints();
    return saints[0] ?? null;
  }

  const { data, error } = await supabase
    .from("synaxarium_catalog_v")
    .select("*")
    .eq("coptic_month", copticMonth)
    .eq("coptic_day", copticDay)
    .order("entity_type", { ascending: true })
    .limit(50);

  if (!error && data?.length) {
    const rows = data as CatalogRow[];
    const preferred =
      rows.find((r) => r.entity_type === "saint" || r.entity_type === "monk") ?? rows[0];
    return mapCatalogRow(preferred);
  }

  const saints = await fetchSynaxariumSaints();
  return saints[0] ?? null;
}

export const synaxariumSaintsQueryOptions = () =>
  queryOptions({
    queryKey: ["synaxarium", "saints"],
    queryFn: fetchSynaxariumSaints,
    staleTime: 1000 * 60 * 30,
  });

export const synaxariumSaintQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["synaxarium", "saint", id],
    queryFn: () => fetchSynaxariumSaint(id),
    staleTime: 1000 * 60 * 30,
  });

export const todaySynaxariumSaintQueryOptions = () =>
  queryOptions({
    queryKey: ["synaxarium", "today"],
    queryFn: fetchTodaySynaxariumSaint,
    staleTime: 1000 * 60 * 15,
  });

/** Linked occasions for a synaxarium day (feasts / seasons from Katamaros). */
export async function fetchLiturgicalOccasionsForDay(dayId: string) {
  const { data, error } = await supabase
    .from("liturgical_occasions")
    .select("id, title_ar, title_en, occasion_type, katamaros_day_id, synaxarium_day_id")
    .eq("synaxarium_day_id", dayId);
  if (error) return [];
  return data ?? [];
}
