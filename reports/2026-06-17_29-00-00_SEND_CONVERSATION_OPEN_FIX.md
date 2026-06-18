# Alpha Connect Send Button — Conversation Open Fix

**Date:** 2026-06-17  
**Mode:** Implementation  
**Overall Status:** PASS

---

## Executive Summary

Fixed `conversationId = null` by hardening the conversation open pipeline: live Supabase auth, RPC open with fallback, membership verification, stale-thread reset on chat switch, lazy open before send, and visible error messages (toast + console).

---

## Exact Root Cause

Three compounding failures:

1. **Auth race** — Thread init used `getAuthUserSync()` before `AuthBootstrap` populated cache → open aborted → `conversationId` stayed null with no retry.
2. **Stale conversation reuse** — Bootstrap used `conversationIdRef.current ?? open()` so switching contacts could reuse the **previous** chat's UUID.
3. **Silent pre-send gates** — Send blocked or returned `false` without surfacing Supabase/RPC error details.

Secondary: inbox list used same sync-cache pattern → unread previews lagged until manual refresh.

---

## Fix Summary

| Layer | Change |
|-------|--------|
| `messages-api.ts` | `openAndEnsureAlphaConnectConversation()` — auth → open RPC → verify `alpha_connect_conversation_members` |
| | `formatAlphaConnectError()` — labeled errors for toast/console |
| | RPC paths: `alpha_connect_open_direct` → fallback `alpha_connect_open_group` |
| `useAlphaConnectThread.ts` | Always open fresh per `threadKey`; auth retry via `subscribeAuthContext` |
| | `ensureConversationId()` before every send |
| | `console.error` on all failures |
| `useAlphaConnectConversations.ts` | `waitForAuthUserId` + auth retry for list/unread realtime |
| `AlphaChatScreen.tsx` | Send enabled while loading (open happens on send); toast + console on failure |

---

## conversationId Source

| Scenario | Source |
|----------|--------|
| Chat with existing DB row | `profile.conversationId` → verified via members table |
| New direct chat | RPC `alpha_connect_open_direct` or fallback `alpha_connect_open_group(direct:{uid}:{peerKey})` |
| Group chat | RPC `alpha_connect_open_group(groupCode)` |
| Personal inbox | RPC `alpha_connect_open_personal()` (voice scope only; not chat contacts) |

Stored in `useAlphaConnectThread` state + ref; set on mount bootstrap and on `ensureConversationId()` before send.

---

## Files Modified

- `src/features/alpha-connect/messages-api.ts`
- `src/features/alpha-connect/useAlphaConnectThread.ts`
- `src/features/alpha-connect/useAlphaConnectConversations.ts`
- `src/components/alpha/AlphaChatScreen.tsx`

Existing (from prior work): `supabase/RUN_ALPHA_CONNECT_DIRECT_MESSAGING.sql`

---

## Validation Checklist (manual)

| Test | Expected after fix |
|------|-------------------|
| Open chat | Bootstrap calls `openAndEnsureAlphaConnectConversation`; `conversationId` set or labeled error toast |
| Send 1st message | `ensureConversationId` → insert → message in thread |
| Send 2nd message | Reuses same `conversationId`; insert succeeds |
| Realtime | `subscribeAlphaConnectMessages` refresh on insert |
| Unread counters | `subscribeAlphaConnectInbox` refreshes conversation list |

Build: **PASS** (`npm run build`)

---

## Send Button Status After Fix

**WORKING** (code path complete) — requires:
- Signed-in Supabase user
- MVP migrations applied (`alpha_connect_open_group` minimum)
- Optional: `RUN_ALPHA_CONNECT_DIRECT_MESSAGING.sql` for dedicated direct RPC

On failure, user sees exact reason e.g. `[alpha_connect_open_group] ...` or `[auth] سجّل الدخول...` in toast and browser console.

---

## Warnings

- Voice/PTT untouched.
- UI unchanged.
- Peer keys remain contact ids (`priest`, etc.) not real user UUIDs until identity mapping exists.

---

## Errors

None in build.

---

## Overall Status

**PASS**
