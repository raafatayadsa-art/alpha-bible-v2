# Alpha Connect UX & Layout Cleanup — Implementation Report

**Date:** 2026-06-18  
**Scope:** 13-item UX cleanup (no redesign)

---

## Executive Summary

Alpha Connect received a focused UX and layout cleanup preserving existing design DNA and functionality. Bottom navigation now uses per-tab active styling, correct tab order (Channels centered, Calls renamed to **اتصال**), global safe-area clearance, single-item previews with **عرض المزيد**, invite sheet clearance above nav, rebuilt call-log identity row, gold user code under QR, channel recordings history section, unified dock system for app navs, and theme token foundations for light/dark Connect themes.

**Build:** `npm run build` — **PASS** (exit 0)

---

## Findings

### 1. Bottom Navigation Safe Area
- Added `alpha-connect-layout.ts` with `--alpha-connect-nav-clearance` CSS variable.
- Content padding uses `pb-[var(--alpha-connect-nav-clearance)]` on Alpha Connect main screen and Settings.
- Nav is `z-40`; invite sheet `z-60` with `margin-bottom` equal to nav clearance so panel stops above dock.

### 2. Calls Screen — Preview Limit
- `CONNECT_ACTIVITY_PREVIEW_LIMIT = 1` replaces prior limit of 3.
- `CallLogCard` shows most recent call only; **عرض المزيد** expands full history.

### 3. Messages Screen — Preview Limit
- Conversation list shows latest conversation only; **عرض المزيد** expands full list.
- Default `messagesTab` changed from `voice` to `conversations` for message-first entry.

### 4. Channel Invite Sheet
- `ConnectChannelInviteSheet` panel uses `mb-[var(--alpha-connect-nav-clearance)]` — no overlap with bottom nav.

### 5. Settings Tab Active State
- Root cause fixed: `.connect-dock-icon` previously colored **all** icons green.
- Idle tabs: muted foreground (`oklch(0.98 / 0.52)`).
- Active tab only: accent color + subtle pill background + glow.
- Classic theme: muted idle, forest-deep active on tab pill only.

### 6. Navigation Order
- Order (RTL): **Alpha · الإعدادات · القنوات (center) · الرسائل · اتصال**
- Calls label renamed from **مكالمات** to **اتصال**.
- Channels tab elevated with `connect-dock-tab--center`.

### 7. Global Shield Alignment
- New `.alpha-identity-shield-slot` (1.75rem × 1.75rem) applied globally.
- Participant rows and call-log rows use identical shield dimensions.

### 8. Call History Layout
- Call-log row grid: `avatar | name+shield inline | call+message buttons`.
- Name and shield share one identity line; actions separated on trailing edge.

### 9. User Code Under QR
- `ConnectPremiumQrBadge`: warm gold tokens `--connect-code-gold` / `--connect-code-gold-muted`.
- Larger font, tracking, drop-shadow for contrast.

### 10. Channel Recordings History
- New `ChannelRecordingsHistoryCard` under channel action bar.
- Title: **سجل تسجيلات القناة**; latest recording + **عرض المزيد**.

### 11. Responsive Bottom Navigation
- Connect nav: `sm:` breakpoints for icon size, padding, gap, label size.
- Shared `alpha-dock-system.css` responsive tab sizing.

### 12. Unified Navigation Design System
- New `alpha-dock-system.css` — shared bar shape, pill active state, elevation.
- Applied to: `AlphaConnectBottomNavigation`, `BottomDock` (Home), `BibleBottomNavigation` (Bible/Library).
- Icons/labels unchanged per screen; DNA unified.

### 13. Dark / Light Mode
- Connect theme tokens extended: nav clearance, code gold, dock idle/active via CSS variables.
- Classic light theme dock rules corrected (no full-bar green).
- **Partial:** Feature-specific navs (`AlphaBottomNavigation` legacy messaging) and full app-wide hardcoded color audit remain for follow-up.

---

## Files Modified

