# Verse Card Like Glow + Saved Verses Supabase Sync

**Date:** 2026-06-27  
**Scope:** Hero verse like glow · `saved_verses` ↔ `bible_verses` · Realtime cross-device sync  
**Overall Status:** PARTIAL

---

## Executive Summary

Restored **إعجاب** button glow on the home verse hero card (Heart icon + continuous gold pulse when active). Wired **save/unsave** actions to Supabase `saved_verses` with text resolved from `bible_verses`, plus **Realtime** subscription for instant browser ↔ mobile sync when logged in.

---

## Findings

### 1. Like button glow (آية اليوم hero)

| Change | File |
|--------|------|
| Label **إعجاب** + `Heart` icon (pink glow) | `PremiumVerseHeroCard.tsx` |
| Press pulse + **steady gold ring** when liked | `hero-card-chrome.tsx` (`meditateActivePulse`, `activePulse`) |

Behavior matches publisher album engagement DNA: glow on press, ring stays while liked.

### 2. Database link (`bible_verses` → `saved_verses`)

New module `src/lib/saved-verses-sync.ts`:

- `resolveBibleVerseForSave()` — looks up canonical `book_name` + `verse_text` from `bible_verses`
- `pushSavedVerseToRemote()` — upsert into `saved_verses` (user + book/chapter/verse unique)
- `removeSavedVerseFromRemote()` — delete on unsave
- `syncSavedVersesFromRemote()` — merge remote rows into `localStorage` `ab:saved:verses`

`useSavedVerses().toggle()` in `reading-state.ts` now dual-writes: local first (optimistic), then Supabase when authenticated.

### 3. Realtime sync

| Item | Detail |
|------|--------|
| Migration | `20260627180000_saved_verses_sync_realtime.sql` — unique index, UPDATE RLS, `REPLICA IDENTITY FULL`, realtime publication |
| Bootstrap | `SavedVersesBootstrap` in `__root.tsx` |
| Channel | `postgres_changes` on `saved_verses` filtered by `user_id` |

Actions synced live: **حفظ / إزالة الحفظ** from hero bookmark, chapter reader action sheet, saved vault.

---

## Warnings

1. **Highlights** (`ab:verse-highlights-v1`) remain **localStorage only** — no Supabase table yet.
2. **Daily verse إعجاب** count/state stays **local** (`alpha.verse-day.liked`) — no likes table in DOMAIN-09 schema.
3. **Notes / تأمل** journal flow not yet pushed to `saved_verses.note` (UPDATE policy added for future use).
4. Guest users: local-only saves; cloud sync starts after login + merge.

---

## Errors

None — `npm run build` **PASS**.

---

## Recommendations

1. Add `verse_highlights` table (DOMAIN-09) for colored-verse cloud sync.
2. Add `daily_verse_engagements` or extend `users_progress` for cross-device إعجاب counts.
3. Wire journal notes → `saved_verses.note` on compose save.

---

## Files changed

- `supabase/migrations/20260627180000_saved_verses_sync_realtime.sql`
- `src/lib/saved-verses-sync.ts` (new)
- `src/lib/saved-verses-realtime.ts` (new)
- `src/lib/reading-state.ts`
- `src/routes/__root.tsx`
- `src/components/home/PremiumVerseHeroCard.tsx`
- `src/components/home/hero-card-chrome.tsx`

---

## COPYABLE REPORT

```
VERSE LIKE GLOW + SAVED VERSES SYNC — PARTIAL | Build: PASS

Done:
- Hero card إعجاب: Heart icon + glow + active pulse ring
- saved_verses upsert/delete via bible_verses lookup
- Realtime subscription + auth bootstrap
- Migration applied on production

Not synced yet:
- Verse highlights (localStorage)
- Daily verse like counter (localStorage)
- Journal notes → saved_verses.note
```
