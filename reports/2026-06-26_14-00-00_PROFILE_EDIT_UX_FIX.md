# Profile Edit UX Fix

**Date:** 2026-06-26  
**Scope:** Save, date picker, per-field privacy, bio display, share card

---

## Executive Summary

Fixed profile edit and display issues: explicit save button, native date picker, per-field privacy selectors, live hero preview with visibility badges, bio always visible on own profile, publisher-style QR/share card at page bottom.

---

## Findings

| Issue | Fix |
|-------|-----|
| No save | Draft state + **حفظ** button in header |
| Birth date text only | `input type="date"` |
| Wrong privacy layout | Per-field: الجميع / أعضاء الكنيسة / الأصدقاء فقط / إخفاء |
| Privacy not in hero | Live preview hero + visibility chips |
| Bio not on profile | Owner profile always shows saved bio |
| Ugly barcode card | `ProfileIdentityShareCard` like publisher QR |

---

## Warnings

- Data saves only after pressing **حفظ**
- Public `/u/$username` not built yet — privacy applies to preview + future public page

---

## Errors

None. `npm run build` — PASS.

---

## Overall Status

**PASS**
