# Profile Edit & Display Polish

**Date:** 2026-06-26  
**Scope:** Hero removal, Alpha dates, avatar picker, privacy, layout

---

## Executive Summary

Removed edit-screen hero preview, applied Alpha date picker/display, enabled avatar change with view/change menu, enforced per-field privacy on profile display, compacted hero and QR card, right-aligned family/connect rows.

---

## Findings

| Request | Status |
|---------|--------|
| Remove hero from edit screen | Done |
| Alpha-style dates | `AlphaDatePicker` + `formatAlphaDateDisplay` |
| Smaller QR/share card | `compact` mode (120px QR) |
| Smaller hero, higher avatar | Cover 168px, avatar 86px, -mt-40 |
| Family/connect on right | `ProfileAvatarRow` items-end |
| Avatar change | File picker + view/change sheet |
| Privacy applies on profile | `isFieldVisibleOnProfile` |

---

## Warnings

- Avatar stored as data URL locally until Supabase profile sync
- `church`/`friends` visibility distinction applies on future public profile; hidden fields omitted on `/profile`

---

## Errors

None. Build PASS.

---

## Overall Status

**PASS**
