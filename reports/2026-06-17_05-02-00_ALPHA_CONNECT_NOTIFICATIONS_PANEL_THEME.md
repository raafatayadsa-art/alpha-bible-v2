# Alpha Connect — Notifications Panel Theme Match

**Date:** 2026-06-17  
**Scope:** Restyle notifications panel when opened from `/alpha-connect` to match Connect participants list (`glass-strong`) DNA

---

## Executive Summary

When the user opens notifications from Alpha Connect, the panel now detects the route and applies the Connect theme (Secure or Classic) with the same `glass-strong` surface as the channel participants drawer. Church/cream styling is preserved everywhere else.

**Overall Status:** PASS

---

## Findings

### Detection
- Route check: `/alpha-connect` → `surface: "connect"`
- Theme sync via `getConnectTheme()` + `CONNECT_THEME_CHANGED_EVENT`

### Connect surface styling
| Element | Styling |
|---------|---------|
| Sheet background | `alpha-connect-theme` + `glass-strong` + `connect-notifications-panel` |
| Overlay | `bg-black/55 backdrop-blur-[2px]` (matches drawer) |
| Header / tabs borders | `border-white/10` |
| Back / mark-read buttons | `glass` circles (9×9) |
| Filter tabs | Active: `connect-notif-tab--active`; idle: `glass` |
| Empty / loading / cards | `glass` rows like participant list |
| Text | `text-foreground` / `text-muted-foreground` |

### Files changed
- `src/components/navigation/AlphaNotificationsPanel.tsx`
- `src/components/alpha/styles.css` — classic panel override + tab active states

### Unchanged
- Notifications from Home, Church, Bible, etc. keep cream `#fbf3e1` church styling

---

## Warnings

- Panel is portaled to `document.body`; theme classes are applied on the sheet itself so Connect CSS variables resolve correctly.
- `/call` and `/personal-call` still use church notifications styling if opened from there.

---

## Errors

None.

---

## Recommendations

1. Browser QA: open Alpha Connect → التنبيهات → verify Secure + Classic match participants drawer.
2. Open notifications from Home → confirm cream styling unchanged.

---

## Overall Status

**PASS**
