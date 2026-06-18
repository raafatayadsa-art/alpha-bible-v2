# Alpha Connect Auto-Delete Activation

**Date:** 2026-06-17  
**Mode:** Implementation  
**Overall Status:** PASS (client active; run SQL for server cron)

---

## Executive Summary

Automatic message deletion is now active in the app: timed messages expire via `expires_at`, on-read messages delete when consumed, and the client runs periodic purge + UI pruning. Server-side pg_cron purge SQL is provided for background deletion when the app is closed.

---

## Findings

### How auto-delete works

| Mode | Mechanism |
|------|-----------|
| **بعد القراءة / on_read** | `read_at` set → DB trigger deletes row (+ storage) |
| **Timed (1h–7d)** | `expires_at` set on INSERT → purge RPC removes expired rows |
| **Chat timer** | Each send uses `timerLabelToRetention(timer)` in `AlphaChatScreen` |

### Client changes

| File | Change |
|------|--------|
| `retention.ts` | `isMessageExpired`, `filterActiveAlphaConnectMessages`, legacy `read` support |
| `useAlphaConnectThread.ts` | Prune every 30s; purge RPC every 2min; on_read removal on markRead |
| `messages-api.ts` | List filters expired messages |
| `useAlphaConnectConversations.ts` | Purge on refresh + 2min inbox janitor |
| `AlphaChatScreen.tsx` | Auto markRead only for on_read/read policies |

### Database (run once)

`supabase/RUN_ALPHA_CONNECT_AUTO_DELETE.sql`:
- `alpha_connect_set_message_expiry` trigger
- `alpha_connect_on_message_consumed` (on_read/read)
- `alpha_connect_purge_expired_messages` RPC
- pg_cron every 15 minutes
- Backfill `expires_at` for existing timed rows

Also run if not done: `RUN_ALPHA_CONNECT_RETENTION_POLICY_CHECK_FIX.sql`

---

## Warnings

- pg_cron requires Supabase Pro/plan with cron enabled.
- Without SQL apply, client still prunes UI and calls purge RPC while app is open.

---

## Errors

None in build.

---

## Recommendations

1. Run `supabase/RUN_ALPHA_CONNECT_AUTO_DELETE.sql` in Supabase SQL Editor.
2. Test: send with timer "٣٠ دقيقة", wait or set short policy; message should disappear after expiry.
3. Test: timer "بعد القراءة" — incoming message deletes when chat opens.

---

## Overall Status

**PASS**
