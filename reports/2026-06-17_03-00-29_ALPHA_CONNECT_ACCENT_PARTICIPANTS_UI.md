# Alpha Connect — Accent Green, Participants & UI Polish

**Date:** 2026-06-17  
**Scope:** Alpha Connect Classic + Secure themes (`.alpha-connect-theme` only)

---

## Executive Summary

Applied user-requested UI polish across Alpha Connect: darker distinctive forest-green accent for mode tabs, mic/call/dock icons, and channel action bar; red channel admin name; subtle QR glow; participants drawer layout with right-aligned names and left-side mute/speaker badges.

Build: **PASS** (`npm run build` exit 0).

---

## Findings

### Mode switcher (إتصال / الرسائل / القنوات)
- Replaced faint sage/light-green sliding pill with **dark green gradient** (`#2d6a4f → #1b4332`).
- Active tab label: **white**; inactive: **forest deep green**.
- Classic theme tab tokens updated (`--connect-tab-active-*`).

### Icons — mic, call, bottom dock, channel bar
- New CSS tokens: `--connect-accent`, `--connect-accent-mid`, `--connect-accent-bright`.
- Classes: `connect-accent-icon`, `connect-dock-icon`, `connect-action-bar-icon`.
- Mic recorder changed from `tone="blue"` to `tone="green"` with accent styling.
- Bottom nav: all icons use dark green; active tab gets brighter green + subtle glow.

### Channel admin name
- Header line `مسؤول: {name}` — admin name rendered in **red** (`text-destructive`).

### QR subtle glow
- Flat QR canvas: `drop-shadow` + radial `::before` halo (very subtle green emanation).

### Participants drawer
- Names aligned **right** (`text-right`, `justify-end`).
- **Left column** status badges:
  - `MicOff` red badge when muted.
  - `Ear` green badge when `canMemberSpeakInChannel()` and not muted.
- `talkPermission` passed from `channelState.settings.talkPermission`.
- Helper `canMemberSpeakInChannel` in `connect-channel-state.ts`.

### Settings toggles (Classic)
- ON state border/background strengthened for clearer visual feedback.

---

## Warnings

- Secure (dark) theme uses slightly brighter green (`#40916c`) on dark backgrounds for legibility; Classic uses deeper `#1b4332`.
- Speaker badge shows for members allowed to talk per channel policy — not a live “currently speaking” indicator.

---

## Errors

None.

---

## Recommendations

1. Manually verify participants drawer in RTL on device (avatar right, badges left).
2. Test all three `talkPermission` modes (`everyone`, `admins_only`, `super_admin_only`) for correct Ear badge visibility.
3. Confirm mode tab contrast in both Classic and Secure themes on real screens.

---

## Overall Status

**PASS**

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/alpha/styles.css` | Accent tokens, mode tabs, dock, badges, QR glow, Classic overrides |
| `src/routes/alpha-connect.tsx` | ModeSwitcher, BottomNavBar, mic tone, talkPermission prop |
| `src/components/alpha/ConnectChannelsUI.tsx` | Admin red, participants layout, accent icons |
| `src/components/alpha/ConnectCircleButton.tsx` | Accent icon classes |
| `src/components/alpha/ConnectChannelIconView.tsx` | Accent icon class |
| `src/components/alpha/connect-channel-state.ts` | `canMemberSpeakInChannel()` |
