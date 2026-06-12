#!/usr/bin/env node
/**
 * Phase 1 — St-Takla Arabic data extraction (local JSON/CSV only; no Supabase upload).
 *
 * Usage:
 *   node scripts/st-takla-scraper/extract-phase1.mjs
 *   node scripts/st-takla-scraper/extract-phase1.mjs --synaxarium-only
 *   node scripts/st-takla-scraper/extract-phase1.mjs --limit 5   # max 5 URLs attempted per phase
 *   node scripts/st-takla-scraper/extract-phase1.mjs --cache-only
 */

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import monthsConfig from "./config/synaxarium-months.json" with { type: "json" };
import { fetchWithRateLimit } from "./lib/fetch.mjs";
import {
  DEFAULT_COPTIC_YEAR,
  buildKatamarosUrl,
  iterateCopticDays,
  isCopticLeapYear,
} from "./lib/coptic-calendar.mjs";
import {
  parseSynaxariumHtml,
  mergeSaintRecords,
} from "./lib/parse-synaxarium.mjs";
import {
  parseKatamarosHtml,
  flattenKatamarosForExport,
} from "./lib/parse-katamaros.mjs";
import {
  toCsv,
  SYNAXARIUM_DAY_COLUMNS,
  SYNAXARIUM_SAINT_COLUMNS,
  KATAMAROS_DAY_COLUMNS,
  KATAMAROS_READING_COLUMNS,
} from "./lib/csv.mjs";
import { dayId, pad2 } from "./lib/utils.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "output");
const CACHE_DIR = join(OUTPUT_DIR, "cache");

const args = process.argv.slice(2);
const synaxariumOnly = args.includes("--synaxarium-only");
const katamarosOnly = args.includes("--katamaros-only");
const cacheOnly = args.includes("--cache-only");
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : null;
const maxErrIdx = args.indexOf("--max-consecutive-errors");
const maxConsecutiveErrors = maxErrIdx >= 0 ? Number(args[maxErrIdx + 1]) : 5;

const COPTIC_YEAR = monthsConfig.coptic_year || DEFAULT_COPTIC_YEAR;
const lastFetchAt = { t: 0 };
const networkState = { consecutiveErrors: 0 };

const report = {
  started_at: new Date().toISOString(),
  coptic_year: COPTIC_YEAR,
  source: "st-takla.org",
  locale: "ar",
  counts: {
    synaxarium_days: 0,
    synaxarium_saints: 0,
    katamaros_days: 0,
    katamaros_readings: 0,
    reading_types: {},
  },
  errors: [],
  warnings: [],
  output_files: [],
};

function log(msg) {
  console.log(`[extract] ${msg}`);
}

function recordError(scope, url, message, extra = {}) {
  report.errors.push({
    scope,
    url,
    message,
    ...extra,
    at: new Date().toISOString(),
  });
}

function recordWarning(scope, message, extra = {}) {
  report.warnings.push({ scope, message, ...extra, at: new Date().toISOString() });
}

async function loadCachedHtml(url, cacheKey, options) {
  const cachePath = `${CACHE_DIR}/${cacheKey}.html`;
  if (existsSync(cachePath)) {
    const { readFile } = await import("node:fs/promises");
    networkState.consecutiveErrors = 0;
    return { html: await readFile(cachePath, "utf8"), url, fromCache: true };
  }
  if (options.cacheOnly) {
    throw new Error(`Missing cache file: ${cacheKey}.html`);
  }
  try {
    const result = await fetchWithRateLimit(url, { ...options, cacheDir: CACHE_DIR, cacheKey });
    networkState.consecutiveErrors = 0;
    return result;
  } catch (err) {
    if (isNetworkError(err)) {
      networkState.consecutiveErrors += 1;
      if (networkState.consecutiveErrors >= maxConsecutiveErrors) {
        throw new Error(
          `Aborting: ${networkState.consecutiveErrors} consecutive network errors (last: ${err.message})`
        );
      }
    }
    throw err;
  }
}

function isNetworkError(err) {
  const msg = `${err?.message || ""} ${err?.cause?.code || ""}`;
  return /fetch failed|ECONNRESET|ETIMEDOUT|ENOTFOUND|ECONNREFUSED|AbortError/i.test(msg);
}

