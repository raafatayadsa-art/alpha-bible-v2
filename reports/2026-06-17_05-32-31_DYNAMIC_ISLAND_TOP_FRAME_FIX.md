# Dynamic Island Top Frame Fix

**Date:** 2026-06-17  
**Scope:** Alpha Connect, messaging, call routes — top safe-area / status-bar region  
**Build:** PASS

---

## Executive Summary

Removed a duplicate top background layer that appeared as a curved secondary frame directly below the iPhone Dynamic Island. The viewport backdrop now owns the single screen fill; the phone column stage and theme wrappers no longer paint a second radial gradient or header card strip on top.

---

## Findings

1. **Double radial gradient (primary cause)**  
   - `alpha-viewport-backdrop--connect-secure` and `.alpha-connect-theme` both applied `radial-gradient(ellipse at top, …)`.  
   - The viewport **stage** (`frameClassName` + theme CSS) sat above the fixed backdrop with the same ellipse, producing a visible curved “bowl” under the status bar — read as a second nested frame.

2. **Redundant Tailwind backgrounds on stage**  
   - `getAlphaConnectFrameClass()` added `bg-[#050814]` / `bg-[var(--connect-bg-app)]` on the stage, reinforcing the layered look.

3. **Classic header strip (secondary)**  
   - `.alpha-connect-theme--classic .connect-header` had a sage-mist gradient, blur, and bottom border — an extra horizontal frame under the safe area, separate from the main header content.

4. **Messaging duplicate**  
   - `/messages` applied `alpha-messaging-bg` on both the viewport stage and inner `<main>`, doubling the top radial highlight.

5. **Not the cause (confirmed)**  
   - No `rounded-t-*` on Connect header containers at the Dynamic Island level.  
   - Settings hero card (`ConnectSettingsLivePanel`) sits below the settings header, not under the status bar.

---

## Warnings

- Embedded Connect chat still uses `.connect-chat-surface` background intentionally (chat panel only, not top safe area).  
- Legacy shell routes (e.g. home) with local `fixed inset-0` backgrounds were not changed in this pass.

---

## Errors

None. `npm run build` — PASS.

---

## Recommendations

1. Hard-refresh Alpha Connect on device/simulator and confirm the top ellipse is gone in Secure and Classic themes.  
2. If any shell route still shows a double top glow, apply the same “backdrop-only fill” rule to that route’s inner fixed background.

---

## Changes Made

| File | Change |
|------|--------|
| `alpha-viewport.css` | Stage transparent when a viewport backdrop is present |
| `styles.css` | Removed `background` / `min-height` from `.alpha-connect-theme`; removed classic header strip bg; removed settings screen bg |
| `alpha-connect-theme.ts` | Frame class = theme tokens only (no bg/text utilities) |
| `AlphaMessagingSystem.tsx` | Removed duplicate `alpha-messaging-bg` from stage |
| `AlphaConversationsScreen.tsx` | Removed inner `alpha-messaging-bg` |
| `AlphaMessageSettings.tsx` | Removed inner `alpha-messaging-bg` |
| `AlphaChatScreen.tsx` | Removed standalone `alpha-chat-bg` (backdrop handles fill) |

Theme colors and header content/layout were preserved.

---

## Overall Status

**PASS**
