# Alpha Connect Conversation Open Fix

**Date:** 2026-06-17  
**Mode:** Implementation  
**Overall Status:** PASS

---

## Executive Summary

Conversations failed to open when DB purge RPC errored during conversation bootstrap, when list lookup missed static contacts, or when chat state remounted incorrectly. Fixed purge to be non-blocking, stabilized chat navigation, and added fallbacks.

---

## Findings

### Root causes

1. **`purgeExpiredAlphaConnectMessages` threw** if RPC missing — blocked `openAndEnsureAlphaConnectConversation` before chat could load.
2. **Immediate purge on thread mount** added latency/errors on every open.
3. **`openConversation(id)` silent fail** when `dbConversations.find` returned undefined.
4. **`/messages` without `ssr: false`** — hydration issues with localStorage/auth on client-only chat flow.
5. **Unstable chat remount** — missing `key` on `AlphaChatScreen` when switching contacts.

### Fixes

| File | Change |
|------|--------|
| `messages-api.ts` | Purge errors swallowed (warn only) |
| `useAlphaConnectThread.ts` | Removed purge-on-mount; interval only |
| `useAlphaConnectConversations.ts` | Silent background refresh (no loading flash) |
| `messages.tsx` | `ssr: false` |
| `alpha-connect.tsx` | `key={openChatConv.id}`, stable `closeOpenChat`, contact fallback |
| `AlphaMessagingSystem.tsx` | `key={activeProfile?.id}` on chat |
| `AlphaChatScreen.tsx` | Stable `onBackRef`, reset exit state per conversation |

---

## Warnings

- If open still fails, run Supabase SQL: `RUN_ALPHA_CONNECT_DIRECT_MESSAGING.sql` and sign in.

---

## Errors

None in build.

---

## Recommendations

1. Tap a conversation in Alpha Connect → Messages or `/messages`.
2. Chat should open immediately; DB errors show as toast but do not block UI.

---

## Overall Status

**PASS**
