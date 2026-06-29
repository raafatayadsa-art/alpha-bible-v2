# Mobile Profile Open + Avatar Sync Fix (v2)

**Date:** 2026-06-27

---

## Executive Summary

Fixed profile screen not opening on mobile (infinite loaders / gate traps) and wrong avatar from stale device-only storage. Avatar now syncs to Supabase on save; cloud photo preferred over local base64 when logged in.

---

## Root Causes

1. **ProfileCompletionGate** — full-screen loader blocked `/profile` while RPC ran; RPC failure redirected to username onboarding.
2. **ProfileAuthGate** — waited on slow `getUser()` network; infinite spinner on weak mobile network.
3. **Avatar** — old `data:` URL in localStorage on mobile overrode cloud/OAuth photo from account.

---

## Fixes

- `fetchAuthUser()` uses `getSession()` first (local, fast on mobile).
- Profile routes bypass root completion-gate loading spinner.
- Profile completion RPC errors fail-open (no trap on bad network).
- `ProfileAuthGate` probes local session ≤2.5s then opens profile if session exists.
- `resolveProfileDisplayAvatar` prefers cloud URL over device-only base64.
- `syncLocalProfileAvatarFromCloud` on login refresh.
- `profile-avatar-api.ts` uploads cropped photo to storage + `user_profiles.avatar_url` on save.

---

## User Action

1. On mobile: log in with same email/password.
2. Open profile edit → save photo once (uploads to cloud).
3. All devices should match after refresh.

---

## Overall Status

**PASS** — build OK
