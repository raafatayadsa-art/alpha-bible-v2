# Platform Control Screen Polish + Live Dashboard Stats

**Date:** 2026-06-22  
**Scope:** `/platform` layout, header, cards, live DB stats

---

## Executive Summary

Redesigned Alpha Control Center home: slim row cards with inline Open buttons, centered hero title, top toolbar actions (Scan / Notifications / Settings), simplified bottom nav, English numerals, and **live dashboard counts** from production tables via RPC.

---

## Findings

| Change | Detail |
|--------|--------|
| Slim cards | `variant="slim"` — icon + text + compact button in one row; footer metrics for settings/reports |
| Dashboard panel | Operational header + sync clock + 5 live metrics |
| Hero | Removed A.C.C; **Alpha Control Center** centered, larger |
| Header | Scan · Bell (badge) · Settings at top; logo/profile removed |
| Bottom nav | Home + Approvals only (scan/settings/alerts moved to header) |
| Live stats RPC | `platform_live_dashboard_stats()` — churches, users, priests, servants, messages, requests, reports |

**Live DB snapshot (prod):** 1,241 churches · 2 users · 7 open reports · 44 messages

---

## Warnings

- `auth.users` count requires RPC (not client-readable); fallback to seed `platform_dashboard_stats` if RPC fails.
- Church Location sub-screen hero still shows generic Control Center title (intentional shared hero component).

---

## Errors

None. Build PASS.

---

## Recommendations

None required.

---

## Overall Status

**PASS**