function synaxariumUrl(month, day) {
  const dd = pad2(day);
  return `${monthsConfig.base_url}/${month.folder}/${dd}-${month.suffix}.html`;
}

function buildSynaxariumPlan() {
  const plan = [];
  for (const month of monthsConfig.months) {
    let days = month.days;
    if (month.coptic_month === 13 && month.extra_days_if_leap && isCopticLeapYear(COPTIC_YEAR)) {
      days += month.extra_days_if_leap;
    }
    for (let day = 1; day <= days; day++) {
      plan.push({
        coptic_year: COPTIC_YEAR,
        coptic_month: month.coptic_month,
        coptic_day: day,
        month,
        url: synaxariumUrl(month, day),
        cacheKey: `syn-${month.coptic_month}-${pad2(day)}`,
      });
    }
    if (month.coptic_month === 13) {
      plan.push({
        coptic_year: COPTIC_YEAR,
        coptic_month: 13,
        coptic_day: 6,
        month,
        url: synaxariumUrl(month, 6),
        cacheKey: `syn-13-06`,
        optional: true,
      });
    }
  }
  return plan;
}

async function extractSynaxarium() {
  const plan = buildSynaxariumPlan();
  const days = [];
  const saints = [];
  let attempted = 0;

  for (const item of plan) {
    if (limit != null && attempted >= limit) break;
    attempted++;

    try {
      const { html } = await loadCachedHtml(item.url, item.cacheKey, {
        lastFetchAt,
        minIntervalMs: 500,
        cacheOnly,
      });

      const parsed = parseSynaxariumHtml(html, {
        coptic_year: item.coptic_year,
        coptic_month: item.coptic_month,
        coptic_day: item.coptic_day,
        source_url: item.url,
        fallback_heading: `${pad2(item.coptic_day)}- اليوم ${item.coptic_day} - شهر ${item.month.name_ar}`,
      });

      days.push(parsed.day);
      saints.push(...parsed.saints);
    } catch (err) {
      if (item.optional) {
        recordWarning("synaxarium", `Optional day skipped: ${err.message}`, { url: item.url });
      } else {
        recordError("synaxarium", item.url, err.message, {
          coptic_month: item.coptic_month,
          coptic_day: item.coptic_day,
        });
      }
      if (/Aborting:/.test(err.message)) break;
    }
  }

  return { days, saints };
}

async function extractKatamaros() {
  const days = [];
  const readings = [];
  const embedSaintsByDay = new Map();
  let attempted = 0;

  for (const coptic of iterateCopticDays(COPTIC_YEAR)) {
    if (limit != null && attempted >= limit) break;
    attempted++;

    const url = buildKatamarosUrl(coptic.coptic_year, coptic.coptic_month, coptic.coptic_day);
    const cacheKey = `kat-${coptic.coptic_month}-${pad2(coptic.coptic_day)}`;

    try {
      const { html } = await loadCachedHtml(url, cacheKey, {
        lastFetchAt,
        minIntervalMs: 700,
        cacheOnly,
      });

      const parsed = parseKatamarosHtml(html, url, coptic);
      if (parsed.validation_warning) {
        recordWarning("katamaros", parsed.validation_warning, { url, ...coptic });
      }

      if (!parsed.id) {
        recordError("katamaros", url, "Could not resolve day id from page", coptic);
        continue;
      }

      const readingCount = (parsed.readings || []).length;
      const { readings: _r, embedSaints, ...dayRecord } = parsed;
      dayRecord.reading_count = readingCount;
      days.push(dayRecord);
      readings.push(...flattenKatamarosForExport(parsed));

      for (const r of parsed.readings || []) {
        report.counts.reading_types[r.reading_type] =
          (report.counts.reading_types[r.reading_type] || 0) + 1;
      }

      if (embedSaints?.length) {
        embedSaintsByDay.set(parsed.id, embedSaints);
      }
    } catch (err) {
      recordError("katamaros", url, err.message, coptic);
      if (/Aborting:/.test(err.message)) break;
    }
  }

  return { days, readings, embedSaintsByDay };
}

