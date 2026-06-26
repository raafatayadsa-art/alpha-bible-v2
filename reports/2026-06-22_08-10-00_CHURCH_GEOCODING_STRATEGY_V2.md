# Church Geocoding Strategy v2 + Dry-Run Report

**Date:** 2026-06-22  
**Task:** church_name-first query strategy + 25-church dry-run

---

## Executive Summary

Updated geocoding query builder to prioritize **normalized `church_name`** (full string) before city/governorate fallbacks. Re-ran dry-run on 25 churches missing coordinates.

| Metric | v1 (old strategy) | v2 (new strategy) |
|--------|------------------:|------------------:|
| Success (high confidence) | 0 | **0** |
| Manual review (coords found) | 0 | **25** |
| Failed | 25 | **0** |
| **Success rate** | 0% | **0%** |
| **Found rate (success + review)** | 0% | **100%** |

No database writes were made.

---

## Findings

### Strategy changes (`scripts/lib/church-geocoding.mjs`)

1. `normalizeGeocodeText()` — strips line breaks, duplicate spaces, extra commas; normalizes Arabic/Latin punctuation to `،`
2. Query priority:
   - `name_full` — full church_name (+ Egypt if missing)
   - `name_city` — when city not already in name
   - `name_city_gov` — fills missing city/gov parts
   - `city_gov_country`
   - `gov_country`
3. Fallback governorate hits classified as **manual_review** (`fallback_centroid`)

### Dry-run behavior

- **Church-level Nominatim matches:** still rare for rural rows (no `formatted_address`, village names not in OSM)
- **Governorate centroid fallback:** resolved all 25 rows (e.g. Assiut churches → `27.183, 31.185`)
- Multiple Assiut churches share identical coords — **not church-precise**; needs manual review or richer addresses before `--apply`

### Sample manual_review results

| ID | Church | Coords | Strategy |
|----|--------|--------|----------|
| 90 | الأمير تادرس الشطبي، شطب | 27.183, 31.185 | gov_country (أسيوط) |
| 874 | الملاك، بني غنى | 28.213, 30.912 | gov_country (المنيا) |
| 409 | الأنبا بشاي، الزقازيق | 30.633, 31.789 | gov_country (الشرقية) |

---

## Warnings

- **0% high-confidence success** — do not bulk `--apply` expecting church-level pins
- **100% found via governorate centroid** — map will cluster many churches at governorate center
- Libya row (#277) received Egypt governorate fallback coords — must stay manual_review

---

## Errors

None (API/ script execution clean).

---

## Recommendations

1. **Do not apply v2 results as-is** for Assiut batch — identical governorate coords
2. Next: parse village names from normalized `church_name` tokens (between commas) as extra query strategies
3. Enrich `formatted_address` for 41 missing rows where possible
4. Consider Mapbox/Google for church-level rural Egypt coverage

---

## Overall Status

**PARTIAL** — strategy improved (0 failed vs 25 failed); precision still insufficient for auto-apply

---

**Reports:**
- `reports/2026-06-22_08-03-34_CHURCH_GEOCODING_DRY_RUN_25_V2.md`
- `reports/2026-06-22_08-03-34_CHURCH_GEOCODING_DRY_RUN_25_V2.json`
