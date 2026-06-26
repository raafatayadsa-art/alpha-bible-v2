# Alpha Connect Migration — Remove Legacy Messaging

**Date:** 2026-06-22  
**Task:** Make Alpha Connect the only messaging system

---

## Executive Summary

Legacy standalone messaging (`/messages`, mock profile inbox, `AlphaMessagingSystem`) has been **removed or redirected** to **Alpha Connect**. Church message buttons, global search contacts, and church chat shortcuts now deep-link into `/alpha-connect?tab=messages&chat=…`. Build passes.

---

## Findings

### Files updated

| File | Change |
|------|--------|
| `src/routes/messages.tsx` | Redirect → `/alpha-connect?tab=messages` (or chat deep-link) |
| `src/routes/messages.chat.$contactId.tsx` | Redirect → Alpha Connect conversation |
| `src/routes/profile.messages.tsx` | Removed mock inbox UI; redirect → messages tab |
| `src/routes/church.chat.$contactId.tsx` | Redirect → Alpha Connect conversation |
| `src/routes/church.tsx` | `MessageRow` links → `/alpha-connect` |
| `src/routes/alpha-connect.tsx` | URL search supports `name`/`role`/`phone`; resolves church contacts |
| `src/features/alpha-connect/alpha-connect-nav.ts` | `buildAlphaConnectChatSearch`, extended route search |
| `src/features/search/contextual-search.ts` | Church contact results → Alpha Connect |
| `src/components/navigation/AlphaNavigationProvider.tsx` | Back fallback for legacy paths → `/alpha-connect` |
| `src/components/alpha/alpha-viewport.ts` | Legacy paths use Connect backdrop |
| `src/components/alpha/AlphaScreenFrame.tsx` | `/profile/messages` excluded from frame |
| `src/components/alpha/AlphaChatScreen.tsx` | Default `returnTo` → `/alpha-connect` |
| `src/components/alpha/AlphaMessagingSystem.tsx` | **Deprecated stub** (throws if called) |
| `src/components/alpha/AlphaConversationsScreen.tsx` | **Deprecated stub** |
| `src/data/church-contacts.ts` | Removed `SEED_CONVERSATIONS` mock chat history |
| `src/components/alpha/messaging-data.ts` | Documented as Connect contact directory (not mock UI) |

### Kept (Alpha Connect stack)

- `alpha_connect_conversations` / `alpha_connect_messages` (Supabase)
- `messages-api.ts`
- `useAlphaConnectThread.ts`
- `AlphaChatScreen` (**embedded in Alpha Connect only**)
- `messaging-data.ts` contact merge helpers (`conversationFromContact`, `buildConversationList`)

### Temporary redirects

| Legacy URL | Target |
|------------|--------|
| `/messages` | `/alpha-connect?tab=messages` |
| `/messages/chat/$contactId` | `/alpha-connect?tab=messages&chat=$contactId` |
| `/profile/messages` | `/alpha-connect?tab=messages` |
| `/church/chat/$contactId` | `/alpha-connect?tab=messages&chat=$contactId` |

---

## Legacy references found (intentional)

| Reference | Status |
|-----------|--------|
| `/messages` routes | Redirect stubs only |
| `AlphaMessagingSystem` | Deprecated empty stub |
| `AlphaConversationsScreen` | Deprecated empty stub |
| `messaging-data.ts` | **Active** — Connect contact directory + DB merge |
| `AlphaChatScreen` | **Active** — Alpha Connect embedded chat UI |

### Removed

| Item | Status |
|------|--------|
| `SEED_CONVERSATIONS` | **Removed** from `church-contacts.ts` |
| `INITIAL_MESSAGES` | **Not present** in codebase |
| Mock profile messages screen (~600 lines) | **Removed** |
| Standalone legacy chat routes rendering UI | **Removed** |

---

## Remaining references (non-legacy)

- `messages-api.ts` — Alpha Connect Supabase API (**keep**)
- Route tree still registers `/messages` paths for **redirect compatibility**
- Navigation/viewport checks for `/messages` paths during redirect transition

---

## Warnings

- `AlphaMessagingSystem.tsx` / `AlphaConversationsScreen.tsx` stubs can be deleted in a follow-up once no external imports remain.
- Deep-link search params `name`/`role`/`phone` are cleared on some in-app navigations — church redirects pass them on first open.

---

## Errors

None. `npm run build` — **PASS**.

---

## Recommendations

1. QA: Church → message priest/servant → opens Alpha Connect chat.
2. QA: `/messages`, `/profile/messages` redirect to Connect messages tab.
3. QA: Global search church contact → Alpha Connect.
4. Future: remove redirect route files after analytics show zero legacy URL hits.

---

## Overall Status

**PASS**
