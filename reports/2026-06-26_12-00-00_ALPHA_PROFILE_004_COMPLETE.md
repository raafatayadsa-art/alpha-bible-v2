# ALPHA-PROFILE-004 — Implementation Complete

**Date:** 2026-06-26  
**Scope:** Profile display / edit / settings split

---

## Executive Summary

All five phases of ALPHA-PROFILE-004 are complete. Profile is display-only; `/profile/edit` owns user data and social privacy; `/settings` owns app behavior. Privacy toggles in the edit screen now affect the live profile view.

---

## Findings

| Phase | Status | Notes |
|-------|--------|-------|
| 1 — Clean profile | PASS | No settings entry points on `/profile` |
| 2 — Edit screen | PASS | 4 sections at `/profile/edit`; `/profile/personal` redirects |
| 3 — Enrich display | PASS | Bio, Alpha ID, achievements, privacy-aware sections |
| 4 — Clean settings | PASS | Profile privacy moved; myChurch links to edit |
| 5 — Schema prep | PASS | Migration `20250626120000_profile_user_preferences.sql` |

### Privacy wiring (this session)

- `showAvatar` — hides photo in hero, shell header, membership card
- `showBio` — hides bio text
- `showAchievements` — hides achievements section
- `showSpiritualStats` — hides activity ledger + hero stats row
- `showChurch` — hides church name in hero + church card
- `showBirthDate` — shows birth date on hero when set
- Legacy `hideChurch` / `hideBirthdate` migrated from settings store

---

## Warnings

- Avatar/name editing still marked "قريباً" — requires account settings backend
- `profileVisibility` stored locally; public `/u/$username` page not built yet
- Supabase migration created but not applied to remote in this session

---

## Errors

None. `npm run build` — PASS.

---

## Recommendations

1. Apply migration to Supabase when ready to sync profile prefs server-side
2. Wire `profile-user-store` to `public.profiles` after auth session available
3. Build public profile route using `profile_visibility` rules

---

## Overall Status

**PASS**
