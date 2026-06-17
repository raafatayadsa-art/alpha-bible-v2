# Alpha Connect — Swipe Hide/Delete + Confirmation Fix

**Date:** 2026-06-16  
**Scope:** Enable swipe gestures with confirmation dialogs for all conversation actions

---

## Executive Summary

Fixed non-working swipe-to-hide/delete on Alpha Connect conversation cards and added confirmation dialogs for every swipe action (hide, unhide, delete) with top toast feedback after completion.

---

## Findings

1. **Stale `dx` bug** — `onTouchEnd` read React state `dx` (often `0`) instead of the final drag distance; swipe never triggered actions.
2. **Button capture** — Inner `<button>` on conversation rows intercepted touch/click; replaced with display-only row; tap handled by swipe wrapper.
3. **Unhide skipped confirm** — Secret-mode unhide ran immediately without dialog; now uses `ConnectConfirmDialog`.
4. **Delete had no toast** — After confirm delete, no user feedback; now shows «تم مسح المحادثة» via `ConnectTopToast`.
5. **Dialog visibility** — Confirm popups moved from scoped/card overlay to full-screen fixed (`zIndex: 270`).

---

## Warnings

- Swipe threshold remains 80px horizontal; vertical scroll uses `touch-action: pan-y`.
- Hide still requires secret code configured in message settings.

---

## Errors

None — `npm run build` PASS.

---

## Recommendations

Manual test matrix:
- Swipe right → delete confirm → confirm → toast + row removed
- Swipe left → hide confirm → confirm → toast + row hidden
- Secret code in search → swipe left → unhide confirm → confirm → toast

---

## Overall Status

**PASS**

---

## Swipe Directions

| Direction | Normal list | Hidden list (secret mode) |
|-----------|-------------|---------------------------|
| Right →   | Delete confirm | Delete confirm |
| Left ←    | Hide confirm   | Unhide confirm |
