# Mobile Login & Profile Identity Fix

**Date:** 2026-06-27

---

## Executive Summary

Explained and fixed why profile showed a different name/photo without login on mobile. Profile routes now require authentication; membership data binds to live auth state; session refreshes on mobile focus/visibility.

---

## Root Cause (User Question)

1. **Profile opened without login** — `/profile` had no auth gate. Guest saw `"مستخدم Alpha"` + device-local photo from `localStorage`, not cloud account.
2. **Stale auth snapshot** — profile used `getCurrentUser()` sync without subscribing to auth load completion.
3. **Mobile session** — returning to Safari/PWA did not always refresh Supabase session before UI rendered.

Login failure on mobile (separate): often email not confirmed, network, or OAuth redirect — user sees Arabic error on login form.

---

## Fixes Applied

| File | Change |
|------|--------|
| `ProfileAuthGate.tsx` | New gate + login prompt for unauthenticated users |
| `ProfilePremiumScreen.tsx` | Wrapped in auth gate |
| `ProfileEditScreen.tsx` | Auth gate + `useAlphaAuth()` for name/avatar |
| `useProfileMembershipData.ts` | `useAlphaAuth()` instead of `getCurrentUser()` |
| `auth-context.ts` | Refresh session on `visibilitychange`, `focus`, `pageshow` |
| `login.tsx` + `AlphaAuthScreens.tsx` | `?redirect=` after successful login |

---

## Warnings

- Custom avatar still device-local until Supabase upload is implemented.
- Email confirmation still required if Supabase enforces it.

---

## Errors

None. Build: **PASS**

---

## Overall Status

**PASS**