| File | Change |
|------|--------|
| `src/features/alpha-connect/alpha-connect-layout.ts` | **NEW** — nav clearance + preview limit |
| `src/components/alpha/AlphaConnectBottomNavigation.tsx` | Tab order, اتصال label, responsive, active pill |
| `src/components/alpha/alpha-dock-system.css` | **NEW** — unified dock DNA |
| `src/components/alpha/styles.css` | Nav vars, dock idle/active, classic fix, code gold tokens |
| `src/components/alpha/alpha-identity-layout.css` | Shield slot, call-log grid |
| `src/components/alpha/AlphaIdentityRow.tsx` | Call-log inline name+shield |
| `src/components/alpha/ConnectPremiumQrBadge.tsx` | Gold user code visibility |
| `src/components/alpha/ConnectChannelSettings.tsx` | Invite sheet nav clearance |
| `src/components/alpha/AlphaConnectSettings.tsx` | Nav clearance padding |
| `src/components/alpha/alpha-connect-screen.ts` | Default conversations tab |
| `src/routes/alpha-connect.tsx` | Preview limit, channel recordings, padding |
| `src/routes/__root.tsx` | Import alpha-dock-system.css |
| `src/components/bible/BottomDock.tsx` | Unified dock DNA |
| `src/features/bible-home/components/BibleBottomNavigation.tsx` | Unified dock DNA |

---

## Components Modified

- `AlphaConnectBottomNavigation`
- `CallLogCard` / `RecentCallerRow` (via `AlphaIdentityRow`)
- `MessagesLogCard`
- `VoiceRecordingsLogPanel` / `ChannelRecordingsHistoryCard` (**new**)
- `ConnectChannelInviteSheet`
- `ConnectPremiumQrBadge`
- `AlphaIdentityRow`
- `BottomDock`
- `BibleBottomNavigation`

---

## Responsive Fixes Applied

- Connect dock: `sm:` icon/label/padding scaling
- `alpha-dock-system.css`: breakpoint-aware tab gaps and label sizes
- Nav clearance uses `max(16px, env(safe-area-inset-bottom))` for iOS home indicator

---

## Navigation Fixes Applied

- Tab order + center Channels + **اتصال** rename
- Per-tab active pill (not full-bar green)
- Global `--alpha-connect-nav-clearance` for content/sheets
- Unified dock bar across Home + Bible + Connect

---

## Shield System Status

- **PASS** — `.alpha-identity-shield-slot` enforces 1.75rem uniform size in participant grid and call-log rows.
- Applies to channels drawer participants, messages, calls, and invite list (via `AlphaIdentityRow`).

---

## Dark/Light Mode Coverage

| Area | Status |
|------|--------|
| Connect dock (secure + classic) | PASS |
| Connect content padding / sheets | PASS |
| QR user code gold tokens | PASS |
| App-wide hardcoded hex removal | PARTIAL |
| Legacy `AlphaBottomNavigation` | Not migrated (deprecated messaging path) |

---

## Screens Affected

- Alpha Connect — Calls (individual)
- Alpha Connect — Messages
- Alpha Connect — Channels / PTT
- Alpha Connect — Settings
- Channel invite sheet
- Home bottom dock
- Bible / Bible v2 bottom nav

---

## Before / After Summary

| Item | Before | After |
|------|--------|-------|
| Call/message previews | 3 items visible | 1 + عرض المزيد |
| Dock active state | All icons green | Active tab only (pill + accent) |
| Nav order | Alpha, Channels, Calls, Messages, Settings | Alpha, Settings, Channels (center), Messages, اتصال |
| Invite sheet | Could overlap nav | Stops above nav + safe area |
| Call row layout | Name / shield in separate columns | Name + shield inline; actions right |
| User code | Small dark green, low contrast | Warm gold, larger, shadowed |
| Channel recordings | Not under mic section | سجل تسجيلات القناة with preview |
| App nav DNA | Divergent glass styles | Shared alpha-dock-system |

---

## Warnings

- `AlphaBottomNavigation` (legacy Alpha messaging screens) not yet migrated to `alpha-dock-system`.
- Item 13 full app theme audit (all hardcoded colors) is **partial** — Connect-scoped tokens added; broader screens unchanged.
- Audio screen `BottomNav` not updated in this pass.

---

## Errors

None. Build completed successfully.

---

## Recommendations

1. Migrate `AlphaBottomNavigation` and `pages/audio/BottomNav.tsx` to `alpha-dock-system`.
2. Continue hardcoded color audit on Church, Profile, Prayer screens using shared theme tokens.
3. QA on real iOS device: verify invite sheet + home indicator clearance.
4. QA RTL tab order visually on phone and iPad.

---

## Overall Status

**PARTIAL PASS**

All 13 Connect UX items addressed at implementation level. Items 12–13 are **partial** for non-Connect app surfaces and full global theme audit.
