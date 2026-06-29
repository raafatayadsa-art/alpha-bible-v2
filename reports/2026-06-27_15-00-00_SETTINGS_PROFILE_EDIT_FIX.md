# Settings & Profile Edit Open Fix

**Date:** 2026-06-27

---

## Executive Summary

Fixed settings and profile edit screens not opening due to auth/completion gates blocking navigation.

---

## Root Causes

1. **ProfileAuthGate** blocked `/profile/edit` and `/profile` when session probe failed or user was guest.
2. **ProfileCompletionGate** showed full-screen loader on `/settings` and redirected away from profile/settings routes when username RPC was pending.

---

## Fixes

- Removed ProfileAuthGate wrapper from profile and profile edit screens.
- Removed full-screen blocking loader from ProfileCompletionGate.
- Skip username redirect on `/settings`, `/profile`, `/home`, etc.
- Added 6s timeout on profile completion RPC (fail-open).
- Added 8s timeout on auth sync for slow mobile networks.
- Avatar menu: settings always visible; edit opens `/profile/edit`; guest can open menu.

---

## Overall Status

**PASS** — build OK
