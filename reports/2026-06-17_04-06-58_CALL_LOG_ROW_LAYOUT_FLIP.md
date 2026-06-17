# Alpha Connect — Call Log Row Layout Flip

**Date:** 2026-06-17  
**Scope:** Individual tab call history list

---

## Executive Summary

Reversed the call log row layout so **avatar, name, and shield sit on the left** and **call/message buttons sit on the right**, matching the requested visual order while keeping Arabic name/shield text readable.

---

## Findings

- `RecentCallerRow` used the global RTL identity row pattern: identity block anchored to the right, trailing actions pushed to the left.
- User requested the opposite for the call log card only.

---

## Changes

| File | Change |
|------|--------|
| `src/routes/alpha-connect.tsx` | Added `connect-call-log-row` class to `RecentCallerRow` |
| `src/components/alpha/alpha-identity-layout.css` | LTR row + LTR identity block; RTL preserved inside name/shield and time meta |

**Resulting layout:** `[Avatar · Name · Shield · Time] ——— [Call] [Message]`

---

## Warnings

- Other Alpha Connect lists (messages, participants) keep the global RTL identity rule unchanged.

---

## Errors

None.

---

## Recommendations

- Verify on device in Classic and Secure themes.
- Confirm truncation still works for long Arabic names on narrow screens.

---

## Overall Status

**PASS**
