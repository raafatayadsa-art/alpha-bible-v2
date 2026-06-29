# Premium Sign Up — Logo Removal, Login Redirect, OAuth

**Date:** 2026-06-27  
**Scope:** Auth UI/flow (no DB/RPC changes)

---

## Executive Summary

Removed the incorrect Coptic logo mark from premium auth screens, wired email sign-up to Supabase with post-registration redirect to `/login`, and enabled Google/Apple OAuth on register and login with a dedicated `/auth/callback` route. Build: **PASS**.

---

## Findings

1. **Logo removed** — `AlphaPremiumAuthShell` no longer shows `Ⲁ ✝ Ⲱ` hero mark or Coptic footer glyph; title/subtitle only.
2. **Email sign-up flow** — `supabase.auth.signUp` persists real user data (`display_name`, `full_name` in metadata). On success:
   - Signs out any auto-session (so user is not logged in immediately).
   - Shows brief success overlay.
   - Redirects to `/login?registered=1` (or `?registered=confirm` when email confirmation is required).
3. **Login success messages** — Arabic banners on login for `registered=1` and `registered=confirm`.
4. **OAuth enabled** — `signInWithOAuthProvider` in `src/lib/auth/oauth.ts`; buttons active on register (requires terms) and login.
5. **Callback route** — `/auth/callback` exchanges session, ensures profile row, refreshes auth, routes via `resolvePostAuthPath()` (username onboarding or home).

---

## Warnings

- **Supabase Dashboard** must have Google and Apple providers configured with redirect URL:  
  `https://<your-domain>/auth/callback`  
  (and `http://localhost:5173/auth/callback` for local dev).
- If email confirmation is enabled in Supabase Auth, users must confirm email before password login succeeds.
- OAuth from register skips the “go to login first” path by design — OAuth completes authentication in one step.

---

## Errors

None in build or static analysis.

---

## Recommendations

1. Configure Google OAuth Client ID and Apple Services ID in Supabase Auth → Providers.
2. Add production domain to Supabase Auth redirect allow list.
3. Optionally migrate login screen to `AlphaPremiumAuthShell` for visual parity with register (future task).

---

## Overall Status

**PASS**
