# Alpha Connect — Conversation Clear Choice (Both Parties)

**Date:** 2026-06-17  
**Scope:** Swipe-to-delete conversation flow with local vs both-party clear

---

## Executive Summary

Added a two-option delete dialog when swiping to delete a conversation in **Messages list** and **Alpha Connect Messages log**. Users can choose **«من قائمتي فقط»** (hide locally, previous behavior) or **«مسح للطرفين»** (delete all messages from the database for both mirrored direct threads).

---

## Findings

### UI changes
- **`AlphaConversationsScreen.tsx`**: Delete confirm popup now shows three actions — مسح للطرفين / من قائمتي فقط / إلغاء.
- **`alpha-connect.tsx` (`MessagesLogCard`)**: Uses new `ConnectConversationDeleteDialog` with the same choices.
- **`connect-code-ui.tsx`**: New `ConnectConversationDeleteDialog` component (Connect dark theme).

### API / backend
- **`messages-api.ts`**: `clearAlphaConnectConversation()` opens/ensures conversation then calls RPC.
- **`clearConversation.ts`**: Helper maps `Conversation` → scope/peerKey/groupCode.
- **SQL RPC** `alpha_connect_clear_conversation(p_conversation_id, p_for_both)`:
  - Verifies membership.
  - Deletes all messages in the user's conversation.
  - When `p_for_both = true` on direct threads:
    - Clears reciprocal `direct:{peer_uuid}:{owner}` when peer is a UUID.
    - Clears mirror threads `direct:{sender_id}:{current_user}` for each distinct sender in the conversation (covers priest/symbolic peer replies).

### Files added
- `supabase/migrations/20250617240000_alpha_connect_clear_conversation.sql`
- `supabase/RUN_ALPHA_CONNECT_CLEAR_CONVERSATION.sql`
- `src/features/alpha-connect/clearConversation.ts`

---

## Warnings

1. **Run SQL on Supabase** before testing «مسح للطرفين» in production:
   - Execute `supabase/RUN_ALPHA_CONNECT_CLEAR_CONVERSATION.sql` in the SQL Editor.
2. **Symbolic peer keys** (e.g. `priest`): both-party clear relies on sender UUIDs from existing messages. If the user sent messages but the peer never replied, only the user's thread is cleared server-side (peer may still have an empty thread).
3. **Local-only delete** remains session/device state (`deletedConvIds`) — not persisted to DB.

---

## Errors

None during `npm run build`.

---

## Recommendations

1. Run `RUN_ALPHA_CONNECT_CLEAR_CONVERSATION.sql` on Supabase.
2. Test swipe-delete on `/messages` and `/alpha-connect` with both options.
3. Verify realtime: open same chat on two accounts, clear «للطرفين», confirm messages disappear on both sides.

---

## Overall Status

**PASS** — Implementation complete; pending Supabase RPC deployment for full both-party delete.

---

## COPYABLE REPORT

```
ALPHA CONNECT — CONVERSATION CLEAR CHOICE
Status: PASS (pending SQL deploy)
Date: 2026-06-17

Summary:
- Swipe delete now offers: «من قائمتي فقط» OR «مسح للطرفين»
- Both-party uses RPC alpha_connect_clear_conversation
- Screens: AlphaConversationsScreen, alpha-connect MessagesLogCard

Action required:
Run supabase/RUN_ALPHA_CONNECT_CLEAR_CONVERSATION.sql on Supabase

Build: npm run build — OK
```
