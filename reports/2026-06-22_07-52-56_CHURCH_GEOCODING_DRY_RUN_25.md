# Church Geocoding Dry-Run — 25 Churches

**Date:** 2026-06-22T04:51:38.013Z
**Mode:** dry-run (no database writes)

---

## Executive Summary

Processed the **first 25** active churches missing coordinates (41 total in DB at run time).

| Metric | Count |
|--------|------:|
| Processed | 25 |
| **Found coordinates (success)** | 0 |
| **Manual review** | 0 |
| **Failed** | 25 |
| Applied to DB | 0 |

**DB baseline:** 1200 with coords · 41 missing · 1241 total active

---

## Sample Success Results

None

---

## Sample Manual Review

None

---

## Sample Failures

- #1 **كنيسة ماربقطر  شو الشهيد، دير  شو، مصر** — all_strategies_exhausted
- #2 **كنيسة الشهيد الأمير تادروس،  دير بصرة، مصر** — all_strategies_exhausted
- #4 **كنيسة القديسة العذراء مريم،  شقلقيل، مصر** — all_strategies_exhausted
- #5 **كنيسة العذراء مريم، المعابدة  الغربية، مصر** — all_strategies_exhausted
- #7 **كنيسة العذراء مريم القديسة،  بني عليج، مصر** — all_strategies_exhausted
- #10 **كنيسة الشهيد مارمرقس، مدينة  الفتح، مصر** — all_strategies_exhausted
- #12 **كنيسة الشهيد مارجرجس،  المعابدة الغربية، مصر** — all_strategies_exhausted
- #53 **كنيسة الشهيد مارجرجس، ساقلتة، مصر** — all_strategies_exhausted

---

## Warnings

- All 25 rows had `formatted_address = null`; geocoder relied on church_name + city + governorate.
- Church #277 (Misrata, Libya) may fail Egypt bounds check by design.
- **Root cause of 0 successes:** Nominatim returned **no results** for all 25 church-specific queries. Small Upper Egypt villages (e.g. بني غنى، دير شو) are not indexed; `church_name` fields also embed noisy address text with newlines.
- **DB note:** At run time only **41** churches lack coordinates (1200 already mapped) — not ~1200 as previously estimated.

---

## Errors

All 25 candidates: `all_strategies_exhausted` (Nominatim `no_results` across every query strategy).

---

## Recommendations (pending your approval)

1. **Do not apply yet** — current query strategy yields 0 matches for this cohort.
2. Enrich `formatted_address` for the 41 missing rows before re-run.
3. Normalize `church_name` (strip embedded location suffixes / newlines) before geocoding.
4. Add fallback: geocode `city + governorate` centroid for manual_review when church-level search fails.
5. Consider Google Geocoding or Mapbox for rural Egypt if Nominatim coverage remains insufficient.

---

## Overall Status

**FAIL** (0/25 resolved) — **awaiting approval** before any `--apply` run or geocoder tuning.
