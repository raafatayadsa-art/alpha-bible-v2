# Kholagy Unicode Coptic Implementation

**Date:** 2026-06-24  
**Scope:** Convert legacy ASCII Coptic to Unicode + Noto Sans Coptic font

---

## Executive Summary

Implemented browser-safe Coptic Unicode pipeline for Khoulagy hymns and liturgies. Legacy CS / Athanasius ASCII (e.g. `Pi`precbuteroc@`, `;e;pswi`) is converted to proper Unicode (ⲡⲓⲡⲣⲉⲥⲃⲩⲧⲉⲣⲟⲥ) at fetch time with in-memory cache. **Noto Sans Coptic** font loaded globally. Build **PASS**.

---

## Findings

### Architecture (best for app + priest + researcher)

| Layer | Implementation |
|-------|----------------|
| Maps | `src/lib/coptic-text/maps/coptic-font-maps.json` (CS, NEW_ATHANASIUS, COPTIC1, KYRILLOS) |
| Converter | `format-coptic-display.ts` — char map + jimkin + overline, auto font pick |
| API | `kholagy-api.ts`, `kholagy-liturgy-api.ts` convert on fetch |
| Font | Google Fonts Noto Sans Coptic + `.font-coptic-text` |
| Regen maps | `npm run build:coptic-maps` (Node + ExcelJS from StMarkus xlsx) |

### Why not npm package in browser

`@stmarkus/coptic-font-unicode-converter` uses Node `path` + ExcelJS at runtime → Vite build failed. Exported maps to JSON instead (same glyph tables).

### Sample conversions (verified)

| Input | Output |
|-------|--------|
| `Pi`precbuteroc@` | Ⲡⲓⲡ̀ⲣⲉⲥⲃⲩⲧⲉⲣⲟⲥ |
| `Am/n@` | Ⲁⲙⲏⲛ |
| `Ten y/nou ;e;pswi ;nte ;e;P_ ;nte nijom` | Ⲧⲉⲛ ⲑⲏⲛⲟⲩ ⲉ̀ⲡ̀ϣⲱⲓ ⲛ̀ⲧⲉ ⲉ̀Ⲡ̀⳪ ⲛ̀ⲧⲉ ⲛⲓϫⲟⲙ |

### UX benefits

- **User:** readable Coptic on all devices
- **Priest:** correct liturgical text, copy/share works
- **Researcher:** Unicode enables search, dictionary hooks later

---

## Warnings

1. First Khoulagy load converts ~127+ hymn strings — slight delay once; cached after.
2. Liturgy full section converts blocks only when opening reader (not on list).
3. Optional Phase 2: DB column `coptic_text_unicode` via batch script for zero client cost.

---

## Errors

None — `npm run build` **PASS**.

---

## Recommendations

1. Run app and verify Coptic column in reader + liturgy section.
2. Later: `scripts/migrate-kholagy-coptic-unicode.mjs` to persist Unicode in Supabase.
3. Hook `formatCopticDisplay` into Agpeya/Bible if those sources use legacy encoding.

---

## Overall Status

**PASS**

---

## COPYABLE REPORT

```
COPTIC UNICODE — 2026-06-24 | PASS
- format-coptic-display.ts + font maps (browser-safe)
- Noto Sans Coptic + font-coptic-text on reader columns
- kholagy + liturgy API convert on fetch
- build OK | npm run build:coptic-maps to regenerate maps
```