function mergeSynaxariumWithKatamaros(staticDays, staticSaints, embedSaintsByDay) {
  const saintsByDay = new Map();
  for (const s of staticSaints) {
    if (!saintsByDay.has(s.day_id)) saintsByDay.set(s.day_id, []);
    saintsByDay.get(s.day_id).push(s);
  }

  const mergedSaints = [...staticSaints];
  const mergedDays = staticDays.map((day) => {
    const embeds = embedSaintsByDay.get(day.id) || [];
    if (embeds.length) {
      day.source.katamaros_embed_ar = embeds[0]?.source_url_ar || null;
    }

    const staticForDay = saintsByDay.get(day.id) || [];
    for (const embed of embeds) {
      const match = staticForDay.find(
        (s) =>
          s.display_order === embed.display_order ||
          s.title_ar.replace(/\s+/g, "") === embed.title_ar.replace(/\s+/g, "")
      );
      if (match) {
        Object.assign(match, mergeSaintRecords(match, embed));
      } else {
        mergedSaints.push(embed);
        day.saints = [...(day.saints || []), embed.id];
      }
    }

    const synReading = embedSaintsByDay.get(day.id);
    if (synReading) {
      // intro merge handled via katamaros phase if needed
    }

    return day;
  });

  return { days: mergedDays, saints: dedupeSaints(mergedSaints) };
}

function dedupeSaints(saints) {
  const map = new Map();
  for (const s of saints) {
    map.set(s.id, s);
  }
  return [...map.values()].sort((a, b) =>
    a.day_id === b.day_id ? a.display_order - b.display_order : a.day_id.localeCompare(b.day_id)
  );
}

async function writeOutputs(name, jsonData, csvRows, csvColumns) {
  const jsonPath = join(OUTPUT_DIR, `${name}.json`);
  const csvPath = join(OUTPUT_DIR, `${name}.csv`);

  await writeFile(jsonPath, JSON.stringify(jsonData, null, 2), "utf8");
  await writeFile(csvPath, toCsv(csvRows, csvColumns), "utf8");

  report.output_files.push(jsonPath, csvPath);
  return { jsonPath, csvPath };
}

function flattenSynaxariumDays(days) {
  return days.map((d) => ({
    id: d.id,
    coptic_year: d.coptic_year,
    coptic_month: d.coptic_month,
    coptic_day: d.coptic_day,
    heading_ar: d.heading_ar,
    intro_ar: d.intro_ar,
    church_reading_suppressed: d.church_reading_suppressed,
    church_reading_note_ar: d.church_reading_note_ar,
    source_url_ar: d.source?.primary_ar,
    saint_count: (d.saints || []).length,
  }));
}

