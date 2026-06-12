/**
 * One-time import: Katameros JSON readings → katamaros_days + katamaros_readings
 *
 * Usage (service role required):
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-katamaros-readings.mjs
 *
 * Optional:
 *   SUPABASE_URL=https://....supabase.co
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "katameros-data/katameros-preparation/data");

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? "https://usflbjlyadihyitnvzya.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BATCH_SIZE = 200;

const SOURCES = [
  { file: "annual-readings.json", key: "annual" },
  { file: "sunday-readings.json", key: "sunday" },
  { file: "great-lent-readings.json", key: "great-lent" },
  { file: "pentecost-readings.json", key: "pentecost" },
  { file: "special-readings.json", key: "special" },
];

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
];

/** Maps JSON ref field → katamaros_readings row metadata */
const FIELD_META = {
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

function loadEnvFiles() {
  for (const name of [".env.local", ".env"]) {
    const envPath = path.join(ROOT, name);
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const DEFAULT_COPTIC_YEAR = 1742;

const COPTIC_MONTH_AR = [
  "",
  "توت",
  "بابه",
  "هاتور",
  "كيهك",
  "طوبه",
  "أمشير",
  "برمهات",
  "برموده",
  "بشنس",
  "بؤونه",
  "أبيب",
  "مسرى",
  "نسئ",
];

function formatCopticDateLabel(month, day, year = DEFAULT_COPTIC_YEAR) {
  const name = COPTIC_MONTH_AR[month] ?? String(month);
  return `${day} ${name} ${year}`;
}

  if (value == null) return "";
  return String(value).trim();
}

function buildDayId(sourceKey, record) {
  if (sourceKey === "annual") {
    return `annual-${record.Month_Number}-${record.Day}`;
  }
  if (sourceKey === "sunday") {
    return `sunday-${record.Month_Number}-${record.Day}`;
  }
  if (sourceKey === "great-lent") {
    return `great-lent-w${record.Week}-d${record.DayOfWeek}`;
  }
  if (sourceKey === "pentecost") {
    const name = cleanText(record.DayName);
    if (name) return `pentecost-${slugify(name)}`;
    return `pentecost-w${record.Week}-d${record.DayOfWeek}`;
  }
  if (sourceKey === "special") {
    const name = cleanText(record.DayName) || `id-${record.Id}`;
    return `special-${slugify(name)}`;
  }
  throw new Error(`Unknown source key: ${sourceKey}`);
}

/**
 * User mapping → production katamaros_days columns:
 * - season  → liturgical_day
 * - title   → coptic_date_label
 * - occasion, coptic_month, coptic_day unchanged
 */
function mapDayRow(sourceKey, record) {
  const id = buildDayId(sourceKey, record);

  let season = "";
  let title = "";
  let occasion = "";
  let copticMonth = null;
  let copticDay = null;

  if (sourceKey === "annual" || sourceKey === "sunday") {
    copticMonth = record.Month_Number ?? null;
    copticDay = record.Day ?? null;
    season = cleanText(record.Season);
    occasion = cleanText(record.DayName) || formatCopticDateLabel(copticMonth, copticDay);
    title = occasion;
  } else if (sourceKey === "great-lent") {
    season = cleanText(record.Seasonal_Tune);
    occasion =
      cleanText(record.DayName) ||
      `Great Lent · Week ${record.Week} · Day ${record.DayOfWeek}`;
    title = occasion;
  } else if (sourceKey === "pentecost") {
    season = "Pentecost";
    occasion =
      cleanText(record.DayName) ||
      `Pentecost · Week ${record.Week} · Day ${record.DayOfWeek}`;
    title = occasion;
  } else if (sourceKey === "special") {
    season = "Special";
    occasion = cleanText(record.DayName) || `Special ${record.Id}`;
    title = occasion;
  }

  const dateLabel = title || id;

  return {
    id,
    coptic_date_label: dateLabel,
    gregorian_date_label: dateLabel,
    coptic_month: copticMonth,
    coptic_day: copticDay,
    occasion,
    liturgical_day: season,
    accent_hex: "#6a4ab5",
    related: [],
  };
}

function mapReadingRows(dayId, record) {
  const rows = [];
  let order = 1;

  for (const field of REF_FIELDS) {
    const reference = cleanText(record[field]);
    if (!reference) continue;

    const meta = FIELD_META[field];
    rows.push({
      day_id: dayId,
      reading_key: meta.reading_key,
      reading_type: meta.reading_type,
      title: meta.title,
      reference,
      source: meta.source,
      estimated_min: 3,
      body: "",
      display_order: order,
    });
    order++;
  }

  return rows;
}

function loadSourceRecords(source) {
  const filePath = path.join(DATA_DIR, source.file);
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(raw)) {
    throw new Error(`${source.file} is not a JSON array`);
  }
  return raw;
}

async function upsertBatched(supabase, table, rows, onConflict) {
  let upserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from(table).upsert(batch, { onConflict });
    if (error) throw error;
    upserted += batch.length;
  }
  return upserted;
}

