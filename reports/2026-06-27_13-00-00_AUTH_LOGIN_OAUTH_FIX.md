# Auth Login & OAuth Fix

**Date:** 2026-06-27  
**Scope:** Sign-up/login/OAuth client fixes

---

## Executive Summary

Fixed post-registration login errors (mostly unconfirmed email misreported as invalid credentials) and repaired Google/Apple OAuth by enabling PKCE + explicit `exchangeCodeForSession` on `/auth/callback`. Build: **PASS**.

---

## Findings

### Login after registration
- Supabase often returns **"Invalid login credentials"** when email is **not confirmed** — not a wrong password.
- Sign-up now detects duplicate accounts (`identities.length === 0`) and distinguishes **ready_to_login** vs **confirm_email**.
- Login pre-fills email from registration redirect and shows clearer Arabic messages.
- After registration with `registered=confirm`, failed login maps to email-confirmation guidance.

### Google / Apple OAuth
- Root cause: callback called `getSession()` before PKCE code exchange.
- Fixes:
  - `flowType: "pkce"` on Supabase client
  - `completeOAuthCallback()` → `exchangeCodeForSession(code)`
  - Manual redirect fallback when `signInWithOAuth` returns `data.url`
  - Email confirmation links use `/auth/callback` redirect

---

## Warnings

**Supabase Dashboard (required for OAuth):**
1. Authentication → Providers → enable **Google** and **Apple**
2. Authentication → URL Configuration → add redirect URLs:
   - `http://localhost:5173/auth/callback` (or your dev port)
   - `https://YOUR-PRODUCTION-DOMAIN/auth/callback`

**Email confirmation:**
- If enabled, users must click the email link before password login works.
- To allow immediate login after sign-up: Auth → Providers → Email → disable **Confirm email**.

---

## Errors

None in build.

---

## Recommendations

1. Verify OAuth providers and redirect URLs in Supabase Dashboard.
2. Decide whether email confirmation should stay on; adjust UX copy accordingly.
3. Test OAuth on the same browser/device where the flow started (PKCE requirement).

---

## Overall Status

**PASS** (client fixed; OAuth requires dashboard provider setup)
