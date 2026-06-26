# Church Geocoding Dry-Run — 25 Churches

**Date:** 2026-06-22T05:01:10.434Z
**Mode:** dry-run (no database writes)

---

## Executive Summary

Processed the **first 25** active churches missing coordinates (41 total in DB at run time).

| Metric | Count |
|--------|------:|
| Processed | 25 |
| **Found coordinates (success)** | 0 |
| **Manual review** | 25 |
| **Failed** | 0 |
| **Success rate** | 0.0% |
| **Found rate (success + review)** | 100.0% |
| Applied to DB | 0 |

**Strategy:** church_name-first queries with Arabic normalization (v2)

**DB baseline:** 1200 with coords · 41 missing · 1241 total active

---

## Sample Success Results

None

---

## Sample Manual Review

- #1 **كنيسة ماربقطر  شو الشهيد، دير  شو، مصر** → `27.1832822, 31.1853836` (ambiguous_results)
- #2 **كنيسة الشهيد الأمير تادروس،  دير بصرة، مصر** → `27.1832822, 31.1853836` (ambiguous_results)
- #4 **كنيسة القديسة العذراء مريم،  شقلقيل، مصر** → `27.1832822, 31.1853836` (ambiguous_results)
- #5 **كنيسة العذراء مريم، المعابدة  الغربية، مصر** → `27.1832822, 31.1853836` (ambiguous_results)
- #7 **كنيسة العذراء مريم القديسة،  بني عليج، مصر** → `27.1832822, 31.1853836` (ambiguous_results)
- #10 **كنيسة الشهيد مارمرقس، مدينة  الفتح، مصر** → `27.1832822, 31.1853836` (ambiguous_results)
- #12 **كنيسة الشهيد مارجرجس،  المعابدة الغربية، مصر** → `27.1832822, 31.1853836` (ambiguous_results)
- #53 **كنيسة الشهيد مارجرجس، ساقلتة، مصر** → `26.7624629, 32.0909936` (ambiguous_results)

---

## Sample Failures

None

---

## Warnings

- All 25 rows had `formatted_address = null`; geocoder relied on church_name + city + governorate.
- Church #277 (Misrata, Libya) may fail Egypt bounds check by design.

---

## Overall Status

**FAIL** — awaiting approval before `--apply`.
