# Hero Verse Card — Open in Bible Reader Fix

**Date:** 2026-06-26

---

## Executive Summary

Fixed hero verse card tap on home: it now opens the correct chapter with verse highlight (`?verse=N`). Root cause was wrong `book` route param (e.g. `المزامير` instead of `سفر المزامير`). Added canonical DB book resolution and stored `bookRoute` from daily verse fetch. Build **PASS**.

---

## Findings

| Issue | Fix |
|-------|-----|
| Wrong route book name | `resolveBibleRouteBookParam()` maps aliases → Supabase `book_name` via `BIBLE_EXPECTED_CHAPTERS` |
| English refs not parsed | `resolveHeroVerseLink` also uses `parseEnglishVerseReference` |
| Daily verse missing route data | `DailyVerseData` now includes `bookRoute`, `chapter`, `verse` from DB |
| Navigation search dropped | `navigateHeroCard` passes `search: { verse }` reliably |

### Files changed

- `src/lib/bible-book-names.ts` — `resolveBibleRouteBookParam`
- `src/lib/daily-verse.ts` — route fields on resolved verse
- `src/components/home/hero-stack-data.ts` — robust verse link resolution
- `src/components/home/PremiumVerseHeroCard.tsx` — direct navigate with `bookRoute` + golden pulse search param

---

## Warnings

None.

---

## Errors

None. `npm run build` exit 0.

---

## Recommendations

Smoke-test: Home → tap verse card → should land on chapter with 5s golden pulse on target verse.

---

## Overall Status

**PASS**
