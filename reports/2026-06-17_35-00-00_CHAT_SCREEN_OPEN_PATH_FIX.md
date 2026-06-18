# Chat Screen Open Path Fix

**Date:** 2026-06-17  
**Scope:** Alpha Connect + `/messages` chat navigation  
**Overall Status:** PASS

---

## Executive Summary

The chat screen failed to open because `AlphaChatScreen` referenced `countdownTick` in a `useMemo` **before** the state hook was declared, causing a runtime `ReferenceError` on every mount. Navigation was also state-only (no URL), making chat fragile and hard to deep-link. Fixes: hook order corrected, dedicated route `/messages/chat/$contactId` added, Alpha Connect syncs `?chat=` search param, legacy `/church/chat/$contactId` redirects to the new path.

---

## Findings

1. **Root crash (critical):** In `AlphaChatScreen.tsx`, `dbMessages` used `countdownTick` at line ~135 while `useState` for `countdownTick` was declared ~20 lines later — temporal dead zone error at render time.
2. **No stable chat URL:** Opening a conversation only toggled React state; refresh or remount returned to the list.
3. **Split messaging paths:** Church search and old route pointed to `/church/chat/$contactId` (mock UI), not Alpha Connect chat.
4. **Alpha Connect:** Chat opened via `setOpenChatConv` only; no URL sync for back/deep-link.

---

## Fixes Applied

| Area | Change |
|------|--------|
| `AlphaChatScreen.tsx` | Moved `countdownTick` state above `dbMessages` useMemo |
| `messages.chat.$contactId.tsx` | New route renders `AlphaChatScreen` with DB-backed profile resolution |
| `messages.tsx` | Redirects legacy `?contactId=` search to `/messages/chat/$contactId` |
| `AlphaMessagingSystem.tsx` | `navigateToAlphaChat()` — list taps navigate to dedicated route |
| `alpha-connect.tsx` | `?chat=contactId` search param; `openConnectChat` / `closeOpenChat` URL sync |
| `church.chat.$contactId.tsx` | Redirect to `/messages/chat/$contactId` |
| `church.tsx`, `contextual-search.ts` | Links updated to new chat path |
| `AlphaScreenFrame`, `AlphaNavigationProvider` | Treat `/messages/*` like `/messages` |

---

## Warnings

- User must be signed in for Supabase thread bootstrap; unsigned users may see empty thread with toast.
- DB migrations for Alpha Connect messaging must still be applied on Supabase if not already.
- `/alpha-connect?chat=priest` opens embedded chat; `/messages/chat/priest` opens standalone messaging shell.

---

## Errors

None in build after fix (`npm run build` — PASS).

---

## Recommendations

1. Manually test: Alpha Connect → الرسائل → المحادثات → tap conversation → chat opens.
2. Manually test: `/messages` → tap conversation → URL becomes `/messages/chat/{id}`.
3. Manually test: Church contact message link → lands on Alpha chat, back returns to church.
4. Run retention/auto-delete SQL scripts if send still fails with constraint 23514.

---

## Test Plan

- [ ] Open chat from Alpha Connect messages list
- [ ] Open chat from `/messages` list
- [ ] Browser back from chat returns to list
- [ ] Direct URL `/messages/chat/priest` loads chat
- [ ] `/church/chat/{id}` redirects correctly
- [ ] Send message works when authenticated + DB ready

---

## Overall Status

**PASS** — crash fixed, routes wired, build green.
