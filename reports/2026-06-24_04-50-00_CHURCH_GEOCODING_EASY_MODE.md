# Church Geocoding Easy Mode Report

**Date:** 2026-06-24

---

## Executive Summary

Added an alternative geocoding workflow that **does not require Supabase service_role / secret keys** on the developer machine. The user only needs `GOOGLE_MAPS_API_KEY` in `.env.local`. Database updates are applied by pasting generated SQL into Supabase SQL Editor.

---

## Findings

- 41 active churches currently missing coordinates.
- Publishable key (`sb_publishable_...`) cannot replace service role for direct DB writes.
- New scripts:
  - `scripts/export-churches-for-geocode.mjs` — exports missing churches using public anon key
  - `scripts/geocode-churches-offline.mjs` — geocodes via Google Places, writes SQL
  - `scripts/run-church-geocode-easy.mjs` — one command for steps 1+2
  - `scripts/sql/export-churches-missing-coords.sql` — manual fallback export

---

## Warnings

- Google Places API must be enabled on the Google Maps key.
- Review `reports/geocode-updates.sql` before running in Supabase SQL Editor.
- Manual-review results are skipped unless `--include-review` is used.

---

## Errors

None in script creation. User environment previously blocked service role setup.

---

## Recommendations

1. Run: `node scripts/run-church-geocode-easy.mjs`
2. Paste `reports/geocode-updates.sql` in Supabase SQL Editor
3. Verify churches appear on the directory map

---

## Overall Status

**PASS**
