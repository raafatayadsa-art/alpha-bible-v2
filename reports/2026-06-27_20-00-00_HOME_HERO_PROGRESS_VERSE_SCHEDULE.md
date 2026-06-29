# Home Hero — Progress Rail, Greeting Cross, Verse Schedule

**Date:** 2026-06-27  
**Scope:** Home screen hero area UX fixes

---

## Executive Summary

Updated home hero progress rail colors (away from burgundy), replaced greeting sparkle/emoji with luminous Coptic cross, and enabled interactive daily verse week schedule on آية اليوم card.

---

## Findings

1. **HeroProgressRail** used burgundy `#5a1f2a` for active labels.
2. Greeting used Sparkles icon + sun emoji before "صباح الخير".
3. **PremiumVerseHeroCard** lacked verse week schedule UI; daily_verses pool was load-only for today.

---

## Changes

| Area | Fix |
|------|-----|
| `HeroProgressRail` | Green/purple/gold accents, z-20, touch-manipulation, stopPropagation on tap |
| `home.tsx` | Luminous `CopticCross` before greeting |
| `PremiumVerseHeroCard` | Katameros date strip + `VerseDayScheduleBar` (7-day picker) |
| `daily-verse.ts` | `fetchDailyVerseForDay`, `fetchDailyVerseWeekSchedule` |
| `alpha-polish-tokens.css` | Greeting cross glow animation |

---

## Warnings

- Verse schedule requires `daily_verses` rows with `is_active=true`; falls back to Psalm 46:1 if empty.

---

## Errors

None — build PASS.

---

## Overall Status

**PASS**
