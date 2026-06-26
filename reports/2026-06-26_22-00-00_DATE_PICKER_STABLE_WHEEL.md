# AlphaDatePicker — ثبات أرقام وشهور العجلة

**Date:** 2026-06-26

---

## Executive Summary

Fixed jittering/shifting numbers and month names in the date picker wheel by using uniform typography and fixed column widths.

---

## Findings

**Cause:** Focus state changed `fontSize`, `fontWeight`, and `transform: scale()` per row while scrolling → layout shift for digits and Arabic months.

**Fix (`AlphaDatePicker.tsx`):**
- Uniform `17px` / `font-weight: 700` for every row
- Removed scale transforms, tick animation, and `transition-all`
- Fixed grid columns: day 54px · month 110px · year 76px
- Selection band and fade masks aligned to same grid width
- Focus feedback via color/opacity only

---

## Warnings

None.

---

## Errors

None.

---

## Overall Status

**PASS**
