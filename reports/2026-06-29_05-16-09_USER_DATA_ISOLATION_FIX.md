# User Data Isolation Fix

## Executive Summary

Fixed cross-account data leakage on the same browser/device. When a new user signed in, they could see the previous account's posts, friends, profile photo, and birth date because `localStorage` was shared and cloud sync pushed stale local data to the new account. The app now tracks the bound auth user, wipes user-scoped caches on account switch/sign-out, and pulls cloud data before pushing on sync bootstrap.

## Findings

1. **Root cause:** Keys like `ab:profile-user`, `ab:community-hub-v1`, `ab:community-friends-v1` were device-global, not per `user_id`.
2. **Amplifier:** `AlphaUserSyncBootstrap` pushed local saved verses and progress **before** pulling remote, uploading Account A's data to Account B's Supabase row.
3. **Sign-out gap:** `signOutCurrentDevice()` only ended the Supabase session; it did not clear local caches or church in-memory cache.
4. **No bound-user tracking:** No `ab:last-bound-auth-user-id` marker to detect account switches on reload.

## Changes Implemented

| File | Change |
|------|--------|
| `src/features/auth/user-data-isolation.ts` | **New** — `clearUserScopedLocalData()`, `handleAuthUserTransition()`, `LAST_BOUND_AUTH_USER_KEY` |
| `src/features/auth/auth-context.ts` | Call `handleAuthUserTransition()` on every auth refresh |
| `src/features/auth/sign-out.ts` | Clear scoped data on sign-out |
| `src/features/auth/index.ts` | Export isolation helpers |
| `src/lib/user-progress-sync.ts` | `resetUserProgressSyncState()` |
| `src/lib/alpha-user-sync-bootstrap.ts` | Pull remote **before** push (saved verses + progress) |
| `src/features/community/community-store.ts` | `resetCommunityLocalStore()` |

### Keys cleared on switch/sign-out

- Progress sync keys (`ab:reading:*`, `ab:verse-highlights-v1`, `ab:bible:journal`, `ab:profile-user`, settings, agpeya/kholagy/katameros extras, hero engagement keys)
- `ab:saved:verses`
- `ab:community-hub-v1`, `ab:community-friends-v1`, spiritual record, moderation, demo seed flags
- Profile people links and repost caches
- In-memory member church cache

## Warnings

- **First login after update:** Users with orphan local data from a prior account (no `ab:last-bound-auth-user-id`) will get a one-time local wipe; cloud sync restores their own data.
- **Guest → first login:** Guest-only local reading progress on the device may be cleared when binding the first authenticated user (security trade-off).
- **Alpha Connect shield gate** was not part of this fix — still a separate product decision.
- **Server RLS** for `community_moments` broad queries remains unchanged; this fix addresses device-level leakage.

## Errors

None during build.

## Recommendations

1. Manually test: Login A → add friend/post/profile → logout → login B → confirm empty personal/community data, then cloud restore for B only.
2. Optional follow-up: scope storage keys as `ab:profile-user:{userId}` for hot-swap without full wipe.
3. Optional: gate Alpha Connect on church verification from Supabase.
4. If Account B already received Account A's cloud payload, run a one-time Supabase cleanup on affected `users_progress` rows.

## Overall Status

**PASS** — Build succeeded (~84s).
