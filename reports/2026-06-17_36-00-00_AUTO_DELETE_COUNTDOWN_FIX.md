# Auto-Delete Timer & Countdown Fix

**Date:** 2026-06-17  
**Scope:** Alpha Connect chat retention, countdown UI, timer options  
**Overall Status:** PASS (client) / PARTIAL (requires Supabase SQL for full server sync)

---

## Executive Summary

Auto-delete appeared broken because: (1) the countdown refreshed only every 60 seconds and never showed seconds; (2) client pruning ran every 30 seconds (too slow for 5–30s timers); (3) timer labels mapped incorrectly (e.g. «٣٠ دقيقة» → `1h`); (4) DB only allowed hour/day policies. Fixed client logic with 1-second countdown/prune, seven timer options, correct policy mapping, and fallback expiry from `created_at + policy`. Added Supabase migration for short policies (`5s` … `1d`).

---

## Findings

| Issue | Impact |
|-------|--------|
| Countdown tick 60s + minute-only display | Timer never counted down in seconds |
| Prune interval 30s | Messages stayed visible after expiry for short timers |
| Wrong `timerLabelToRetention` map | 30 min selected → 1 hour stored |
| DB CHECK constraint missing `5s`/`1m`/etc. | Insert could fail or fallback to wrong duration |
| `expires_at` null on unmigrated DB | Client did not compute expiry from policy |

---

## Fixes Applied

### Client
- **`retention.ts`**: Policies `5s`, `10s`, `30s`, `1m`, `5m`, `30m`, `1d`; `messageExpiresAtMs()`; live second-level `formatDeletionCountdown()`; `CHAT_TIMER_OPTIONS` (7 labels only).
- **`useAlphaConnectThread.ts`**: Expiry prune every **1 second**.
- **`AlphaChatScreen.tsx`**: Countdown tick every **1 second**; new timer picker options; default «دقيقة».
- **`alpha-connect-message-map.ts`**: Uses shared `timerLabelToRetention`.
- **`messages-api.ts`**: Smarter insert fallback order for new policies.
- **`AlphaConnectSettings.tsx`**: Voice ephemeral delete aligned to same policy set.

### Database (run manually)
- `supabase/migrations/20250617220000_alpha_connect_short_retention.sql`
- `supabase/RUN_ALPHA_CONNECT_SHORT_RETENTION.sql`

---

## New Timer Options (only)

| Label | Policy |
|-------|--------|
| ٥ ثواني | `5s` |
| ١٠ ثواني | `10s` |
| ٣٠ ثانية | `30s` |
| دقيقة | `1m` |
| ٥ دقائق | `5m` |
| ٣٠ دقيقة | `30m` |
| يوم | `1d` |

Countdown format: `٤٥ ث`, `٢ د ١٠ ث`, `١ س ٥ د`, etc. — updates every second; message removed from UI when remaining ≤ 0.

---

## Warnings

- **Run SQL on Supabase** for server-side `expires_at` on insert; without it, client still deletes from UI via computed expiry but DB rows may linger until purge RPC.
- Old messages with legacy policies (`1h`, `24h`, …) still work; countdown uses stored `expires_at` or computed fallback.

---

## Errors

None — `npm run build` PASS.

---

## Recommendations

1. Execute `supabase/RUN_ALPHA_CONNECT_SHORT_RETENTION.sql` in Supabase SQL Editor.
2. Test: set timer to «٥ ثواني», send message, watch countdown `٥ ث` → `١ ث`, message disappears.
3. Test «٣٠ دقيقة» now maps to `30m` (not `1h`).

---

## Overall Status

**PARTIAL** — Client complete; run SQL migration for production DB alignment.
