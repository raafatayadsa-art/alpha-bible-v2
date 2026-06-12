import annualReadingsJson from "../../../katameros-data/katameros-preparation/data/annual-readings.json";
import sundayReadingsJson from "../../../katameros-data/katameros-preparation/data/sunday-readings.json";
import greatLentReadingsJson from "../../../katameros-data/katameros-preparation/data/great-lent-readings.json";
import pentecostReadingsJson from "../../../katameros-data/katameros-preparation/data/pentecost-readings.json";
import specialReadingsJson from "../../../katameros-data/katameros-preparation/data/special-readings.json";
import {
  formatCopticDateLabel,
  formatGregorianDateLabel,
} from "@/lib/coptic-calendar";
import type { KatamerosDay, ReadingType } from "./types";

type ReadingRecord = Record<string, unknown>;

const REF_FIELDS = [
  "V_Psalm_Ref",
  "V_Gospel_Ref",
  "M_Psalm_Ref",
  "M_Gospel_Ref",
  "P_Gospel_Ref",
  "C_Gospel_Ref",
  "X_Gospel_Ref",
  "L_Psalm_Ref",
  "L_Gospel_Ref",
  "Prophecy",
] as const;

const FIELD_META: Record<
  (typeof REF_FIELDS)[number],
  { reading_key: string; reading_type: ReadingType; title: string; source: string }
> = {
  V_Psalm_Ref: { reading_key: "v_psalm", reading_type: "psalm", title: "مزمور العشية", source: "عشية" },
  V_Gospel_Ref: { reading_key: "v_gospel", reading_type: "gospel", title: "إنجيل العشية", source: "عشية" },
  M_Psalm_Ref: { reading_key: "m_psalm", reading_type: "psalm", title: "مزمور باكر", source: "باكر" },
  M_Gospel_Ref: { reading_key: "m_gospel", reading_type: "gospel", title: "إنجيل باكر", source: "باكر" },
  P_Gospel_Ref: { reading_key: "p_gospel", reading_type: "pauline", title: "البولس", source: "القداس" },
  C_Gospel_Ref: { reading_key: "c_gospel", reading_type: "catholic", title: "الكاثوليكون", source: "القداس" },
  X_Gospel_Ref: { reading_key: "x_gospel", reading_type: "praxis", title: "الإبركسيس", source: "القداس" },
  L_Psalm_Ref: { reading_key: "l_psalm", reading_type: "psalm", title: "مزمور القداس", source: "القداس" },
  L_Gospel_Ref: { reading_key: "l_gospel", reading_type: "gospel", title: "إنجيل القداس", source: "القداس" },
  Prophecy: { reading_key: "prophecy", reading_type: "gospel", title: "النبوة", source: "القداس" },
};

function asRecords(data: unknown): ReadingRecord[] {
  return Array.isArray(data) ? (data as ReadingRecord[]) : [];
}

function cleanText(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildDayId(sourceKey: string, record: ReadingRecord): string {
  if (sourceKey === "annual") return `annual-${record.Month_Number}-${record.Day}`;
  if (sourceKey === "sunday") return `sunday-${record.Month_Number}-${record.Day}`;
  if (sourceKey === "great-lent") return `great-lent-w${record.Week}-d${record.DayOfWeek}`;
  if (sourceKey === "pentecost") {
    const name = cleanText(record.DayName);
    if (name) return `pentecost-${slugify(name)}`;
    return `pentecost-w${record.Week}-d${record.DayOfWeek}`;
  }
  if (sourceKey === "special") {
    const name = cleanText(record.DayName) || `id-${record.Id}`;
    return `special-${slugify(name)}`;
  }
  throw new Error(`Unknown source: ${sourceKey}`);
}

const SOURCES: { key: string; records: ReadingRecord[] }[] = [
  { key: "annual", records: asRecords(annualReadingsJson) },
  { key: "sunday", records: asRecords(sundayReadingsJson) },
  { key: "great-lent", records: asRecords(greatLentReadingsJson) },
  { key: "pentecost", records: asRecords(pentecostReadingsJson) },
  { key: "special", records: asRecords(specialReadingsJson) },
];

function mapRecordToDay(
  sourceKey: string,
  record: ReadingRecord,
  id: string,
  copticMonth: number,
  copticDay: number,
): KatamerosDay {
  let occasion = "";
  let liturgicalDay = "";

  if (sourceKey === "annual" || sourceKey === "sunday") {
    liturgicalDay = cleanText(record.Season);
    occasion = cleanText(record.DayName) || formatCopticDateLabel(copticMonth, copticDay);
  } else if (sourceKey === "great-lent") {
    liturgicalDay = cleanText(record.Seasonal_Tune);
    occasion =
      cleanText(record.DayName) ||
      `Great Lent · Week ${record.Week} · Day ${record.DayOfWeek}`;
  } else if (sourceKey === "pentecost") {
    liturgicalDay = "Pentecost";
    occasion =
      cleanText(record.DayName) ||
      `Pentecost · Week ${record.Week} · Day ${record.DayOfWeek}`;
  } else {
    liturgicalDay = "Special";
    occasion = cleanText(record.DayName) || `Special ${record.Id}`;
  }

  const readings: DailyReading[] = [];
  for (const field of REF_FIELDS) {
    const reference = cleanText(record[field]);
    if (!reference) continue;
    const meta = FIELD_META[field];
    readings.push({
      id: meta.reading_key,
      type: meta.reading_type,
      title: meta.title,
      reference,
      source: meta.source,
      estimatedMin: 3,
      body: "",
    });
  }

  return {
    id,
    copticDate: formatCopticDateLabel(copticMonth, copticDay),
    gregorianDate: formatGregorianDateLabel(),
    occasion,
    liturgicalDay,
    accentHex: "#6a4ab5",
    related: [],
    readings,
  };
}

export function findKatamerosDayById(dayId: string): KatamerosDay | null {
  for (const { key, records } of SOURCES) {
    for (const record of records) {
      if (buildDayId(key, record) !== dayId) continue;
      const month = Number(record.Month_Number ?? 0);
      const day = Number(record.Day ?? record.DayOfWeek ?? 1);
      return mapRecordToDay(key, record, dayId, month || 1, day || 1);
    }
  }
  return null;
}

export function findKatamerosDayForCopticDate(
  copticMonth: number,
  copticDay: number,
  isSunday: boolean,
): KatamerosDay | null {
  if (isSunday) {
    const sunday = SOURCES.find((s) => s.key === "sunday")?.records.find(
      (r) => r.Month_Number === copticMonth && r.Day === copticDay,
    );
    if (sunday) {
      const id = buildDayId("sunday", sunday);
      return mapRecordToDay("sunday", sunday, id, copticMonth, copticDay);
    }
  }

  const annual = SOURCES.find((s) => s.key === "annual")?.records.find(
    (r) => r.Month_Number === copticMonth && r.Day === copticDay,
  );
  if (annual) {
    const id = buildDayId("annual", annual);
    return mapRecordToDay("annual", annual, id, copticMonth, copticDay);
  }

  return null;
}
