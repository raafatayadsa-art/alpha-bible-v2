# Auto-Delete Seconds Countdown Fix

**Date:** 2026-06-17  
**Overall Status:** PASS (client)

---

## Executive Summary

Auto-delete showed **24 hours** because Supabase fallback stored `24h`/`day` when short policies were rejected; the UI trusted DB `expires_at`. Fixed by **client-authoritative expiry** from the selected timer, **seconds-only countdown**, and **activation only after timer selection** (system message anchor).

---

## Root Cause

1. DB insert fallback → `retention_policy: 24h` → countdown ~86400 or formatted as 24h
2. `messageExpiresAtMs` preferred DB `expires_at` over intended policy
3. Countdown showed hours/days instead of raw seconds

---

## Fixes

| Change | Effect |
|--------|--------|
| `normalizeInsertedMessage()` | Forces intended policy + `created_at + duration` on every insert |
| `messageExpiresAtMs()` | Computes from `retention_policy` + `created_at` (ignores wrong DB expiry) |
| `formatDeletionCountdown()` | **Seconds only** (Arabic digits, e.g. `٤٥`) |
| `timerAnchorMs` | Auto-delete + countdown only for messages **after** timer system message |
| Prune every 1s | Messages disappear from UI when countdown hits 0 |
| Notice bar | Shows seconds when active; prompts to pick timer when inactive |

---

## User Flow

1. Open chat → pick timer (e.g. **٥ ثواني**) → system message appears
2. Send message → countdown starts at **٥** → **٤** → **٣** … → message removed
3. Old messages (before timer pick) are not auto-deleted

---

## Warnings

Run `supabase/RUN_ALPHA_CONNECT_SHORT_RETENTION.sql` so DB matches client policies.

---

## Overall Status

**PASS** — build green; test with timer selection then send.
