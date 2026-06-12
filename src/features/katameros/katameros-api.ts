import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  buildTodayDayIds,
  formatCopticDateLabel,
  formatGregorianDateLabel,
  gregorianToCoptic,
} from "@/lib/coptic-calendar";
import {
  formatKatamerosVersesBody,
  isKatamerosMachineReference,
  katamerosReadingDisplayReference,
  resolveKatamerosReference,
} from "@/lib/katameros-references";
import {
  findKatamerosDayById,
  findKatamerosDayForCopticDate,
} from "./katameros-json-source";
import type { DailyReading, KatamerosDay, RelatedItem, ReadingType } from "./types";

type DayRow = {
  id: string;
  coptic_date_label: string;
  gregorian_date_label: string;
  occasion: string;
  liturgical_day: string;
  accent_hex: string;
  related: RelatedItem[];
};

type ReadingRow = {
  reading_key: string;
  reading_type: ReadingType;
  title: string;
  reference: string;
  source: string;
  estimated_min: number;
  body: string;
  display_order: number;
};

async function resolveReadingBody(reference: string, storedBody: string): Promise<string> {
  if (storedBody.trim()) return storedBody;

  if (!isKatamerosMachineReference(reference)) {
    return storedBody;
  }

  try {
    const resolved = await resolveKatamerosReference(reference);
    return formatKatamerosVersesBody(resolved.verses);
  } catch {
    return storedBody;
  }
}

async function enrichReadings(readings: DailyReading[]): Promise<DailyReading[]> {
  return Promise.all(
    readings.map(async (r) => ({
      ...r,
      body: await resolveReadingBody(r.reference, r.body),
      reference: katamerosReadingDisplayReference(r.reference),
    })),
  );
}

/** Always show live Coptic + Gregorian labels for today's screen. */
function withLiveDates(day: KatamerosDay, when = new Date()): KatamerosDay {
  const { copticMonth, copticDay } = gregorianToCoptic(when);
  return {
    ...day,
    copticDate: formatCopticDateLabel(copticMonth, copticDay),
    gregorianDate: formatGregorianDateLabel(when),
  };
}

async function mapKatamerosDayFromDb(
  day: DayRow,
  readings: ReadingRow[],
): Promise<KatamerosDay> {
  const sorted = [...readings].sort((a, b) => a.display_order - b.display_order);
  const mapped: DailyReading[] = sorted.map((r) => ({
    id: r.reading_key,
    type: r.reading_type,
    title: r.title,
    reference: r.reference,
    source: r.source,
    estimatedMin: r.estimated_min,
    body: r.body ?? "",
  }));

  return {
    id: day.id,
    copticDate: day.coptic_date_label,
    gregorianDate: day.gregorian_date_label,
    occasion: day.occasion,
    liturgicalDay: day.liturgical_day,
    accentHex: day.accent_hex,
    related: day.related ?? [],
    readings: await enrichReadings(mapped),
  };
}

async function fetchDayFromSupabase(dayId: string): Promise<KatamerosDay | null> {
  const { data: day, error: dayError } = await supabase
    .from("katamaros_days")
    .select("*")
    .eq("id", dayId)
    .maybeSingle();

  if (dayError || !day) return null;

  const { data: readings, error: readingsError } = await supabase
    .from("katamaros_readings")
    .select(
      "reading_key, reading_type, title, reference, source, estimated_min, body, display_order",
    )
    .eq("day_id", dayId)
    .order("display_order", { ascending: true });

  if (readingsError) return null;

  const rows = (readings ?? []) as ReadingRow[];
  if (!rows.length) return null;

  return mapKatamerosDayFromDb(day as DayRow, rows);
}

async function fetchDayFromJsonFallback(dayId: string): Promise<KatamerosDay | null> {
  const day = findKatamerosDayById(dayId);
  if (!day) return null;
  return { ...day, readings: await enrichReadings(day.readings) };
}

async function fetchKatamerosDayForDate(when: Date): Promise<KatamerosDay | null> {
  let copticMonth: number;
  let copticDay: number;
  try {
    ({ copticMonth, copticDay } = gregorianToCoptic(when));
  } catch {
    return null;
  }

  const isSunday = when.getDay() === 0;

  for (const dayId of buildTodayDayIds(when)) {
    const fromDb = await fetchDayFromSupabase(dayId);
    if (fromDb) return withLiveDates(fromDb, when);

    const fromJson = await fetchDayFromJsonFallback(dayId);
    if (fromJson) return withLiveDates(fromJson, when);
  }

  const fromCoptic = findKatamerosDayForCopticDate(copticMonth, copticDay, isSunday);
  if (fromCoptic) {
    const enriched = { ...fromCoptic, readings: await enrichReadings(fromCoptic.readings) };
    return withLiveDates(enriched, when);
  }

  return null;
}

async function fetchTodayKatamerosDay(): Promise<KatamerosDay | null> {
  return fetchKatamerosDayForDate(new Date());
}

export async function fetchKatamerosDay(dayId = "today"): Promise<KatamerosDay | null> {
  if (dayId === "today") {
    return fetchTodayKatamerosDay();
  }

  const fromDb = await fetchDayFromSupabase(dayId);
  if (fromDb) return fromDb;

  return fetchDayFromJsonFallback(dayId);
}

function parseIsoDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!year || month < 1 || month > 12 || day < 1) return null;
  return new Date(year, month - 1, day);
}

export function todayIsoDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export const katamerosDayQueryOptions = (dayId = "today") =>
  queryOptions({
    queryKey: ["katamaros", "day", dayId],
    queryFn: () => fetchKatamerosDay(dayId),
    staleTime: 1000 * 60 * 15,
  });

export const katamerosDayQueryOptionsForDate = (isoDate: string) =>
  queryOptions({
    queryKey: ["katamaros", "day", "date", isoDate],
    queryFn: () => {
      const when = parseIsoDate(isoDate) ?? new Date();
      return fetchKatamerosDayForDate(when);
    },
    staleTime: 1000 * 60 * 15,
  });

export { formatCopticDateLabel, formatGregorianDateLabel };
