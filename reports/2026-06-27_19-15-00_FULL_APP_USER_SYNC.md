# Full App Cross-Device Sync — Alpha User Sync

**Date:** 2026-06-27  
**Scope:** Fix broken sync + extend to full Bible/user progress data  
**Overall Status:** PARTIAL

---

## Executive Summary

Sync was failing because bootstrap ran **before auth initialized** (`isAuthenticated()` returned false on first paint). Replaced with `AlphaUserSyncBootstrap` that waits for `waitForAuthUserId(8000)` and listens to `subscribeAuthContext`.

Added **full app payload sync** via `users_progress.payload` (JSONB) with Realtime, covering reading sessions, highlights, journal, journey, saved chapters, and typography prefs. `saved_verses` sync is now **bidirectional** with Realtime replace-on-pull for deletes.

---

## Root Cause (Why Sync Was Broken)

1. `SavedVersesBootstrap` called `isAuthenticated()` immediately — auth cache empty until `initAuth()` finished.
2. One-way merge never **pushed local saves** to Supabase on login.
3. Delete used exact `book_name` only — alias mismatch (e.g. typo DB names) caused failed deletes.
4. Only `saved_verses` was wired — highlights, reading, journal, journey stayed local-only.

---

## What Syncs Now (Logged-In Users)

| Data | Storage | Mechanism |
|------|---------|-----------|
| Saved verses | `saved_verses` table | Upsert/delete + Realtime |
| Continue reading | `users_progress.payload` | Debounced push + Realtime pull |
| Recent chapters | payload | same |
| Verse highlights | payload | same |
| Bible journal | payload | same |
| Journey progress/streak | payload | same |
| Saved chapters | payload | same |
| Reader typography | payload | same |

**Bootstrap flow on login:**
1. Push local saved verses → Supabase
2. Pull saved verses (replace local — deletes propagate)
3. Merge + push/pull `users_progress.payload`
4. Subscribe Realtime on both tables

**On every local change:** debounced push (1.5–6s depending on key).

**On tab close / visibility hidden:** flush push immediately.

---

## Migrations Applied (Production)

1. `20260627180000_saved_verses_sync_realtime.sql` (prior)
2. `20260627190000_users_progress_payload_sync.sql` — `payload jsonb`, `updated_at`, unique `user_id`, Realtime

---

## Warnings

1. **Guest mode** — still local-only until login.
2. **Hero إعجاب counter** — still local (`alpha.verse-day.liked`); not in payload yet.
3. **Community / Connect / Publisher** — separate sync paths (already had partial Realtime).
4. **Conflict resolution** — section-level merge by timestamp; simultaneous edits on same verse may last-write-win.
5. **Mobile app** must read/write same `users_progress.payload` schema (`v: 1`) for parity.

---

## Errors

None — `npm run build` **PASS**.

---

## Recommendations

1. Add hero engagement + reading settings to payload `v: 2`.
2. Mobile team: align payload keys with `USER_SYNC_STORAGE_KEYS` in `user-progress-sync-types.ts`.
3. Add sync status indicator in settings when push fails (offline banner).

---

## Files Changed

- `src/lib/alpha-user-sync-bootstrap.ts` (new hub)
- `src/lib/user-progress-sync.ts` (new)
- `src/lib/user-progress-sync-types.ts` (new)
- `src/lib/saved-verses-sync.ts` (bidirectional fix)
- `src/lib/reading-state.ts`, `verse-highlights.ts`, `bible-journal-state.ts`, `journey-storage.ts` (push hooks)
- `src/routes/__root.tsx`
- `supabase/migrations/20260627190000_users_progress_payload_sync.sql`
- `src/integrations/supabase/database.generated.ts` (users_progress columns)

---

## Overall Status: PARTIAL

Core Bible user data syncs when authenticated. Community-only and guest-local data excluded by design.
