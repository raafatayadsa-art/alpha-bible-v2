# ALPHA-122 — Username Onboarding Flow Integration

**Date:** 2026-06-27  
**Scope:** UI + application integration only (no SQL/RLS/RPC schema changes)  
**Overall Status:** PASS

---

## Executive Summary

Integrated mandatory Alpha Identity username onboarding after authentication. Authenticated users without `username` + `display_name` in `user_profiles` are redirected to `/identity/username` until `claim_username` succeeds. Backend RPCs are the single source of truth — no localStorage completion flags.

Production backfill: **2 legacy auth users** received `user_profiles` rows before UI deploy.

---

## Findings

### Backend verified (Supabase `usflbjlyadihyitnvzya`)
- Table: `public.user_profiles` (username, display_name, RLS, unique lower(username))
- RPCs: `is_profile_completed()`, `is_username_available(text)`, `claim_username(text, text)`
- Trigger: `on_auth_user_created` → `handle_new_user()`

### Frontend gaps fixed
- Replaced dead `profiles` table references with `user_profiles` + RPCs
- Added central route guard (no per-route duplication)
- Login/register post-auth flow now checks profile completion

---

## Files Modified

| File | Change |
|------|--------|
| `src/features/auth/profile-completion-api.ts` | **NEW** — RPC wrappers, validation, suggestions, post-auth path |
| `src/features/auth/profile-completion-gate.tsx` | **NEW** — mandatory redirect guard |
| `src/features/auth/alpha-auth.ts` | Load `username` + profile from `user_profiles` |
| `src/features/auth/index.ts` | Export new APIs + gate |
| `src/components/auth/AlphaUsernameOnboardingScreen.tsx` | **NEW** — onboarding UI (Alpha DNA) |
| `src/components/auth/AlphaAuthScreens.tsx` | Login/register integration; export AuthShell/Field/inputClass |
| `src/routes/identity.username.tsx` | **NEW** — `/identity/username` route |
| `src/routes/__root.tsx` | Minimal shell + ProfileCompletionGate |
| `src/features/profile/profile-people-resolve.ts` | `profiles` → `user_profiles` |
| `supabase/migrations/20260627120000_alpha_122_user_profiles_reference.sql` | Reference doc (already on production) |

---

## Navigation Changes

- **New route:** `/identity/username` — full-screen mandatory onboarding (no back, no dock)
- **Post-login:** `resolvePostAuthPath()` → `/identity/username` or `/home` (or `/church` if pending join)
- **Completed users** on `/identity/username` → auto-redirect `/home`

---

## Startup Flow Changes

1. `AuthBootstrap` loads session
2. `ProfileCompletionGate` calls `is_profile_completed()` on every authenticated navigation
3. `FALSE` → redirect `/identity/username`
4. `TRUE` → normal app

---

## Route Guard Changes

- `ProfileCompletionGate` wraps `<Outlet />` in main shell and identity shell
- Public paths (no block): `/login`, `/register`, `/forgot-password`, `/reset-password`, `/intro`, `/identity/username`
- Guests (unsigned) unchanged — can browse public routes
- **Never trusts cache** — RPC on each auth navigation

---

## Authentication Changes

- `AlphaAuthUser` extended with `username: string | null`
- `fetchAuthUser()` reads `user_profiles` row
- Login: `ensureUserProfileRow()` + `refreshAuthContext()` + `resolvePostAuthPath()`
- Register (instant session): ensures profile row via trigger + client fallback

---

## RPC Integrations

```typescript
supabase.rpc('is_profile_completed')
supabase.rpc('is_username_available', { username_to_check })
supabase.rpc('claim_username', { new_username, new_display_name })
```

---

## Username Availability Integration

- Client format validation: `^[a-z0-9._]{4,20}$`
- Debounce 450ms before RPC
- Loading indicator while checking
- ✅ / ❌ states; Continue disabled unless available
- Up to 5 suggestions when taken — each validated via RPC before display

---

## Username Claim Integration

- `ensureUserProfileRow()` before claim (legacy users)
- Button disabled + spinner during submit
- Backend error message shown verbatim (Alpha error card style)

---

## Session Refresh Implementation

After successful claim:
1. `supabase.auth.refreshSession()`
2. `fetchUserProfileRow()`
3. `refreshAuthContext()`
4. Verify `username` + `display_name` in memory
5. Navigate `/home`

---

## User Profile Refresh Implementation

- `refreshSessionAndProfile()` in profile-completion-api
- Auth context cache updated via `refreshAuthContext()`
- No localStorage profile completion flags

---

## Global State Refresh

- `refreshAuthContext()` emits `AUTH_CONTEXT_EVENT`
- `useAlphaAuth`, `getCurrentUser`, `useAlphaIdentity` subscribers refresh

---

## Error Handling

- RPC errors displayed in destructive Alpha card (login/onboarding pattern)
- Availability RPC failures show backend message
- Claim failures show exact backend exception text

---

## Warnings

1. `list_publisher_team_members` RPC still joins old `profiles` table on production — separate backend fix
2. `alpha_identities` (ALPHA-076 hash ID) coexists with `@username` — QR/search migration is future work
3. Reference migration file is documentation-only; schema was created outside repo migrations list

---

## Errors

None. `npm run build` — **PASS**.

---

## Remaining Work

1. Wire `@username` into QR identity card + Alpha Connect search UI
2. Fix `list_publisher_team_members` to join `user_profiles`
3. Optional: batch RPC for username suggestions (reduce mobile latency)
4. Manual QA: login → onboarding → home profile shows username/display name instantly

---

## Verification Checklist

- [ ] New user login → forced to `/identity/username`
- [ ] Cannot open `/home` until claim succeeds
- [ ] Username field shows `raafat` not `@raafat`; preview shows `@raafat`
- [ ] Taken username shows suggestions
- [ ] Continue → home with identity visible without re-login
- [ ] Deep link to `/bible` while incomplete → redirect onboarding
