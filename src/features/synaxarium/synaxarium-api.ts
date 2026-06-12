import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import saintAntony from "@/assets/synaxarium/saint-antony.jpg";
import saintShenouda from "@/assets/synaxarium/saint-shenouda.jpg";
import type { RelatedItem, Saint, SaintEvent, TimelinePhase } from "./types";

const IMAGE_BY_KEY: Record<string, string> = {
  shenouda: saintShenouda,
  antony: saintAntony,
};

type SaintRow = {
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

function mapSaintRow(row: SaintRow): Saint {
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

export async function fetchSynaxariumSaints(): Promise<Saint[]> {
  const { data, error } = await supabase
    .from("synaxarium_saints")
    .select("*")
    .order("name");
  if (error || !data?.length) return [];
  return (data as SaintRow[]).map(mapSaintRow);
}

export async function fetchSynaxariumSaint(id: string): Promise<Saint | null> {
  const { data, error } = await supabase
    .from("synaxarium_saints")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapSaintRow(data as SaintRow);
}

export async function fetchTodaySynaxariumSaint(): Promise<Saint | null> {
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
