# ALPHA-122 — Username Onboarding Flow Integration

Date: 2026-06-27 01:22:16 UTC
Branch: `cursor/username-onboarding-flow-1821`
PR: #2

## Executive Summary

Integrated the mandatory **Alpha Identity** username onboarding flow into the
application as **UI + application integration only**. The production-ready
backend (`user_profiles`, RLS, RPCs, auth trigger) was inspected and reused
without modification. After authentication the app resolves
`public.is_profile_completed()` from the backend (never a cached flag) and locks
users with an incomplete profile into a full-screen "Choose Your Alpha Username"
screen until they claim a username + display name. Verified end-to-end against
the live Supabase project, including the happy path, the mandatory route guard,
the username-taken + suggestions path, and post-claim entry into the app.

Overall Status: **PASS**

## Findings

### Backend (inspected, NOT modified)
- `public.is_profile_completed()` → `boolean`, SQL STABLE; true when the caller's
  `user_profiles` row has non-null `username` AND `display_name`.
- `public.is_username_available(username_to_check text)` → `boolean`, SQL STABLE;
  case-insensitive existence check.
- `public.claim_username(new_username text, new_display_name text)` → `void`,
  SECURITY DEFINER; raises `Unauthorized` / `Username already claimed` /
  `Username already exists`; lowercases and stores the username.
- Trigger `on_auth_user_created` → `handle_new_user()` inserts a `user_profiles`
  row (`user_id` only) on every new `auth.users` insert.
- RLS on `user_profiles`: public `SELECT` (true), self `INSERT`/`UPDATE`
  (`auth.uid() = user_id`). Confirms availability + completion RPCs work from the
  client.

### Implementation (new / changed)
- `src/features/profile/profile-api.ts` — RPC wrappers, `user_profiles` read,
  format validation (4–20 chars; lowercase, digits, `_`, `.`), backend-validated
  suggestion generation, query keys.
- `src/features/profile/use-user-profile.ts` — `useUserProfile()` reading
  `user_profiles`, invalidated on auth-context change and after a claim.
- `src/features/profile/ProfileOnboardingGuard.tsx` — `GuardedOutlet`: re-runs
  the completion RPC on every protected navigation (`staleTime: 0`, `gcTime: 0`)
  and redirects incomplete users to onboarding.
- `src/components/profile-onboarding/UsernameOnboardingScreen.tsx` — mandatory
  full-screen identity page (Alpha DNA), debounced availability, `@username`
  live preview, suggestions, display name, and post-claim refresh sequence.
- `src/routes/username-onboarding.tsx` + `src/routes/__root.tsx` — route rendered
  outside the app shell (no nav/back/dock); `GuardedOutlet` wraps protected
  content.
- `src/components/auth/AlphaAuthScreens.tsx` — login gates entry on
  `is_profile_completed()`.

### Verification (live backend)
- Login as a fresh user → redirected to `/username-onboarding`.
- Deep-linking `/home` while incomplete → bounced back to onboarding.
- Available username → green "Username Available ✅", `@username` preview,
  Continue enabled → claim → `/home`.
- Taken username (`raafat`) → "Username Already Taken ❌" + 5 validated
  suggestions; Continue disabled; selecting a suggestion → available → claim.
- Both claims persisted to `user_profiles` (`raafat` / `رأفت سمير`, `raafat_1`).

## Warnings

- The repository has a large number of **pre-existing** eslint/prettier and
  `tsc` issues unrelated to this change (43 `tsc` errors on `main`). This PR adds
  **0** new type/lint errors in its files.
- `is_username_available` runs as the caller; correct behaviour depends on the
  existing public `SELECT` RLS policy on `user_profiles` (verified present).

## Errors

- None. All verification steps passed.

## Recommendations

- Bind Home / My Page identity UI to `useUserProfile()` so the claimed username
  and display name surface app-wide (currently those screens still use static
  placeholders; out of scope for this UI-integration task).
- Backend (not in scope): `claim_username` performs no format validation; format
  is enforced client-side only.

## Overall Status: PASS

---

Test data note: two throwaway QA accounts were created to verify the live flow
and **deleted afterward** to restore the database to its prior state.
