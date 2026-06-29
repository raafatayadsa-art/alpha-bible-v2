# ALPHA-121 — Domain 10 Bookings RLS + Prayers + Organizer Payments (P7)

**Date:** 2026-06-27  
**Ticket:** ALPHA-121  
**Scope:** Church-scoped `trip_bookings`/`waiting_lists` RLS; `trip_prayer_requests`; organizer payment UI  
**Build:** PASS  
**Overall Status:** PARTIAL

---

## Executive Summary

**P7** tightens Domain 10 RLS for bookings and waitlists to church/organizer scope, adds **`trip_prayer_requests`** table with RLS, wires **`trip-prayer-requests.ts`** to Supabase, and adds **`TripOrganizerPaymentPanel`** in the trip command center for organizer-recorded payments.

---

## Findings

### Database (production)

| Item | Detail |
|------|--------|
| Migration | `20260627220000_alpha_121_domain_10_bookings_prayer_p7.sql` |
| Table | `trip_prayer_requests` (trip_id, user_id, body, reactions, shared_with_organizer) |
| RLS | `trip_bookings_select/update_scoped`, `waiting_lists_select/update_scoped` |
| RLS | `trip_prayer_requests` select/insert/update (church member, organizer, or booked participant) |

### Frontend

| File | Change |
|------|--------|
| `trip-domain-api.ts` | `fetchTripPrayerRequests`, `insertTripPrayerRequestRemote`, `incrementTripPrayerReactionRemote`, `persistOrganizerTripPayment` |
| `trip-prayer-requests.ts` | Dual-write local + remote; `syncTripPrayersFromDb` |
| `TripPrayerPanel.tsx` | Sync prayers on mount |
| `trip-wallet.ts` | `recordOrganizerTripPayment` |
| `TripOrganizerPaymentPanel.tsx` | **New** — quick +200 EGP per participant in command center |
| `TripOperationsPanel.tsx` | Embeds organizer payment panel |

### Data flow

```
Participant → trip_prayer_requests (via ensure_trip_for_post)
Church member → react (update reactions count)
Organizer → trip_payments insert for participant booking (+ local wallet update)
Bookings/waitlist → visible only within church scope or to organizer/self
```

---

## Warnings

1. **Waitlist offers** from cancellation still run client-side; organizer update policy allows cross-user offer rows when caller is organizer — non-organizer cancel flow may need RPC in P8.
2. **Organizer payment panel** uses fixed +200 EGP quick button (matches default seat price in PostActions).
3. **Remaining local-only:** certificates, companion-matching, pilgrimage passport, memory album.

---

## Errors

None. Production migration applied. `npm run build` — PASS.

---

## Recommendations (P8)

1. Security-definer RPC for waitlist offer queue (`offer_next_waitlist_seat`).
2. Wire `trip-certificates`, `companion-matching` to Domain 10.
3. Regenerate Supabase TypeScript types to include `trip_prayer_requests`.
4. Custom amount entry in organizer payment panel.

---

## Overall Status

**PARTIAL** — Bookings/waitlist RLS + prayers + organizer payments deployed; certificates/companion modules pending.
