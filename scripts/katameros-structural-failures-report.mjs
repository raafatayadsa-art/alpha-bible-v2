import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const INPUT = path.join(ROOT, "katameros-validation-report.json");
const OUTPUT = path.join(ROOT, "katameros-validation-structural-failures.md");

const STRUCTURAL_REASONS = new Set(["VERSE_NOT_FOUND", "INVALID_REFERENCE"]);

const report = JSON.parse(fs.readFileSync(INPUT, "utf8"));
const seen = new Set();
const rows = [];

for (const r of report.failures) {
  if (!STRUCTURAL_REASONS.has(r.failureReason)) continue;
  const key = `${r.id}|${r.reference}`;
  if (seen.has(key)) continue;
  seen.add(key);
  rows.push(r);
}

rows.sort((a, b) => a.id - b.id);

const verseNotFound = rows.filter((r) => r.failureReason === "VERSE_NOT_FOUND").length;
const invalidRef = rows.filter((r) => r.failureReason === "INVALID_REFERENCE").length;

const lines = [
  "# Katameros Structural Failures Only",
  "",
  "Excludes `TEXT_MISMATCH`. Generated from `katameros-validation-report.json`.",
  "",
  "| Date | Reading Type | Reference | Reason |",
  "| --- | --- | --- | --- |",
];

for (const r of rows) {
  const ref = r.reference.replace(/`/g, "'");
  lines.push(`| ${r.date} | ${r.readingType} | \`${ref}\` | ${r.failureReason} |`);
}

lines.push("");
lines.push(`**Total:** ${rows.length} (${verseNotFound} VERSE_NOT_FOUND, ${invalidRef} INVALID_REFERENCE)`);
lines.push("");

fs.writeFileSync(OUTPUT, lines.join("\n"), "utf8");
console.log(`Wrote ${OUTPUT} (${rows.length} rows)`);
