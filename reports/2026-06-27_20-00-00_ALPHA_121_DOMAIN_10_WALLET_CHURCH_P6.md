# ALPHA-121 — Domain 10 Wallet + Church Scope (P6)

**Date:** 2026-06-27  
**Ticket:** ALPHA-121  
**Scope:** Wire trip wallet → `trip_payments`; church/organizer context; scoped RLS  
**Build:** PASS  
**Overall Status:** PARTIAL

---

## Executive Summary

**P6** connects the trip wallet client to Domain 10 **`trip_payments`**, resolves **`church_id`** / **`organizer_user_id`** from church posts via **`resolveTripPostContext`**, and deploys church-scoped RLS on **`trips`** and **`trip_payments`**. Production migration applied; `npm run build` passes.

---

## Findings

### Database (production)

| Item | Detail |
|------|--------|
| Migration | `20260627210000_alpha_121_domain_10_church_scope_p6.sql` |
| Function | `user_in_church(bigint)` — active `church_memberships` check |
| RPC update | `ensure_trip_for_post` backfills `church_id`, `organizer_user_id`, title on existing trips |
| RLS | `trips_select_church_scope` — organizer, church member, or booked participant |
| RLS | `trip_payments_select/insert/update` — booking holder, organizer, or church member (read); organizer (update) |

### Frontend

| File | Change |
|------|--------|
| `trip-post-context.ts` | **New** — `resolveTripPostContext(postId)` from `church_posts` |
| `trip-domain-api.ts` | Wallet fetch/persist to `trip_payments`; `ensureTripIdForPost` uses post context |
| `trip-wallet.ts` | Requires `postId`; `syncTripWalletFromDb` dual-write local + remote |
| `PostActions.tsx` | `initTripWallet({ registrationId, postId, amountDue })` |
| `TripWalletStrip.tsx` | Props `postId` + optional `registrationId`; sync on mount |
| `church.post.$id.tsx` | Pass `postId={post.id}` to wallet strip |
| `index.ts` | Export `syncTripWalletFromDb`, `resolveTripPostContext` |

### Data flow

```
church_posts → resolveTripPostContext → ensure_trip_for_post(church_id, organizer)
post_registrations → trip_bookings → trip_payments (ledger)
TripWalletStrip → syncTripWalletFromDb → localStorage fallback if remote unavailable
```

---

## Warnings

1. **Wallet init** still depends on local registration flow; remote ledger requires P4 booking mirror.
2. **Church RLS** on `trips`/`trip_payments` does not yet extend to `waiting_lists` / `trip_bookings` (P7 candidate).
3. **Remaining local-only:** trip-prayer-requests, companion-matching, certificates, organizer payment UI.

---

## Errors

None. Production migration `alpha_121_domain_10_church_scope_p6` — success. `npm run build` — PASS.

---

## Recommendations (P7)

1. Church-scoped RLS for `trip_bookings` and `waiting_lists`.
2. Wire `trip-prayer-requests` to Domain 10 tables.
3. Organizer-facing payment recording UI with `trip_payments` insert.
4. Ensure all `ensureTripIdForPost` call sites pass church/organizer from post context.

---

## Overall Status

**PARTIAL** — Wallet + church scope deployed; prayer/other modules and extended RLS pending.
