# Cross-Device Profile & Home Cards Audit

**Date:** 2026-06-27

---

## Executive Summary

Same email/password does **not** guarantee identical UI on mobile vs browser. Auth is cloud-synced; profile photo and much profile data are **device-local**. Home cards depend on server module flags but are **cached per browser**.

---

## Findings

### What IS synced (Supabase Auth + `user_profiles`)
- Login session (email/password, OAuth)
- `display_name`, `username` from `user_profiles`
- `avatar_url` in DB **only if** set via OAuth (Google/Apple picture) or future server upload — **not** from in-app crop/save today

### What is NOT synced (localStorage per device)
| Key | Data |
|-----|------|
| `ab:profile-user` | `customAvatarUrl` (base64), bio, birthDate, privacy |
| `ab:platform-modules-public-v5` | Cached which modules/cards are enabled |
| Hero card keys in `hero-card-chrome.tsx` | Saved/engagement state |

### Profile photo resolution order
1. `customAvatarUrl` from localStorage (device-only) — **wins if present**
2. `user_profiles.avatar_url` or OAuth metadata
3. Placeholder pravatar (profile page) / initials (home header)

**Result:** Photo edited on phone stays on phone; browser shows OAuth photo or different fallback.

### Home cards difference
- Cards filtered by `isModuleEnabled()` from `platform_modules` table.
- Fetched from Supabase but stored in **local cache** on each device.
- Stale cache, failed fetch, or timing before sync → different visible cards.
- `PlatformModulesBootstrap` refreshes every 45s and on tab focus.

---

## Warnings

- Clearing browser data on one device removes local avatar entirely.
- Mobile Safari, Chrome, and installed PWA each have **separate** localStorage.

---

## Errors

None (behavior is by current architecture, not a runtime bug).

---

## Recommendations

1. **Short term:** User clears site data on both devices OR re-uploads photo on each device.
2. **Proper fix:** Upload avatar to Supabase Storage → save `avatar_url` on `user_profiles`; hydrate profile from server on login; optionally sync bio/privacy.
3. **Cards:** Force refresh modules (reload app); verify `platform_modules` in Supabase dashboard matches expected flags.

---

## Overall Status

**PARTIAL** — Auth unified; profile photo and local caches intentionally per-device today.
