# Hero Cards Data + Section Wiring

**Date:** 2026-06-17  
**Scope:** Connect home hero stack cards to live data and section routes

---

## Executive Summary

Hero stack cards now load real daily content from the same sources as their destination screens and navigate to the correct section with deep links where available.

---

## Findings

### Data sources (`useHeroStackData.ts` + `hero-stack-data.ts`)

| Card | Data API | Title / subtitle |
|------|----------|------------------|
| **آية اليوم** | `daily_content` / `bible_verses` (existing) | Verse text + reference |
| **القطمارس** | `katamerosDayQueryOptions()` | Occasion + first gospel reading |
| **قديس اليوم** | `todaySynaxariumSaintQueryOptions()` | Saint name + summary |
| **مناسبة** | `getTodayFeast()` | Feast title + subtitle |

### Navigation targets

| Card | Route |
|------|-------|
| Verse | `/$book/$chapter` from parsed reference, else `/bible` |
| Katameros | `/katameros` |
| Saint | `/synaxarium/$saintId` |
| Feast | `/feasts/$eventId` |

### Files

- `src/components/home/hero-stack-data.ts` — builders + `resolveHeroVerseLink` + `navigateHeroCard`
- `src/components/home/useHeroStackData.ts` — React Query hook
- `src/components/home/HomeVerseHeroStack.tsx` — consumes live cards
- `src/components/home/HeroDailyCard.tsx` — `link: HeroCardRoute` instead of static `to`
- `src/components/home/PremiumVerseHeroCard.tsx` — opens exact Bible chapter from reference

---

## Warnings

- `fetchTodaySynaxariumSaint()` still returns first saint in DB (same as synaxarium home) — not date-matched yet
- `getTodayFeast()` returns first feast in static list — same as feasts home
- Katameros/saint queries may briefly show fallback text while loading

---

## Errors

None. Build passes.

---

## Recommendations

1. Add date-based saint/feast resolution when backend supports it
2. Pass katameros `day.id` in route search if date-specific deep link is needed

---

## Overall Status

**PASS**
