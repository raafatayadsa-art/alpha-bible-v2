# Daily Verses — Hero Card Wiring

**Date:** 2026-06-25

---

## Executive Summary

Connected the new Supabase table `daily_verses` to the home **آية اليوم** hero card (`PremiumVerseHeroCard`). The card now loads an active verse for the current calendar day, resolves Arabic text from `bible_verses` when `verse_text` is empty, and falls back to Psalm 46:1 if the pool is unavailable.

---

## Findings

### Table schema (`daily_verses`)

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid | PK |
| `reference` | text | English ref e.g. `Joshua 1:9` |
| `verse_text` | text | Optional override |
| `category` | text | Optional |
| `is_active` | boolean | Filter for pool |
| `display_count` | integer | Admin analytics (not updated client-side) |
| `last_displayed_at` | timestamptz | Admin analytics |
| `created_at` | timestamptz | Stable ordering |

### RLS

- `daily_verses_read` — public SELECT ✅
- INSERT/UPDATE/DELETE blocked for clients ✅

### Implementation

| File | Change |
|------|--------|
| `src/lib/daily-verse.ts` | **New** — fetch pool, day-stable pick, EN→AR reference, bible lookup |
| `src/components/home/PremiumVerseHeroCard.tsx` | Uses `fetchTodaysDailyVerse()` instead of `daily_content` |
| `supabase/migrations/20250625140000_daily_verses.sql` | Repo migration mirror (IF NOT EXISTS) |

### Selection logic

- All rows with `is_active = true`, ordered by `created_at`
- Index = hash(YYYY-MM-DD) % count → same verse all day for all users
- Text: `verse_text` if set, else lookup `bible_verses` via Arabic book tokens

---

## Warnings

- References in DB are **English** (`Joshua 1:9`); display reference is **Arabic** (`يشوع 1:9`).
- `display_count` / `last_displayed_at` require a server cron or Edge Function to update (RLS blocks client writes).
- Unknown English book names skip to fallback.

---

## Errors

None. `npm run build` — **PASS**.

---

## Recommendations

1. Add optional `verse_text` Arabic overrides in `daily_verses` for faster loads.
2. Edge Function `pick_daily_verse` to increment `display_count` server-side.
3. Platform admin UI to manage the verse pool.

---

## Overall Status

**PASS**
