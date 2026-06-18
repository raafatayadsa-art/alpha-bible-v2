# Message Delete for Both Parties

**Date:** 2026-06-17  
**Overall Status:** PASS (client) / PARTIAL (run SQL on Supabase)

---

## Executive Summary

Enabled **delete message** from the in-chat long-press menu. Deletion removes the row from Supabase so **both parties** lose the message via realtime sync.

---

## Changes

| Layer | Change |
|-------|--------|
| `messages-api.ts` | `deleteAlphaConnectMessage()` |
| `useAlphaConnectThread.ts` | `deleteMessage()` — optimistic UI + DB delete |
| `AlphaChatScreen.tsx` | Wired delete confirm; labels «حذف الرسالة» / «للطرفين» |
| SQL migration | RLS `alpha_connect_messages_member_delete` + `GRANT DELETE` |

---

## User Flow

1. Long-press message (or right-click on desktop)
2. Choose **حذف الرسالة**
3. Confirm → message disappears locally and for the other party

---

## Required SQL

Run: `supabase/RUN_ALPHA_CONNECT_MESSAGE_DELETE.sql`

---

## Overall Status

**PARTIAL** until SQL is applied on live Supabase.
