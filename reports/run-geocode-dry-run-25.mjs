/** One-off dry-run runner for 25 churches (no DB writes). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { geocodeChurch, sleep, timestampReportName } from "../scripts/lib/church-geocoding.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT = path.join(__dirname, "geocode-dry-run-25-input.json");
const DELAY_MS = 1100;

const churches = JSON.parse(fs.readFileSync(INPUT, "utf8"));
const baseline = {
  total: 1241,
  withCoords: 1200,
  missingCoords: 41,
  note: "Live DB snapshot at run time via Supabase SQL",
};

const summary = { processed: 0, success: 0, failed: 0, manualReview: 0, applied: 0 };
const successes = [];
const failures = [];
const manualReviews = [];
const startedAt = new Date().toISOString();

for (let i = 0; i < churches.length; i += 1) {
  const church = churches[i];
  summary.processed += 1;
  if (i > 0) await sleep(DELAY_MS);

  process.stdout.write(`[${i + 1}/${churches.length}] #${church.id} … `);
  const outcome = await geocodeChurch(church, { delayMs: DELAY_MS });

  if (outcome.status === "success") {
    summary.success += 1;
    successes.push(outcome);
    console.log(`OK ${outcome.lat}, ${outcome.lng}`);
  } else if (outcome.status === "manual_review") {
    summary.manualReview += 1;
    manualReviews.push(outcome);
    console.log(`REVIEW ${outcome.lat}, ${outcome.lng}`);
  } else {
    summary.failed += 1;
    failures.push(outcome);
    console.log(`FAIL ${outcome.reason}`);
  }
}

const reportBase = timestampReportName("CHURCH_GEOCODING_DRY_RUN_25_V2");
const successRate = ((summary.success / summary.processed) * 100).toFixed(1);
const foundRate = (((summary.success + summary.manualReview) / summary.processed) * 100).toFixed(1);
const payload = {
  startedAt,
  finishedAt: new Date().toISOString(),
  mode: "dry-run",
  options: { limit: 25, delayMs: DELAY_MS, apply: false },
  baseline,
  summary,
  successes,
  failures,
  manualReviews,
};

const jsonPath = path.join(__dirname, `${reportBase}.json`);
const mdPath = path.join(__dirname, `${reportBase}.md`);
fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2));

const md = `# Church Geocoding Dry-Run — 25 Churches

**Date:** ${startedAt}
**Mode:** dry-run (no database writes)

---

## Executive Summary

Processed the **first 25** active churches missing coordinates (41 total in DB at run time).

| Metric | Count |
|--------|------:|
| Processed | ${summary.processed} |
| **Found coordinates (success)** | ${summary.success} |
| **Manual review** | ${summary.manualReview} |
| **Failed** | ${summary.failed} |
| **Success rate** | ${successRate}% |
| **Found rate (success + review)** | ${foundRate}% |
| Applied to DB | 0 |

**Strategy:** church_name-first queries with Arabic normalization (v2)

**DB baseline:** ${baseline.withCoords} with coords · ${baseline.missingCoords} missing · ${baseline.total} total active

---

## Sample Success Results

${successes.slice(0, 10).map((s) => `- #${s.churchId} **${s.churchName.replace(/\n/g, " ")}** → \`${s.lat}, ${s.lng}\` (${s.query?.strategy})`).join("\n") || "None"}

---

## Sample Manual Review

${manualReviews.slice(0, 8).map((m) => `- #${m.churchId} **${m.churchName.replace(/\n/g, " ")}** → \`${m.lat}, ${m.lng}\` (${m.reason})`).join("\n") || "None"}

---

## Sample Failures

${failures.slice(0, 8).map((f) => `- #${f.churchId} **${f.churchName.replace(/\n/g, " ")}** — ${f.reason}`).join("\n") || "None"}

---

## Warnings

- All 25 rows had \`formatted_address = null\`; geocoder relied on church_name + city + governorate.
- Church #277 (Misrata, Libya) may fail Egypt bounds check by design.

---

## Overall Status

${summary.success > 0 ? "**PARTIAL**" : "**FAIL**"} — awaiting approval before \`--apply\`.
`;

fs.writeFileSync(mdPath, md);
console.log("\n=== Dry-run complete ===");
console.log(JSON.stringify(summary, null, 2));
console.log("Report:", mdPath);
