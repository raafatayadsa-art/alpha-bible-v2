# Church Geocoding System — Implementation Report

**Date:** 2026-06-22  
**Task:** One-time batch geocoder for missing `churches.latitude` / `churches.longitude`

---

## Executive Summary

Created a **one-time Church Geocoding System** that finds active churches with missing coordinates, builds Nominatim search queries from `formatted_address`, `city`, `governorate`, `country`, and `church_name`, geocodes in rate-limited batches with retries, and writes results only in **`--apply`** mode. **Existing coordinates are never overwritten.** Default mode is **dry-run** with JSON + Markdown reports.

**Goal:** raise mapped churches from **41 → 1000+** (≈1200 candidates missing coordinates).

---

## Findings

### New files

| File | Purpose |
|------|---------|
| `scripts/lib/church-geocoding.mjs` | Query builder, Nominatim client, scoring, retry, Egypt bounds |
| `scripts/geocode-churches.mjs` | CLI orchestrator: fetch, batch, dry-run/apply, checkpoint, reports |

### npm scripts

```bash
npm run geocode:churches          # dry-run (default)
npm run geocode:churches:apply    # persist success results
```

### CLI options

| Flag | Description |
|------|-------------|
| *(default)* | Dry-run — no DB writes |
| `--apply` | Update `churches` table |
| `--limit N` | Process at most N candidates |
| `--offset N` | Skip first N candidates |
| `--batch-size N` | Reserved DB page size (fetch uses 500) |
| `--delay-ms 1100` | Nominatim throttle (1 req/sec policy) |
| `--resume` | Skip IDs in `reports/geocode-churches-checkpoint.json` |
| `--include-review` | Also apply `manual_review` hits (default: report only) |

### Query strategies (ordered)

1. `formatted_address, city, governorate, country`
2. `formatted_address, governorate, country` (if no city)
3. `church_name, city, governorate, country`
4. `church_name, governorate, country`
5. `formatted_address, country`
6. `church_name, city, country`

### Result classification

| Status | Meaning |
|--------|---------|
| **success** | High-confidence match inside Egypt bounds |
| **manual_review** | Ambiguous, city/gov mismatch, or low score |
| **failed** | No results, outside Egypt, or Nominatim error |

### Safety rules

- Only processes rows where `latitude IS NULL OR longitude IS NULL`
- On apply: re-reads row; skips if both coords already set
- Patch uses `COALESCE` logic — only NULL fields updated
- Service role key required (`SUPABASE_SERVICE_ROLE_KEY`)

### Smoke test

Nominatim helper tested live — returns coordinates for sample Cairo query (`manual_review` due to ambiguity, as expected).

---

## Warnings

- Full run (~1200 churches × 1.1s) ≈ **22+ minutes** minimum; use `--resume` if interrupted.
- Nominatim usage policy: max **1 request/second**; custom User-Agent set.
- `manual_review` entries are **not applied** unless `--include-review`.
- Service role key not present in this environment — **full batch not executed here**.

---

## Errors

None in implementation. Full production geocode run pending operator credentials.

---

## Recommendations

### Step 1 — Dry-run sample

```powershell
$env:SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"
node scripts/geocode-churches.mjs --limit 25
```

Review `reports/*_CHURCH_GEOCODING.md` and JSON.

### Step 2 — Apply successes in batches

```powershell
node scripts/geocode-churches.mjs --apply --limit 300
node scripts/geocode-churches.mjs --apply --limit 300 --resume
# repeat until checkpoint shows all processed
```

### Step 3 — Manual review

Inspect `manualReviews` in JSON; fix addresses or apply selectively with `--include-review`.

### Step 4 — Verify map

Open `/church/directory` → map mode; confirm marker count increased.

---

## Overall Status

**PASS** (system ready; batch execution pending credentials)
