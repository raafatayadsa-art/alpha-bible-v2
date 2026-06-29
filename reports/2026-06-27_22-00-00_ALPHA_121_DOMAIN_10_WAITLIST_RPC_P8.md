# ALPHA-121 — Domain 10 Waitlist RPC + Certificates + Companion (P8)

**Date:** 2026-06-27  
**Ticket:** ALPHA-121  
**Scope:** `offer_next_waitlist_seat` RPC; certificates/companion tables; custom organizer payments  
**Build:** PASS  
**Overall Status:** PARTIAL

---

## Executive Summary

**P8** adds a security-definer **`offer_next_waitlist_seat`** RPC for reliable waitlist advancement on cancellation, introduces **`trip_participation_certificates`** and **`trip_companion_groups`** with RLS, wires client modules, adds **custom payment amounts** in the organizer panel, and publishes **Domain 10 reference types**.

---

## Findings

### Database (production)

| Item | Detail |
|------|--------|
| Migration | `20260627230000_alpha_121_domain_10_waitlist_rpc_p8.sql` |
| RPC | `offer_next_waitlist_seat(trip_id, freed_seats, hold_ms)` — expires stale offers, offers next seat |
| Table | `trip_participation_certificates` (unique per trip + user) |
| Table | `trip_companion_groups` (registration_ids text[]) |
| RLS | Certificate read: self / organizer / church; companion: organizer CRUD, church read |

### Frontend

| File | Change |
|------|--------|
| `trip-domain-api.ts` | Waitlist RPC, certificate + companion fetch/persist |
| `trip-waitlist.ts` | `processWaitlistAfterCancellation` → RPC first, local fallback |
| `trip-certificates.ts` | `syncMyCertificatesFromDb`, remote upsert on issue |
| `companion-matching.ts` | `syncCompanionGroupsFromDb`, remote replace on auto-match |
| `TripOrganizerPaymentPanel.tsx` | Custom amount input per participant |
| `CompanionMatchingPanel.tsx` | Sync groups on mount |
| `post-registrations.ts` | Await waitlist RPC on cancel |
| `domain-10.types.ts` | **New** reference types for P7–P8 tables |

### Data flow

```
Cancel registration → offer_next_waitlist_seat (RPC) → local waitlist merge
finalizePostTrip → trip_participation_certificates upsert
autoMatchCompanions → replace trip_companion_groups (organizer RLS)
Organizer panel → custom amount → trip_payments
```

---

## Warnings

1. **RPC auth:** Caller must be organizer, church member, or active booker on the trip.
2. **Companion groups** store D09 `registration_ids` (text), not `trip_bookings` UUIDs.
3. **Remaining local-only:** memory album, timeline, pilgrimage passport, emergency contact sync.

---

## Errors

None. Production migration applied. `npm run build` — PASS.

---

## Recommendations (P9)

1. Wire `pilgrimage-passport`, `trip-memory-album`, `emergency-contact` to Domain 10.
2. Full Supabase `Database` typegen wired into `createClient<Database>()`.
3. Realtime subscription for waitlist offers.

---

## Overall Status

**PARTIAL** — Core waitlist RPC + certificates + companion groups deployed; archive/passport modules pending.
