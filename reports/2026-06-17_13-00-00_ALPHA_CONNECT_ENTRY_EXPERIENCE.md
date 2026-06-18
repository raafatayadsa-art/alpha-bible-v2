# Alpha Connect Entry Experience Implementation

## Executive Summary

Added a **Smart Alpha Connect Card** on Alpha Home with live activity (messages, missed calls, channels) and replaced the in-Connect bottom dock with a **dedicated 5-tab Alpha Connect Bottom Navigation** (Alpha exit, Channels, Calls, Messages, Settings). Existing Connect screens and ModeSwitcher remain unchanged. Build passes.

## Findings

### Part 1 — Smart Alpha Connect Card

**Component:** `src/components/alpha/AlphaConnectHomeCard.tsx`  
**Hook:** `src/features/alpha-connect/useAlphaConnectHomeActivity.ts`  
**Placement:** `src/routes/home.tsx` — section after primary journey cards

**Live data sources:**
| Metric | Source |
|--------|--------|
| Unread messages | `useAlphaConnectConversationList()` → Supabase `unread_count` sum |
| Missed calls | `getConnectMissedCallsCount()` from `connect-call-log.ts` |
| Active channels | Channels with `getConnectChannelOnlineCount() > 0` |

**Dynamic subtitle examples (Arabic):**
- `7 رسائل جديدة • 2 مكالمات فائتة`
- `3 قنوات نشطة`
- `لا يوجد نشاط جديد`
- `ابدأ محادثة أو انضم إلى قناة`

**Visual:** Light luxury glassmorphism — warm cream/gold palette, `AlphaConnectLogo`, no dark Connect theme colors.

**Navigation:** Card links to `/alpha-connect`.

### Part 2 — Alpha Connect Bottom Navigation

**Component:** `src/components/alpha/AlphaConnectBottomNavigation.tsx`  
**Nav logic:** `src/features/alpha-connect/alpha-connect-nav.ts`

| Tab | Behavior |
|-----|----------|
| **Alpha** | Exit Connect → `/home` (Alpha Bible main home) |
| **Channels** | `setMode("groups")` |
| **Calls** | `setMode("individual")` — contacts stay in Calls view |
| **Messages** | `setMode("messages")` + unread badge |
| **Settings** | Opens `AlphaConnectSettings` overlay |

**Replaced:** Old `ConnectBottomDock` / `BottomNavBar` (Home, Channels, Connect, Notifications, Settings).

**Always visible** when not in chat or security lock (removed scroll-to-bottom reveal).

**Deep link:** `/alpha-connect?tab=messages|channels|calls|settings` supported via route search.

### Files modified

| File | Change |
|------|--------|
| `src/routes/home.tsx` | Added `AlphaConnectHomeCard` section |
| `src/routes/alpha-connect.tsx` | New bottom nav, nav handlers, call log import, `?tab=` search |
| `src/components/alpha/AlphaConnectHomeCard.tsx` | **New** — home gateway card |
| `src/components/alpha/AlphaConnectBottomNavigation.tsx` | **New** — 5-tab dock |
| `src/features/alpha-connect/alpha-connect-nav.ts` | **New** — tab ↔ mode mapping |
| `src/features/alpha-connect/useAlphaConnectHomeActivity.ts` | **New** — live activity hook |
| `src/features/alpha-connect/connect-call-log.ts` | **New** — shared call log + missed count |

### New routes

No new route files. Extended existing route:

- `/alpha-connect` — optional search: `?tab=`, `?chat=`, `?invite=`

### Navigation flow

```
Alpha Home
  └─ [Alpha Connect Card] ──tap──► /alpha-connect

/alpha-connect
  ├─ Bottom Nav: Alpha ──► /home (exit)
  ├─ Bottom Nav: Channels ──► mode=groups (existing Channels UI)
  ├─ Bottom Nav: Calls ──► mode=individual (CallLog + contacts)
  ├─ Bottom Nav: Messages ──► mode=messages
  └─ Bottom Nav: Settings ──► AlphaConnectSettings overlay
```

### Extraction readiness

| Layer | Status | Notes |
|-------|--------|-------|
| Routes | **Ready** | Single `/alpha-connect` entry; tab deep links |
| Navigation | **Ready** | Isolated in `alpha-connect-nav.ts` + `AlphaConnectBottomNavigation.tsx` |
| Screen state | **Ready** | `alpha-connect-screen.ts` (localStorage mode/tab) |
| Feature hooks | **Ready** | `useAlphaConnectHomeActivity`, conversation list, presence |
| UI shell | **Partial** | Main hub still in `alpha-connect.tsx` route file — extract to `AlphaConnectApp.tsx` when splitting |
| Auth/data | **Ready** | Supabase messages, presence — no Home coupling |

**Overall extraction readiness: HIGH** — nav, state, and data layers are decoupled; route file remains the main assembly point.

## Warnings

- Missed calls count uses demo `CONNECT_CALL_LOG_ENTRIES` until live call-history API exists.
- Home card fetches conversations only when user is authenticated (`getAuthUserSync()`).
- ModeSwitcher top tabs remain alongside bottom nav (intentional — no screen redesign).

## Errors

None. `npm run build` — **PASS**.

## Recommendations

1. Wire missed calls to real call log when backend is available.
2. Extract `AlphaConnect` from `alpha-connect.tsx` into `features/alpha-connect/AlphaConnectShell.tsx` for standalone app packaging.
3. Optionally hide ModeSwitcher when bottom nav is primary (future polish only).

## Overall Status

**PASS**
