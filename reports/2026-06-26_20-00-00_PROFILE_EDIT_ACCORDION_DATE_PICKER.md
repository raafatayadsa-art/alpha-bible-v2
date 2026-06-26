# Profile Edit — ترتيب الكروت · أكورديون · تكبير التاريخ

**Date:** 2026-06-26

---

## Executive Summary

Reordered profile edit sections (خصوصية بعد المعلومات الشخصية)، single-open accordion behavior، and larger stabilized date wheel numbers in `AlphaDatePicker`.

---

## Findings

### Section order (`ProfileEditScreen`)
1. المعلومات الشخصية
2. خصوصية الملف الشخصي
3. بيانات الكنيسة

### Accordion
- One `openSection` state; opening a card closes the previously open card.
- Clicking the open card again collapses it.

### Date picker (`AlphaDatePicker`)
- Wheel row height: 26px → 36px; viewport: 96px → 120px.
- Selected number font: 18px (was 15px); neighbors scaled up.
- `tabular-nums` + fixed `min-w` per item to prevent digit shift.
- Selection band height synced to row height.
- Column flex weights: day / month / year for stable layout.

---

## Warnings

None.

---

## Errors

None.

---

## Recommendations

None.

---

## Overall Status

**PASS**
