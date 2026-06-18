# Global Notification Panel Hide Fix

**Date:** 2026-06-17  
**Scope:** Hide top notification UI when closed — app-wide  
**Status:** PASS

---

## Executive Summary

The global **`AlphaNotificationsPanel`** was always mounted in `document.body` with `translateY(-100%)` from a **vertically centered** position, leaving a visible glass strip at the top of every screen. It now **unmounts completely when closed** and slides from the **top** only when opened via the notification button.

Secondary overlay **`NotificationsCenter`** (Katameros, Synaxarium, Feasts) also unmounts when `open={false}`.

---

## Root Cause

| Issue | Detail |
|-------|--------|
| Always in DOM | Provider rendered panel even when `open === false` |
| Wrong closed transform | `items-center` + `translateY(-100%)` parked sheet bottom edge at ~top of viewport |
| Visible peek | `glass-strong` / shadow visible behind header & Dynamic Island |

---

## Component Responsible

**`AlphaNotificationsPanel`** — `src/components/navigation/AlphaNotificationsPanel.tsx`  
Mounted by **`AlphaNotificationsProvider`** inside **`AlphaNavigationProvider`** (global).

Opens via **`AlphaNotificationButton`** → `toggleNotifications()`.

---

## Files Modified

1. `src/components/navigation/AlphaNotificationsProvider.tsx` — conditional mount `{open ? <Panel /> : null}`
2. `src/components/navigation/AlphaNotificationsPanel.tsx` — top-aligned sheet; removed closed-state DOM
3. `src/components/overlays/NotificationsCenter.tsx` — `if (!open) return null`

---

## Findings

- When closed: **zero notification DOM** — no container, preview, drawer, or overlay at top
- When open: Dynamic Island → safe-area → header area → sheet from top (intentional modal)
- `/church/notifications` redirect still opens panel via button flow
- Alpha Connect bell still uses same global panel

---

## Warnings

- Open/close no longer animates from off-screen parked state (instant mount/unmount)
- Drag-down-to-close still works while panel is open

---

## Errors

None.

---

## Recommendations

- Consider removing duplicate `NotificationsCenter` on Katameros/Synaxarium if global panel is sufficient
- Visual QA on iPhone with Dynamic Island + all main routes

---

## Overall Status

**PASS** — Notification panel not visible on any screen unless explicitly opened.
