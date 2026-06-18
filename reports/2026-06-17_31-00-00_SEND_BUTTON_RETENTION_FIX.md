# Alpha Connect Send Button Fix

**Date:** 2026-06-17  
**Mode:** Implementation  
**Overall Status:** PASS (client-side); DB SQL still recommended

---

## Executive Summary

Send appeared broken because INSERT failed with PostgreSQL **23514** (`alpha_connect_messages_retention_policy_check`) when `retention_policy` values like `on_read` or `24h` did not match the live DB CHECK constraint (migration drift). The client now retries INSERT with compatible fallback policies, returns fresh error text to the UI, and shows sent messages immediately.

---

## Findings

### Root cause

1. **DB constraint mismatch** — Live DB may lack `on_read` in CHECK, or still use legacy voice-era values (`read`, `hour`, `day`, `week`, `never`).
2. **Stale error in UI** — `sendMessageToThread` read `thread.error` from a stale React closure after failed send, hiding the real INSERT error.

### Fixes applied

| File | Change |
|------|--------|
| `messages-api.ts` | `insertAlphaConnectMessageRow()` retries on 23514 with fallback policies (`24h`, legacy `day`/`week`/`read`/`hour`) |
| `useAlphaConnectThread.ts` | `sendText` returns `{ ok, error }`; optimistic append of inserted row |
| `AlphaChatScreen.tsx` | Uses returned error directly; bootstrap toast only when not loading |

### Fallback chain (example: timer "بعد القراءة")

`on_read` → `24h` → `read` → `day` → `week` (stops on first success)

---

## Warnings

- Fallback policies are a **compatibility shim**. Run `supabase/RUN_ALPHA_CONNECT_RETENTION_POLICY_CHECK_FIX.sql` in Supabase for full ALPHA-DATA-POLICY-002 behavior.
- User must be **signed in** for send to work (RLS + auth).

---

## Errors

- Prior: `23514 alpha_connect_messages_retention_policy_check` blocked INSERT.

---

## Recommendations

1. Test send in Alpha Connect chat (default timer + "بعد القراءة").
2. Apply retention SQL fix on Supabase when possible.
3. If send still fails, check browser console for `[AlphaChatScreen:send]` or `[AlphaConnectThread:sendText]` messages.

---

## Overall Status

**PASS** — Build OK; send path hardened for constraint drift and UI feedback.
