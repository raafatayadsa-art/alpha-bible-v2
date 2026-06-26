# Platform Control — Cards, Nav, Live Stats, Module Gating

**Date:** 2026-06-22  
**Scope:** `/platform` UI + app-wide module lock

---

## Executive Summary

Updated platform control cards (full-tap, prominent, icon left / text right), bottom nav layout (Home left · Scan center flat · Alpha elevated right), live dashboard stats without fake fallbacks, and **working module toggles** that hide locked features app-wide via Supabase `platform_modules`.

---

## Findings

### Cards
| Change | Detail |
|--------|--------|
| Layout | Icon **far left** · title + description **far right** |
| Interaction | Removed Open button · entire card is tappable |
| Visual | Stronger border glow + shadow (`pp-card-shell` elevated) |

### Bottom nav (`OwnerToolbar`)
| Slot | Control |
|------|---------|
| Far left | لوحة التحكم |
| | الإعدادات |
| Center | Scan (same level as peers — no `-mt` raise) |
| | الموافقات |
| Far right (elevated) | Alpha → `/home` |

Header: Bell notifications only (Alpha moved to bottom bar).

### Live dashboard
- `usePlatformDashboard` no longer falls back to `PLATFORM_STATS` seed (12.4K users etc.)
- Shows `…` while loading · then RPC `platform_live_dashboard_stats()` values
- Fallback `0` only if RPC + seed table both fail

### Module management (إدارة الموديولات)
- Toggle now **awaits** `toggleModuleDb` — UI updates only after DB save succeeds
- Broadcasts `ab:platform-modules` for all clients
- New `src/lib/platform-modules/`:
  - `usePlatformModules()` — reads `platform_modules` table
  - `PlatformModuleGate` — redirects disabled routes to `/home`
  - Route map: bible, agpeya, synaxarium, katameros, community, messaging, trips
- Wired into: `__root.tsx`, `AlphaNavHub`, `home.tsx` cards, `BibleBottomNavigation`

**Lock behavior:** When owner disables e.g. `agpeya`:
- Hidden from nav hub + home cards + bible dock
- Direct `/agpeya` URL redirects to `/home`

---

## Warnings

- Module cache defaults to **enabled** if DB unreachable (fail-open for first visit)
- `trips` only gates `/church/post/*` prefix — not all church routes
- `audio` has no module key — always visible

---

## Errors

None. **Build PASS.**

---

## Recommendations

1. Add `audio` module key if audio should be lockable
2. Consider Realtime subscription on `platform_modules` for instant cross-device sync
3. Tighten RLS on `platform_modules` UPDATE to owner-only RPC before public launch

---

## Overall Status

**PASS**
