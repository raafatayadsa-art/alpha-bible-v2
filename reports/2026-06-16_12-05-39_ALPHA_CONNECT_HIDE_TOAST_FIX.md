# Alpha Connect — Hide/Show Toast & Hide Logic Fix

**Date:** 2026-06-16  
**Scope:** Toast visibility for hide/show conversation + hide logic refresh

---

## Executive Summary

Moved hide/show conversation feedback to a fixed top toast (`ConnectTopToast`) at the Alpha Connect screen level so messages like «تم إخفاء المحادثة» and «تم إظهار المحادثة» are clearly visible instead of being clipped at the bottom of conversation cards. Restored and reinforced hide conversation logic (swipe confirm, localStorage sync, list refresh on chat close).

---

## Findings

1. **Toast placement** — Local `convToast` rendered inside `MessagesLogCard` at `absolute bottom-4`, hidden behind cards and low z-index.
2. **Embedded chat** — `AlphaChatScreen` used a bottom fixed toast invisible in immersive layout.
3. **Hide flow** — Swipe-to-hide now opens `ConnectConfirmDialog` (tone: hide) before persisting to `HIDDEN_CONVS_KEY`.
4. **List sync** — `messagesListKey` increments when chat closes; `MessagesLogCard` remounts and reloads hidden IDs from localStorage.
5. **Regression fix** — Restored `ConnectCallPickerSheet` render accidentally removed during prior edit.

---

## Warnings

- User must create a secret code (≥4 chars) in message settings before hiding conversations; otherwise toast prompts to create one.
- Hidden conversations only appear when search query exactly matches the secret code.

---

## Errors

None during build verification.

---

## Recommendations

1. Manually test: swipe left → confirm hide → verify top toast and conversation removed from list.
2. Test hide from chat menu (embedded) → verify top toast and return to list with conversation hidden.
3. Enter secret code in search → swipe to unhide → verify «تم إظهار المحادثة في القائمة» toast.

---

## Overall Status

**PASS** — Build succeeded; toast and hide logic integrated.

---

## Files Changed

| File | Change |
|------|--------|
| `src/routes/alpha-connect.tsx` | `ConnectTopToast`, `showConnectToast`, hide confirm dialog, list refresh key |
| `src/components/alpha/AlphaChatScreen.tsx` | `onShowToast` prop routes to parent when embedded |
| `src/components/alpha/connect-code-ui.tsx` | `ConnectTopToast` component (existing) |
