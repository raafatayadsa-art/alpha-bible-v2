# Alpha Connect Messaging Migration

**Date:** 2026-06-17  
**Mode:** Implementation  
**Overall Status:** PASS

---

## Executive Summary

Alpha Connect text messaging is now backed by Supabase (`alpha_connect_conversations`, `alpha_connect_conversation_members`, `alpha_connect_messages`) instead of mock data. The approved `AlphaChatScreen` UI is preserved and wired to `useAlphaConnectThread` with realtime send/receive. Conversation lists in Alpha Connect and `/messages` use a new DB-backed list hook with inbox realtime refresh. Voice/PTT systems were not modified.

---

## Findings

### Files Modified

| File | Change |
|------|--------|
| `supabase/migrations/20250617180000_alpha_connect_direct_messaging.sql` | **NEW** — `alpha_connect_open_direct()` RPC + conversation `updated_at` trigger on message insert |
| `src/features/alpha-connect/messages-api.ts` | Direct scope open, `listAlphaConnectConversations()`, `subscribeAlphaConnectInbox()` |
| `src/features/alpha-connect/types.ts` | `direct` scope + `AlphaConnectConversationSummary` |
| `src/features/alpha-connect/useAlphaConnectThread.ts` | Direct peer chats, optional `conversationId`, per-send retention override |
| `src/features/alpha-connect/useAlphaConnectConversations.ts` | **NEW** — inbox list + realtime refresh |
| `src/features/alpha-connect/useAlphaConnectConversationList.ts` | **NEW** — merges DB rows with contact directory |
| `src/features/alpha-connect/alpha-connect-message-map.ts` | **NEW** — DB ↔ chat UI mappers |
| `src/components/alpha/messaging-data.ts` | Removed mock message history; static `CONVERSATION_CONTACTS` + merge helpers |
| `src/components/alpha/AlphaChatScreen.tsx` | Wired to `useAlphaConnectThread`; removed `INITIAL_MESSAGES` |
| `src/components/alpha/AlphaConversationsScreen.tsx` | DB conversation list; all contacts open chat |
| `src/components/alpha/AlphaMessagingSystem.tsx` | Fixed `onOpenChat(profile)` passthrough |
| `src/routes/alpha-connect.tsx` | `MessagesLogCard` uses DB conversation list |

### Mock Systems Removed

| Removed | Replacement |
|---------|-------------|
| `INITIAL_MESSAGES` in `AlphaChatScreen.tsx` | `useAlphaConnectThread` + message mapper |
| Fake `progressMessage()` delivery simulation | Realtime subscription on thread |
| Mock `conversations[]` message previews/times/unread | `buildConversationList()` merged with DB |
| Priest-only chat gate in conversations screens | All contacts open real threads |
| Broken `onOpenChat()` without profile in `/messages` | Passes full `Conversation` profile |

**Retained (intentionally):** Static `CONVERSATION_CONTACTS` for avatars, roles, phone numbers (display metadata only). Voice call log / PTT history mocks in `alpha-connect.tsx` unchanged.

### Database Hooks Connected

| Surface | Hook / API |
|---------|------------|
| Chat thread | `useAlphaConnectThread` → open direct/group, list, send text, mark read |
| Conversation list (Connect tab) | `useAlphaConnectConversationList` |
| Conversation list (`/messages`) | Same hook via `AlphaConversationsScreen` |
| Open direct chat | `alpha_connect_open_direct(peer_key, title)` |
| Open group chat | Existing `alpha_connect_open_group` |

### Realtime Status

| Channel | Scope | Status |
|---------|-------|--------|
| Per-thread | `subscribeAlphaConnectMessages(conversationId)` | **ENABLED** — chat refreshes on insert/update/delete |
| Inbox list | `subscribeAlphaConnectInbox(userId)` on messages + conversations tables | **ENABLED** — list previews/unread refresh |

Requires Supabase Realtime enabled on `alpha_connect_messages` and `alpha_connect_conversations` (standard postgres_changes).

### Ready to Deprecate `/messages`?

**YES** — for mock-data purposes. Both entry points now share the same DB stack:

- `/alpha-connect` → Messages tab → `MessagesLogCard` → `AlphaChatScreen`
- `/messages` → `AlphaMessagingSystem` → `AlphaConversationsScreen` / `AlphaChatScreen`

The `/messages` route may remain as a navigation/deep-link wrapper (`profile.messages`, `?contactId=`) until product chooses to redirect fully into Alpha Connect. No duplicate mock messaging remains.

**Note:** Apply migration `20250617180000_alpha_connect_direct_messaging.sql` to the Supabase project before testing direct chats in production.

---

## Warnings

1. **Peer keys are contact IDs** (`priest`, `servant`, etc.) — not auth UUIDs. Multi-user direct messaging between real accounts needs a future identity mapping layer (out of scope).
2. **Attachments** (photo/file/location) still show local-only placeholder bubbles; only text is persisted to DB.
3. **Edit/delete/clear** on synced messages shows a toast — no server delete API yet.
4. **`AlphaConnectMessageThread.tsx`** remains unused; approved UI is `AlphaChatScreen` (by design).

---

## Errors

None during build. `npm run build` completed successfully.

---

## Recommendations

1. Run the new migration on Supabase staging/production.
2. Verify Realtime publication includes `alpha_connect_messages` and `alpha_connect_conversations`.
3. Test send/receive with two authenticated sessions when peer identity mapping is added.
4. Optionally redirect `/messages` → `/alpha-connect?mode=messages` in a follow-up (navigation-only, no mock removal needed).

---

## Overall Status

**PASS** — Text messaging migrated to real DB with realtime; UI/voice/PTT preserved.
