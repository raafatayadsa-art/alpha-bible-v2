# ALPHA-121 — Domain 10 Client Wire (P4)

**Date:** 2026-06-27  
**Ticket:** ALPHA-121  
**Scope:** Wire trip waitlist + registrations to Domain 10 tables  
**Build:** PASS  
**Overall Status:** PARTIAL

---

## Executive Summary

**P4** connects the church trip UX to Domain 10 without redesign: smart waitlist syncs to `waiting_lists`, trip registrations mirror to `trip_bookings` via `trips.post_id`, and production gained RPC `ensure_trip_for_post` plus tighter waitlist/booking RLS.

LocalStorage remains as offline/optimistic fallback (same pattern as `post-interactions`).

---

## Findings

### Database (production)

| Item | Detail |
|------|--------|
| Migration | `20260627190000_alpha_121_domain_10_wire_rpcs.sql` |
| RPC | `ensure_trip_for_post(post_id, title, church_id, organizer)` |
| Index | Unique `trips(post_id)` where not null |
| RLS | `waiting_lists` + `trip_bookings` — self-scoped writes, authenticated read |

### Frontend

| File | Change |
|------|----------|
| `trip-domain-api.ts` | **New** — ensure trip, mirror booking, remote availability |
| `trip-waitlist.ts` | Sync read/write to `waiting_lists` + local fallback |
| `post-registrations.ts` | Mirror trip register/confirm/cancel → `trip_bookings` |
| `PostActions.tsx` | `syncTripWaitlistFromDb` on trip popup open |
| `trip-reservations/index.ts` | Export new APIs |

### Data flow

```
church post (post_id)
    → ensure_trip_for_post → trips
    → registerForPost (D09 post_registrations) + mirror → trip_bookings
    → joinTripWaitlist → waiting_lists (+ local cache)
```

---

## Warnings

1. **Dual write:** `post_registrations` (D09) still primary; `trip_bookings` (D10) mirrors best-effort.
2. **Organizer RLS** not yet scoped — church admin policies deferred to P5.
3. **Other trip modules** (buses, wallet, geo check-in) still localStorage-only.

---

## Errors

None. `npm run build` — PASS.

---

## Recommendations (P5+)

1. Wire `trip-bus-store.ts` → `buses` / `bus_assignments`.
2. Wire `trip-geo-checkin.ts` → `check_ins`.
3. Organizer-scoped RLS + RPCs for trip management.
4. Migrate `post_registrations` trip rows to D10-only when stable.

---

## Overall Status

**PARTIAL** — Core waitlist + booking path wired; remaining trip-reservations modules pending.