async function main() {
  loadEnvFiles();

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Set it in the environment or .env.local",
    );
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const dayById = new Map();
  const readings = [];
  const failedRows = [];

  console.log("Katamaros import — reading JSON sources…\n");

  for (const source of SOURCES) {
    let records;
    try {
      records = loadSourceRecords(source);
    } catch (err) {
      failedRows.push({
        source: source.key,
        reason: `Failed to load ${source.file}: ${err.message}`,
      });
      continue;
    }

    for (const record of records) {
      try {
        const day = mapDayRow(source.key, record);
        dayById.set(day.id, day);
        readings.push(...mapReadingRows(day.id, record));
      } catch (err) {
        failedRows.push({
          source: source.key,
          recordId: record.Id ?? null,
          reason: err.message,
        });
      }
    }
  }

  const days = [...dayById.values()];
  console.log(`Prepared ${days.length} days, ${readings.length} readings`);

  let importedDays = 0;
  let importedReadings = 0;

  try {
    importedDays = await upsertBatched(supabase, "katamaros_days", days, "id");
    console.log(`Upserted katamaros_days: ${importedDays}`);
  } catch (err) {
    failedRows.push({ table: "katamaros_days", reason: err.message });
    console.error("katamaros_days upsert failed:", err.message);
  }

  try {
    importedReadings = await upsertBatched(
      supabase,
      "katamaros_readings",
      readings,
      "day_id,reading_key",
    );
    console.log(`Upserted katamaros_readings: ${importedReadings}`);
  } catch (err) {
    failedRows.push({ table: "katamaros_readings", reason: err.message });
    console.error("katamaros_readings upsert failed:", err.message);
  }

  const { count: dayCount, error: dayCountError } = await supabase
    .from("katamaros_days")
    .select("id", { count: "exact", head: true });

  const { count: readingCount, error: readingCountError } = await supabase
    .from("katamaros_readings")
    .select("id", { count: "exact", head: true });

  console.log("\n=== IMPORT SUMMARY ===");
  console.log(`Total imported days (upserted): ${importedDays}`);
  console.log(`Total imported readings (upserted): ${importedReadings}`);

  if (failedRows.length) {
    console.log(`\nFailed rows: ${failedRows.length}`);
    for (const row of failedRows) {
      console.log(JSON.stringify(row));
    }
  } else {
    console.log("\nFailed rows: 0");
  }

  console.log("\n=== VALIDATION COUNTS ===");
  if (dayCountError) {
    console.log(`katamaros_days count error: ${dayCountError.message}`);
  } else {
    console.log(`katamaros_days total in database: ${dayCount ?? 0}`);
  }
  if (readingCountError) {
    console.log(`katamaros_readings count error: ${readingCountError.message}`);
  } else {
    console.log(`katamaros_readings total in database: ${readingCount ?? 0}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
