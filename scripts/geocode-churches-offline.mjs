/**
 * Church geocoding WITHOUT Supabase keys.
 *
 * 1) Supabase Dashboard → SQL Editor → run scripts/sql/export-churches-missing-coords.sql
 * 2) Copy the JSON result → save as reports/churches-to-geocode.json
 * 3) Run:
 *      node scripts/geocode-churches-offline.mjs --limit 5
 * 4) Supabase Dashboard → SQL Editor → paste reports/geocode-updates.sql → Run
 *
 * Requires only GOOGLE_MAPS_API_KEY in .env.local
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  geocodeChurch,
  timestampReportName,
} from "./lib/church-geocoding.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const REPORTS_DIR = path.join(ROOT, "reports");
const DEFAULT_INPUT = path.join(REPORTS_DIR, "churches-to-geocode.json");
const DEFAULT_SQL_OUT = path.join(REPORTS_DIR, "geocode-updates.sql");

function readEnvText(envPath) {
  const buf = fs.readFileSync(envPath);
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.toString("utf16le");
  }
  let text = buf.toString("utf8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  return text;
}

function loadEnvFiles() {
  for (const name of [".env.local", ".env"]) {
    const envPath = path.join(ROOT, name);
    if (!fs.existsSync(envPath)) continue;
    for (const line of readEnvText(envPath).split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim().replace(/^\uFEFF/, "");
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (name === ".env.local") {
        process.env[key] = value;
      } else if (!process.env[key]?.trim()) {
        process.env[key] = value;
      }
    }
  }
}

function parseArgs(argv) {
  const args = {
    input: DEFAULT_INPUT,
    outputSql: DEFAULT_SQL_OUT,
    limit: Infinity,
    delayMs: 200,
    includeReview: false,
    googleKey: null,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--input") args.input = path.resolve(argv[++i] ?? DEFAULT_INPUT);
    else if (arg === "--output-sql") args.outputSql = path.resolve(argv[++i] ?? DEFAULT_SQL_OUT);
    else if (arg === "--limit") args.limit = Number(argv[++i] ?? "0");
    else if (arg === "--delay-ms") args.delayMs = Number(argv[++i] ?? "200");
    else if (arg === "--include-review") args.includeReview = true;
    else if (arg === "--google-key") args.googleKey = String(argv[++i] ?? "").trim();
    else if (arg === "--help" || arg === "-h") {
      console.log(fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(0, 12).join("\n"));
      process.exit(0);
    }
  }

  return args;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const cols = line.match(/("([^"]|"")*"|[^,]+)/g) ?? [];
    const row = {};
    headers.forEach((header, idx) => {
      let value = (cols[idx] ?? "").trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/""/g, '"');
      }
      row[header] = value;
    });
    return row;
  });
}

function loadChurches(inputPath) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const raw = fs.readFileSync(inputPath, "utf8").trim();
  if (inputPath.toLowerCase().endsWith(".csv")) {
    return parseCsv(raw);
  }

  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.churches)) return parsed.churches;
  if (Array.isArray(parsed.churches_to_geocode)) return parsed.churches_to_geocode;
  if (Array.isArray(parsed.data)) return parsed.data;
  const firstArray = Object.values(parsed).find((v) => Array.isArray(v));
  if (firstArray) return firstArray;
  throw new Error("JSON must be an array of churches or { churches: [...] }");
}

function sqlEscape(value) {
  return String(value ?? "").replace(/'/g, "''");
}

function buildUpdateSql(churchId, lat, lng) {
  return [
    "UPDATE public.churches",
    `SET latitude = ${Number(lat).toFixed(7)}, longitude = ${Number(lng).toFixed(7)}`,
    `WHERE id = ${Number(churchId)}`,
    "  AND (latitude IS NULL OR longitude IS NULL);",
  ].join("\n");
}

function writeReport(reportBase, payload) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const jsonPath = path.join(REPORTS_DIR, `${reportBase}.json`);
  const mdPath = path.join(REPORTS_DIR, `${reportBase}.md`);
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2));

  const { summary, successes, failures, manualReviews } = payload;
  const md = `# Church Geocoding Offline Report

**Date:** ${payload.startedAt}
**Mode:** offline-sql (no Supabase key on machine)

---

## Executive Summary

Generated SQL updates for churches missing coordinates using Google Places API.

| Metric | Count |
|--------|------:|
| Processed | ${summary.processed} |
| Success | ${summary.success} |
| Failed | ${summary.failed} |
| Manual review | ${summary.manualReview} |
| SQL updates written | ${summary.sqlStatements} |

---

## Findings

- Input: \`${payload.input}\`
- SQL output: \`${payload.outputSql}\`
- Paste SQL file into Supabase Dashboard → SQL Editor → Run

---

## Warnings

${summary.manualReview > 0 ? `- ${summary.manualReview} churches need manual review before applying SQL.` : "- None"}

---

## Errors

${failures.length ? failures.slice(0, 20).map((f) => `- #${f.churchId} ${f.churchName}: ${f.reason}`).join("\n") : "None."}

---

## Recommendations

1. Review \`${path.basename(payload.outputSql)}\` before running in Supabase.
2. Run a small batch first (\`--limit 5\`), apply SQL, verify on map.
3. Re-export JSON and rerun for remaining churches.

---

## Overall Status

${summary.failed === 0 ? "**PASS**" : summary.success > 0 ? "**PARTIAL**" : "**FAIL**"}
`;

  fs.writeFileSync(mdPath, md);
  return { jsonPath, mdPath };
}

async function main() {
  loadEnvFiles();
  const args = parseArgs(process.argv);
  const googleApiKey = args.googleKey || process.env.GOOGLE_MAPS_API_KEY;

  if (!googleApiKey?.trim()) {
    const envLocalPath = path.join(ROOT, ".env.local");
    console.error("Missing GOOGLE_MAPS_API_KEY in .env.local");
    console.error(`Checked: ${envLocalPath} (${fs.existsSync(envLocalPath) ? "found" : "not found"})`);
    console.error('Add: GOOGLE_MAPS_API_KEY=your_google_key');
    console.error('Or run: node scripts/geocode-churches-offline.mjs --google-key "AIzaSy..."');
    process.exit(1);
  }

  let churches;
  try {
    churches = loadChurches(args.input);
  } catch (error) {
    console.error(error.message);
    console.error("");
    console.error("Steps:");
    console.error("1) Supabase Dashboard → SQL Editor");
    console.error("2) Run scripts/sql/export-churches-missing-coords.sql");
    console.error("3) Copy JSON result → reports/churches-to-geocode.json");
    console.error("4) node scripts/geocode-churches-offline.mjs --limit 5");
    process.exit(1);
  }

  if (Number.isFinite(args.limit)) {
    churches = churches.slice(0, args.limit);
  }

  console.log(`Loaded ${churches.length} churches from ${args.input}`);
  console.log("Geocoding with Google Places (no Supabase key needed)...");

  const summary = {
    processed: 0,
    success: 0,
    failed: 0,
    manualReview: 0,
    sqlStatements: 0,
  };
  const successes = [];
  const failures = [];
  const manualReviews = [];
  const sqlStatements = [];
  const startedAt = new Date().toISOString();

  for (let i = 0; i < churches.length; i += 1) {
    const church = churches[i];
    summary.processed += 1;
    if (i > 0) await new Promise((r) => setTimeout(r, args.delayMs));

    process.stdout.write(
      `[${i + 1}/${churches.length}] #${church.id} ${String(church.church_name ?? "").slice(0, 40)}… `,
    );

    const outcome = await geocodeChurch(church, { apiKey: googleApiKey, delayMs: args.delayMs });

    if (outcome.status === "success") {
      summary.success += 1;
      successes.push(outcome);
      sqlStatements.push(buildUpdateSql(church.id, outcome.lat, outcome.lng));
      summary.sqlStatements += 1;
      console.log(`OK ${outcome.lat}, ${outcome.lng}`);
    } else if (outcome.status === "manual_review") {
      summary.manualReview += 1;
      manualReviews.push(outcome);
      if (args.includeReview) {
        sqlStatements.push(
          `-- REVIEW: ${outcome.reason} for #${church.id} ${sqlEscape(church.church_name)}`,
        );
        sqlStatements.push(buildUpdateSql(church.id, outcome.lat, outcome.lng));
        summary.sqlStatements += 1;
      }
      console.log(`REVIEW (${outcome.reason})`);
    } else {
      summary.failed += 1;
      failures.push(outcome);
      sqlStatements.push(
        `-- FAIL: #${church.id} ${sqlEscape(church.church_name)} — ${outcome.reason}`,
      );
      console.log(`FAIL (${outcome.reason})`);
    }
  }

  fs.mkdirSync(path.dirname(args.outputSql), { recursive: true });
  const sqlBody = [
    "-- Generated by scripts/geocode-churches-offline.mjs",
    `-- ${startedAt}`,
    "-- Paste into Supabase Dashboard → SQL Editor → Run",
    "",
    ...sqlStatements,
    "",
  ].join("\n");
  fs.writeFileSync(args.outputSql, sqlBody);

  const reportBase = timestampReportName("CHURCH_GEOCODING_OFFLINE");
  const payload = {
    startedAt,
    finishedAt: new Date().toISOString(),
    input: args.input,
    outputSql: args.outputSql,
    summary,
    successes,
    failures,
    manualReviews,
  };
  const { jsonPath, mdPath } = writeReport(reportBase, payload);

  console.log("\n=== Offline geocoding complete ===");
  console.log(`Success:       ${summary.success}`);
  console.log(`Failed:        ${summary.failed}`);
  console.log(`Manual review: ${summary.manualReview}`);
  console.log(`SQL file:      ${args.outputSql}`);
  console.log(`Report:        ${mdPath}`);
  console.log("\nNext step:");
  console.log("Supabase Dashboard → SQL Editor → open reports/geocode-updates.sql → Run");
}

main().catch((error) => {
  console.error("\nOffline geocoding failed:", error.message);
  process.exit(1);
});