async function writeReportMd() {
  const lines = [
    "# Phase 1 Extraction Report",
    "",
    `Generated: ${report.finished_at || new Date().toISOString()}`,
    `Coptic year: ${COPTIC_YEAR}`,
    "",
    "## Record counts",
    "",
    "| Dataset | Count |",
    "|---------|------:|",
    `| Synaxarium days | ${report.counts.synaxarium_days} |`,
    `| Synaxarium saints | ${report.counts.synaxarium_saints} |`,
    `| Katamaros days | ${report.counts.katamaros_days} |`,
    `| Katamaros readings | ${report.counts.katamaros_readings} |`,
    "",
    "## Reading types (katamaros)",
    "",
    "| reading_type | count |",
    "|--------------|------:|",
    ...Object.entries(report.counts.reading_types)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `| ${k} | ${v} |`),
    "",
    "## Errors",
    "",
    report.errors.length
      ? report.errors
          .slice(0, 100)
          .map((e) => `- **${e.scope}** \`${e.url || ""}\`: ${e.message}`)
          .join("\n")
      : "_None_",
    "",
    report.errors.length > 100 ? `\n_… and ${report.errors.length - 100} more (see extraction-report.json)_` : "",
    "",
    "## Warnings",
    "",
    report.warnings.length
      ? report.warnings.slice(0, 50).map((w) => `- **${w.scope}**: ${w.message}`).join("\n")
      : "_None_",
    "",
    "## Output files",
    "",
    ...report.output_files.map((f) => `- \`${f}\``),
    "",
    "> No data uploaded to Supabase. Review JSON/CSV before import.",
  ];
  const mdPath = join(OUTPUT_DIR, "extraction-report.md");
  await writeFile(mdPath, lines.join("\n"), "utf8");
  report.output_files.push(mdPath);
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(CACHE_DIR, { recursive: true });

  log(`Starting Phase 1 extraction (year ${COPTIC_YEAR})`);

  if (cacheOnly) {
    const cached = existsSync(CACHE_DIR);
    if (!cached) {
      console.error("No cache directory found. Run without --cache-only first.");
      process.exit(1);
    }
    log("Cache-only mode: using cached HTML only");
  }

  let synaxariumDays = [];
  let synaxariumSaints = [];
  let katamarosDays = [];
  let katamarosReadings = [];
  let embedSaintsByDay = new Map();

  if (!katamarosOnly) {
    log("Extracting synaxarium (static Arabic pages)…");
    ({ days: synaxariumDays, saints: synaxariumSaints } = await extractSynaxarium());
    report.counts.synaxarium_days = synaxariumDays.length;
    report.counts.synaxarium_saints = synaxariumSaints.length;
    log(`Synaxarium: ${synaxariumDays.length} days, ${synaxariumSaints.length} saints`);
  }

  if (!synaxariumOnly) {
    log("Extracting katamaros (Arabic readings)…");
    ({ days: katamarosDays, readings: katamarosReadings, embedSaintsByDay } =
      await extractKatamaros());
    report.counts.katamaros_days = katamarosDays.length;
    report.counts.katamaros_readings = katamarosReadings.length;
    log(`Katamaros: ${katamarosDays.length} days, ${katamarosReadings.length} readings`);
  }

  if (!katamarosOnly && !synaxariumOnly && embedSaintsByDay.size) {
    log("Merging synaxarium saints with katamaros embeds…");
    ({ days: synaxariumDays, saints: synaxariumSaints } = mergeSynaxariumWithKatamaros(
      synaxariumDays,
      synaxariumSaints,
      embedSaintsByDay
    ));
    report.counts.synaxarium_saints = synaxariumSaints.length;
  }

  if (!katamarosOnly && synaxariumDays.length) {
    await writeOutputs(
      "synaxarium_days",
      synaxariumDays,
      flattenSynaxariumDays(synaxariumDays),
      SYNAXARIUM_DAY_COLUMNS
    );
    await writeOutputs(
      "synaxarium_saints",
      synaxariumSaints,
      synaxariumSaints,
      SYNAXARIUM_SAINT_COLUMNS
    );
  }

  if (!synaxariumOnly && katamarosDays.length) {
    await writeOutputs(
      "katamaros_days",
      katamarosDays,
      katamarosDays.map((d) => ({
        id: d.id,
        coptic_year: d.coptic_year,
        coptic_month: d.coptic_month,
        coptic_day: d.coptic_day,
        coptic_date_label_ar: d.coptic_date_label_ar,
        gregorian_date_label_ar: d.gregorian_date_label_ar,
        liturgical_day_ar: d.liturgical_day_ar,
        occasion_ar: d.occasion_ar,
        season: d.season,
        source_url: d.source?.url,
        reading_count: d.reading_count ?? null,
      })),
      KATAMAROS_DAY_COLUMNS
    );
    await writeOutputs("katamaros_readings", katamarosReadings, katamarosReadings, KATAMAROS_READING_COLUMNS);
  }

  report.finished_at = new Date().toISOString();
  report.duration_ms = Date.now() - Date.parse(report.started_at);

  const reportPath = join(OUTPUT_DIR, "extraction-report.json");
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");
  report.output_files.push(reportPath);
  await writeReportMd();

  log(`Done. Errors: ${report.errors.length}, warnings: ${report.warnings.length}`);
  log(`Output: ${OUTPUT_DIR}`);

  if (report.errors.length && !synaxariumDays.length && !katamarosDays.length) {
    process.exit(2);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
