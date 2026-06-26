# Synaxarium & Saints Table Linking Report

**Date:** 2026-06-22  
**Project:** Alpha Bible (`usflbjlyadihyitnvzya`)  
**Scope:** Link `saints_index`, `saints`, `synaxarium_entries`, `synaxarium_saints`, `katamaros_days`, feasts/occasions

---

## Executive Summary

Database schema and backfill migrations were applied to unify the scraped St-Takla synaxarium catalog with the saints index and Katamaros liturgical calendar. The app API (`synaxarium-api.ts`) now reads from a unified view `synaxarium_catalog_v` instead of only the 3 seed rows in `synaxarium_saints`.

**Overall Status: PARTIAL** — day linking is complete (851/851 entries). Saint biography linking is improved but not exhaustive (79/666 person-type entries). Entity classification (patriarchs, monks, saints, feasts) is fully applied.

---

## Findings

### New / Extended Tables

| Object | Purpose |
|--------|---------|
| `coptic_months` | Canonical Coptic month registry (13 months) |
| `coptic_month_slug_aliases` | St-Takla URL slug variants (`11-Abeeb` → month 11, etc.) |
| `synaxarium_days` | One row per Coptic date; links to `katamaros_days` |
| `liturgical_occasions` | Feasts/seasons/fast from Katamaros, linked to synaxarium days |
| `synaxarium_catalog_v` | Unified read view for the app |

### Foreign Keys Added

- `synaxarium_entries.day_id` → `synaxarium_days`
- `synaxarium_entries.saint_index_id` → `saints_index`
- `synaxarium_entries.entity_type` — `saint`, `patriarch`, `monk`, `feast`, `occasion`, `council`, `other`
- `saints.saint_index_id` → `saints_index` (2096 biography shells backfilled)
- `synaxarium_saints.saint_index_id`, `synaxarium_entry_id`, `day_id`

### Backfill Results (Production)

| Metric | Count |
|--------|------:|
| `synaxarium_entries` | 851 |
| Entries linked to `synaxarium_days` | **851** (100%) |
| `synaxarium_days` | 364 |
| Days linked to `katamaros_days` | 150 |
| `liturgical_occasions` | 540 |
| `saints` (from `saints_index`) | 2096 |
| Entries linked to `saints_index` | 79 |
| `synaxarium_catalog_v` rows | 854 |

### Entity Classification (`synaxarium_entries.entity_type`)

| Type | Count | UI category |
|------|------:|-------------|
| saint | 454 | شهداء / قديسات / عام |
| occasion | 159 | مناسبات |
| patriarch | 132 | بطاركة |
| monk | 80 | رهبان |
| feast | 26 | أعياد |

### App Changes

- `src/features/synaxarium/synaxarium-api.ts` — reads `synaxarium_catalog_v`; today’s saint uses `gregorianToCoptic()`; legacy fallback to `synaxarium_saints` if view empty
- Migrations: `20250622220000_synaxarium_saints_linking.sql`, `20250622223000_synaxarium_slug_aliases_and_saint_match.sql`
- Manual verify script: `supabase/RUN_SYNAXARIUM_SAINTS_LINK.sql`

### Clarifications

- **`kholagy`** — hymn/tasbeha lyrics (Alhan), **not** patriarchs. Documented via table comment; not linked to synaxarium.
- **`monasteries`** — separate directory (69 rows); not merged in this pass.
- **Patriarchs / monks / feasts** — no standalone tables in prod; classified via `entity_type` on `synaxarium_entries` and `liturgical_occasions` from Katamaros.

---

## Warnings

1. **Saint name matching is partial (79/851)** — Arabic title formats (`نياحة البابا…`, reversed name order in `saints_index`) prevent automatic FK for all entries. Premium `synaxarium_saints` rows (3) remain the richest UI content.
2. **Katamaros ↔ Synaxarium day link is partial (150/364)** — Katamaros uses text month names (`Tut`, `Baba`); only days with matching numeric Coptic day align.
3. **Duplicate catalog rows possible** when premium `synaxarium_saints` overlaps scraped entries (view uses UNION; API dedupes by `route_id`).
4. **Build:** `npm run build` PASS after API update.

---

## Errors

None during migration apply. Initial backfill failed on lateral UPDATE syntax — fixed with subquery pattern before re-apply.

---

## Recommendations

1. **P1 — Improve saint matching:** Add normalized-name column on `saints_index`; manual mapping table for high-traffic saints; scrape biography `content` into `saints.content`.
2. **P2 — Katamaros ID alignment:** Store numeric `coptic_month` on `katamaros_days` during next Katamaros import for 100% day bridge.
3. **P2 — Feasts screen:** Wire `src/features/feasts/data.ts` to `liturgical_occasions` where `occasion_type = 'feast'`.
4. **P3 — Monasteries:** Optional link table `synaxarium_entry_monasteries` when monastery names appear in entry content.

---

## Overall Status

**PARTIAL** — Schema linking complete; catalog live in API; saint biography FK coverage needs a follow-up pass.

---

## COPYABLE REPORT

```
SYNAXARIUM SAINTS LINK — 2026-06-22
Status: PARTIAL

Applied:
- coptic_months, coptic_month_slug_aliases, synaxarium_days, liturgical_occasions
- FKs: synaxarium_entries → days + saints_index; saints → saints_index; synaxarium_saints → entries
- View: synaxarium_catalog_v (854 rows)
- API: synaxarium-api.ts reads catalog view

Counts:
- entries_with_day: 851/851
- entries_with_saint_index: 79/851
- entity_type: saint 454, patriarch 132, monk 80, feast 26, occasion 159
- saints backfilled: 2096
- liturgical_occasions: 540

Note: kholagy = hymns (not patriarchs). monasteries = separate table.
Build: PASS
```
