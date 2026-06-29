# Module Hide + Alpha Control Real Data

**Date:** 2026-06-29  
**Scope:** Hide locked module cards on Home/Profile; wire Alpha Control dashboard to live Supabase counts.

---

## Executive Summary

Disabled platform modules now hide their cards on the Home screen and Profile page instead of flashing visible during load or bypassing owner toggles. Alpha Control no longer falls back to seeded fake dashboard stats (12,458 users); it uses `platform_live_dashboard_stats` RPC with zero fallback, and feature-usage panels show real table counts.

---

## Findings

### Module visibility (Home + Profile)

| Area | Before | After |
|------|--------|-------|
| `ALWAYS_ENABLED_MODULE_KEYS` | `bible`, `community` always shown | Empty — all modules respect owner state |
| `usePlatformModules` loading | `optimisticWhileLoading: true` showed all modules while fetching | Uses cached module flags immediately |
| Home Alpha Connect card | Shown for any authenticated user | Gated by `messaging` module |
| Profile trips | Shown when community on | Gated by `trips` module (hero stat, timeline, activity ledger) |
| Profile Connect orbit | Gated by community + privacy only | Also requires `messaging` module |
| Home journey cards | Already filtered via `HOME_CARD_MODULE` | Unchanged — now effective for bible/community too |

### Alpha Control real data

| Panel | Before | After |
|-------|--------|-------|
| `fetchDashboardStats` | RPC → fallback `platform_dashboard_stats` seed (12458 users) | RPC only; zeros if RPC missing |
| `FounderFeatureUsage` | Fake % shares of user base | Live counts: users, churches, priests, servants, messages, requests, reports |
| `FounderPlatformGrowth` | Hardcoded +23.6% / +18.2% | Derived from live user count estimate; shows `—` when no data |

---

## Warnings

- **RPC required:** Run `supabase/migrations/20250622190000_platform_live_dashboard_stats.sql` on remote if dashboard shows all zeros.
- **Historical charts** (`build30DaySeries`, `build14DaySeries`) remain illustrative curves scaled from current totals — no time-series table exists yet.
- **Global map / city breakdown** still uses estimated geography shares until real geo analytics ship.

---

## Errors

None during build.

---

## Recommendations

1. Apply `platform_live_dashboard_stats` migration on production Supabase if not already deployed.
2. After disabling a module in Module Control, refresh the app tab to sync `ab:platform-modules` cache.
3. Future: add `platform_analytics_daily` table for true 7/30-day trends instead of derived curves.

---

## Overall Status

**PASS** — Build verified; module gating and live stats wiring complete.

---

## Files Changed

- `src/lib/platform-modules/platform-modules-client.ts`
- `src/lib/platform-modules/usePlatformModules.ts`
- `src/routes/home.tsx`
- `src/features/profile/ProfilePremiumScreen.tsx`
- `src/features/platform-admin/platform-api.ts`
- `src/features/platform-admin/founder/founder-dashboard-data.ts`
- `src/features/platform-admin/founder/FounderFeatureUsage.tsx`
- `src/features/platform-admin/founder/FounderPlatformGrowth.tsx`
