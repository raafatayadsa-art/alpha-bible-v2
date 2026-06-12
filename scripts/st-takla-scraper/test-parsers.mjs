#!/usr/bin/env node
/** Quick parser smoke test using fixture HTML (no network). */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseSynaxariumHtml } from "./lib/parse-synaxarium.mjs";
import { parseKatamarosHtml } from "./lib/parse-katamaros.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "fixtures");

function load(name) {
  const p = join(fixturesDir, name);
  if (!existsSync(p)) {
    console.warn(`Skip missing fixture: ${name}`);
    return null;
  }
  return readFileSync(p, "utf8");
}

let failed = 0;

const synHtml = load("synaxarium-10-05.html");
if (synHtml) {
  const { day, saints } = parseSynaxariumHtml(synHtml, {
    coptic_year: 1742,
    coptic_month: 10,
    coptic_day: 5,
    source_url:
      "https://st-takla.org/Full-Free-Coptic-Books/Synaxarium-or-Synaxarion/10-Bawoonah/05-Bawoonah.html",
  });
  if (saints.length < 2) {
    console.error("FAIL synaxarium: expected >= 2 saints, got", saints.length);
    failed++;
  } else {
    console.log("OK synaxarium:", day.id, saints.length, "saints");
  }
}

const katHtml = load("katamaros-10-05.html");
if (katHtml) {
  const day = parseKatamarosHtml(
    katHtml,
    "https://st-takla.org/zJ/index.php/en-readings-katamaros?c=&dbl=ar&iday=12&imonth=6&iyear=2026&sm=10-5&view=reading-arabic",
    { coptic_year: 1742, coptic_month: 10, coptic_day: 5 }
  );
  const types = new Set((day.readings || []).map((r) => r.reading_type));
  const expected = ["vespers_psalm", "pauline", "synaxarium", "liturgy_gospel"];
  for (const t of expected) {
    if (!types.has(t)) {
      console.error("FAIL katamaros: missing reading_type", t, "got", [...types]);
      failed++;
      break;
    }
  }
  if (failed === 0) {
    console.log("OK katamaros:", day.id, day.readings.length, "readings", [...types]);
  }
}

process.exit(failed ? 1 : 0);
