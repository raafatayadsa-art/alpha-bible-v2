/**
 * One-time Church Geocoding System — Google Maps Places API → public.churches
 *
 * Finds churches with missing latitude/longitude, geocodes in batches,
 * never overwrites existing coordinates, supports dry-run + apply modes.
 *
 * Usage (dry-run — default, no DB writes):
 *   SUPABASE_SERVICE_ROLE_KEY=... GOOGLE_MAPS_API_KEY=... node scripts/geocode-churches.mjs
 *
 * Apply updates to database:
 *   SUPABASE_SERVICE_ROLE_KEY=... GOOGLE_MAPS_API_KEY=... node scripts/geocode-churches.mjs --apply
 *
 * Options:
 *   --limit 50          Process at most N churches
 *   --offset 0          Skip first N candidates
 *   --batch-size 100    DB fetch page size
 *   --delay-ms 200      Delay between Google API calls (default 200ms)
 *   --resume            Continue from reports/geocode-churches-checkpoint.json
 *   --include-review    Also apply manual_review hits (default: skip, report only)
 *
 * Requires:
 *   SUPABASE_SERVICE_ROLE_KEY (or in .env.local)
 *   GOOGLE_MAPS_API_KEY (or in .env.local)
 *   SUPABASE_URL (optional, defaults to project URL)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  buildUpdatePatch,
  churchNeedsGeocoding,
  geocodeChurch,
  sleep,
  timestampReportName,
} from "./lib/church-geocoding.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const REPORTS_DIR = path.join(ROOT, "reports");
const CHECKPOINT_PATH = path.join(REPORTS_DIR, "geocode-churches-checkpoint.json");

const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://usflbjlyadihyitnvzya.supabase.co";

const CHURCH_SELECT =
  "id, church_name, formatted_address, city, governorate, country, latitude, longitude, is_active";

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
      if (!process.env[key]?.trim()) process.env[key] = value;
    }
  }
}

function parseArgs(argv) {
  const args = {
    apply: false,
    resume: false,
    includeReview: false,
    limit: Infinity,
    offset: 0,
    batchSize: 100,
    delayMs: 200,
    serviceKey: null,
    googleKey: null,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--apply") args.apply = true;
    else if (arg === "--dry-run") args.apply = false;
    else if (arg === "--resume") args.resume = true;
    else if (arg === "--include-review") args.includeReview = true;
    else if (arg === "--limit") args.limit = Number(argv[++i] ?? "0");
    else if (arg === "--offset") args.offset = Number(argv[++i] ?? "0");
    else if (arg === "--batch-size") args.batchSize = Number(argv[++i] ?? "100");
    else if (arg === "--delay-ms") args.delayMs = Number(argv[++i] ?? "200");
    else if (arg === "--service-key") args.serviceKey = String(argv[++i] ?? "").trim();
    else if (arg === "--google-key") args.googleKey = String(argv[++i] ?? "").trim();
    else if (arg === "--help" || arg === "-h") {
      console.log(fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(0, 24).join("\n"));
      process.exit(0);
    }
  }

  return args;
}

async function fetchAllChurches(supabase) {
  const rows = [];
  const pageSize = 500;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("churches")
      .select(CHURCH_SELECT)
      .eq("is_active", true)
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw new Error(`Fetch churches failed: ${error.message}`);
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return rows;
}

function summarizeBaseline(allChurches) {
  const total = allChurches.length;
  const withCoords = allChurches.filter(
    (c) => c.latitude != null && c.longitude != null,
  ).length;
  const missingCoords = allChurches.filter(churchNeedsGeocoding).length;
  const withAddress = allChurches.filter((c) => c.formatted_address?.trim()).length;
  const withCity = allChurches.filter((c) => c.city?.trim()).length;
  const withGov = allChurches.filter((c) => c.governorate?.trim()).length;

  return { total, withCoords, missingCoords, withAddress, withCity, withGov };
}

function loadCheckpoint() {
  if (!fs.existsSync(CHECKPOINT_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(CHECKPOINT_PATH, "utf8"));
  } catch {
    return null;
  }
}

function saveCheckpoint(state) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(state, null, 2));
}

function writeReports(reportBase, payload) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const jsonPath = path.join(REPORTS_DIR, `${reportBase}.json`);
  const mdPath = path.join(REPORTS_DIR, `${reportBase}.md`);

  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2));

  const { summary, baseline, mode, failures, manualReviews, successes } = payload;
  const md = `# Church Geocoding Report

**Date:** ${payload.startedAt}
**Mode:** ${mode}
**Report base:** ${reportBase}

---

## Executive Summary

Batch geocoding of \`public.churches\` using OpenStreetMap Nominatim.
Existing coordinates were **never overwritten**.

| Metric | Count |
|--------|------:|
| Total active churches | ${baseline.total} |
| Had coordinates (before) | ${baseline.withCoords} |
| Missing coordinates (before) | ${baseline.missingCoords} |
| Processed this run | ${summary.processed} |
| **Success** | ${summary.success} |
| **Failed** | ${summary.failed} |
| **Manual review** | ${summary.manualReview} |
| Applied to DB | ${summary.applied} |
| Skipped (already had coords at apply time) | ${summary.skippedExisting} |
| Projected with coordinates after run | ${baseline.withCoords + summary.applied} |

---

## Findings

- Geocoder: Google Maps Places API (\`places.googleapis.com\`)
- Rate limit delay: ${payload.options.delayMs}ms between requests
- Retry: up to 3 attempts with exponential backoff on 429/5xx
- Update rule: only set \`latitude\`/\`longitude\` where currently NULL

---

## Warnings

${summary.manualReview > 0 ? `- ${summary.manualReview} churches need manual review before trusting coordinates.` : "- None"}
${mode === "dry-run" ? "- **Dry-run only** — no database rows were modified. Re-run with \`--apply\` to persist success results." : ""}

---

## Errors

${failures.length ? failures.slice(0, 50).map((f) => `- Church #${f.churchId} (${f.churchName}): ${f.reason}${f.error ? ` — ${f.error}` : ""}`).join("\n") : "None recorded."}
${failures.length > 50 ? `\n… and ${failures.length - 50} more (see JSON).` : ""}

---

## Manual Review Queue

${manualReviews.length ? manualReviews.slice(0, 40).map((m) => `- #${m.churchId} **${m.churchName}** — ${m.reason} → ${m.lat}, ${m.lng} (${m.query?.q ?? "n/a"})`).join("\n") : "None."}
${manualReviews.length > 40 ? `\n… and ${manualReviews.length - 40} more (see JSON).` : ""}

---

## Recommendations

1. Review manual_review entries in JSON before applying with \`--include-review\`.
2. Re-run failed churches after enriching \`formatted_address\`.
3. Run \`--apply\` in batches (\`--limit 200\`) if the full ~1200 run is interrupted.

---

## Overall Status

${summary.failed === 0 && summary.manualReview === 0 ? "**PASS**" : summary.success > 0 ? "**PARTIAL**" : "**FAIL**"}

---

## Success sample (first 20)

${successes.slice(0, 20).map((s) => `- #${s.churchId} **${s.churchName}** → ${s.lat}, ${s.lng} (${s.query?.strategy})`).join("\n") || "None."}
`;

  fs.writeFileSync(mdPath, md);
  return { jsonPath, mdPath };
}

async function applyCoordinates(supabase, church, lat, lng) {
  const { data: current, error: readError } = await supabase
    .from("churches")
    .select("latitude, longitude")
    .eq("id", church.id)
    .maybeSingle();

  if (readError) throw new Error(readError.message);
  if (!current) throw new Error("church_not_found");
  if (current.latitude != null && current.longitude != null) {
    return { applied: false, reason: "already_has_coordinates" };
  }

  const patch = buildUpdatePatch(current, lat, lng);
  if (!Object.keys(patch).length) {
    return { applied: false, reason: "nothing_to_patch" };
  }

  const { error: updateError } = await supabase
    .from("churches")
    .update(patch)
    .eq("id", church.id);

  if (updateError) throw new Error(updateError.message);
  return { applied: true, patch };
}

async function main() {
  loadEnvFiles();
  const args = parseArgs(process.argv);
  const serviceKey = args.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const googleApiKey = args.googleKey || process.env.GOOGLE_MAPS_API_KEY;

  const envLocalPath = path.join(ROOT, ".env.local");
  const envLocalExists = fs.existsSync(envLocalPath);
  let envLocalHasEmptyServiceKey = false;
  if (envLocalExists) {
    for (const line of readEnvText(envLocalPath).split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) {
        envLocalHasEmptyServiceKey = trimmed.slice("SUPABASE_SERVICE_ROLE_KEY=".length).trim().length === 0;
        break;
      }
    }
  }

  if (!serviceKey?.trim()) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY.");
    if (envLocalHasEmptyServiceKey) {
      console.error("Found .env.local but SUPABASE_SERVICE_ROLE_KEY is empty.");
      console.error("Open .env.local and paste your service_role key after the = sign, then save (Ctrl+S).");
    } else if (envLocalExists) {
      console.error("Add this line to .env.local:");
      console.error("SUPABASE_SERVICE_ROLE_KEY=eyJ...");
    } else {
      console.error("Create .env.local in the project root or set the variable in PowerShell.");
    }
    console.error("Supabase Dashboard → Project Settings → API → service_role (starts with eyJ...).");
    console.error("");
    console.error("Option A — pass key directly (easiest):");
    console.error('node scripts/geocode-churches.mjs --limit 5 --service-key "eyJ...your_real_key..."');
    console.error("");
    console.error("Option B — PowerShell env var:");
    console.error('$env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."; node scripts/geocode-churches.mjs --limit 5');
    process.exit(1);
  }

  if (serviceKey === "eyJ..." || serviceKey.includes("your_real_key")) {
    console.error("You pasted the example text eyJ... instead of your real Supabase service_role key.");
    console.error("Copy the full key from Supabase Dashboard → Project Settings → API → service_role.");
    process.exit(1);
  }

  if (serviceKey.startsWith("sb_publishable_")) {
    console.error("Wrong Supabase key: you used publishable key (sb_publishable_...).");
    console.error("Use secret key (sb_secret_...) or service_role (eyJ...) from Supabase Dashboard → Project Settings → API.");
    process.exit(1);
  }

  if (!googleApiKey?.trim()) {
    console.error("Missing GOOGLE_MAPS_API_KEY.");
    console.error("Set it in the environment or .env.local to use Google Places API.");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("Fetching churches…");
  const allChurches = await fetchAllChurches(supabase);
  const baseline = summarizeBaseline(allChurches);

  console.log("Baseline:");
  console.log(`  Total active churches: ${baseline.total}`);
  console.log(`  With coordinates:      ${baseline.withCoords}`);
  console.log(`  Missing coordinates:   ${baseline.missingCoords}`);
  console.log(`  With address:          ${baseline.withAddress}`);
  console.log(`  With city:             ${baseline.withCity}`);
  console.log(`  With governorate:      ${baseline.withGov}`);

  let candidates = allChurches.filter(churchNeedsGeocoding);
  candidates = candidates.slice(args.offset);
  if (Number.isFinite(args.limit)) candidates = candidates.slice(0, args.limit);

  const checkpoint = args.resume ? loadCheckpoint() : null;
  const processedIds = new Set(checkpoint?.processedIds ?? []);
  if (processedIds.size) {
    candidates = candidates.filter((c) => !processedIds.has(String(c.id)));
    console.log(`Resuming — skipping ${processedIds.size} already processed.`);
  }

  console.log(`Mode: ${args.apply ? "APPLY (writes enabled)" : "DRY-RUN (no writes)"}`);
  console.log(`Candidates this run: ${candidates.length}`);

  const summary = {
    processed: 0,
    success: 0,
    failed: 0,
    manualReview: 0,
    applied: 0,
    skippedExisting: 0,
  };

  const successes = [];
  const failures = [];
  const manualReviews = [];
  const startedAt = new Date().toISOString();

  for (let i = 0; i < candidates.length; i += 1) {
    const church = candidates[i];
    summary.processed += 1;

    if (i > 0) await sleep(args.delayMs);

    process.stdout.write(
      `[${i + 1}/${candidates.length}] #${church.id} ${church.church_name?.slice(0, 40) ?? ""}… `,
    );

    const outcome = await geocodeChurch(church, {
      apiKey: googleApiKey,
      delayMs: args.delayMs,
      onRetry: ({ attempt, waitMs, error }) => {
        console.warn(`\n  retry ${attempt} in ${waitMs}ms (${error.message})`);
      },
    });

    processedIds.add(String(church.id));

    if (outcome.status === "success") {
      summary.success += 1;
      successes.push(outcome);
      console.log(`OK ${outcome.lat}, ${outcome.lng}`);

      if (args.apply) {
        try {
          const applyResult = await applyCoordinates(supabase, church, outcome.lat, outcome.lng);
          if (applyResult.applied) summary.applied += 1;
          else if (applyResult.reason === "already_has_coordinates") summary.skippedExisting += 1;
        } catch (error) {
          outcome.status = "failed";
          outcome.reason = "db_update_failed";
          outcome.error = error.message;
          summary.success -= 1;
          summary.failed += 1;
          failures.push(outcome);
        }
      }
    } else if (outcome.status === "manual_review") {
      summary.manualReview += 1;
      manualReviews.push(outcome);
      console.log(`REVIEW (${outcome.reason}) ${outcome.lat}, ${outcome.lng}`);

      if (args.apply && args.includeReview) {
        try {
          const applyResult = await applyCoordinates(supabase, church, outcome.lat, outcome.lng);
          if (applyResult.applied) summary.applied += 1;
        } catch (error) {
          outcome.error = error.message;
        }
      }
    } else {
      summary.failed += 1;
      failures.push(outcome);
      console.log(`FAIL (${outcome.reason})`);
    }

    if ((i + 1) % 10 === 0 || i === candidates.length - 1) {
      saveCheckpoint({
        startedAt,
        processedIds: [...processedIds],
        summary,
        lastProcessedId: church.id,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  const reportBase = timestampReportName("CHURCH_GEOCODING");
  const payload = {
    startedAt,
    finishedAt: new Date().toISOString(),
    mode: args.apply ? "apply" : "dry-run",
    options: args,
    baseline,
    summary,
    successes,
    failures,
    manualReviews,
  };

  const { jsonPath, mdPath } = writeReports(reportBase, payload);

  console.log("\n=== Geocoding complete ===");
  console.log(`Success:        ${summary.success}`);
  console.log(`Failed:         ${summary.failed}`);
  console.log(`Manual review:  ${summary.manualReview}`);
  console.log(`Applied to DB:  ${summary.applied}`);
  console.log(`Report JSON:    ${jsonPath}`);
  console.log(`Report MD:      ${mdPath}`);

  if (!args.apply) {
    console.log("\nDry-run finished. Re-run with --apply to persist successful coordinates.");
  }
}

main().catch((error) => {
  console.error("\nGeocoding failed:", error.message);
  process.exit(1);
});
