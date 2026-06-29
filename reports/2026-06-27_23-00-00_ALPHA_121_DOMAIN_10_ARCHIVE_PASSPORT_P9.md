# ALPHA-121 — Domain 10 Archive + Passport + Waitlist Realtime (P9)

**Date:** 2026-06-27  
**Ticket:** ALPHA-121  
**Scope:** Wire passport/memory/emergency modules; waitlist realtime; Domain 10 types  
**Build:** PASS  
**Overall Status:** PARTIAL

---

## Executive Summary

**P9** completes the remaining **trip-reservations** localStorage bridges to Domain 10: **`trip_pilgrimage_passport_entries`**, **`trip_memory_albums`**, **`trip_emergency_contacts`**, enables **Supabase Realtime** on **`waiting_lists`**, and expands **`domain-10.types.ts`**.

---

## Findings

### Database (production)

| Item | Detail |
|------|--------|
| Migration | `20260627240000_alpha_121_domain_10_archive_passport_p9.sql` |
| Tables | `trip_pilgrimage_passport_entries`, `trip_memory_albums`, `trip_emergency_contacts` |
| Realtime | `waiting_lists` → `supabase_realtime` publication + `replica identity full` |
| RLS | Self/organizer/church-scoped per module |

### Frontend

| File | Change |
|------|--------|
| `trip-domain-api.ts` | Fetch/persist for passport, album, emergency |
| `pilgrimage-passport.ts` | `syncPilgrimagePassportFromDb` + remote on add |
| `trip-memory-album.ts` | `syncTripMemoryAlbumFromDb` + remote on build |
| `emergency-contact.ts` | Remote upsert with `postId`; `syncEmergencyContactFromDb` |
| `trip-waitlist.ts` | `subscribeTripWaitlistRealtime` |
| `WaitlistOfferBanner.tsx` / `PostActions.tsx` | Realtime + sync on mount |
| `TripPostArchiveSection.tsx` | Sync album from DB |
| `ProfileTripJourneySection.tsx` | Sync passport + certificates |
| `domain-10.types.ts` | P9 row types + `Domain10TableName` union |

### Data flow

```
finalizePostTrip → memory album + passport entries → Supabase
Reserve popup → emergency contact → trip_emergency_contacts
Cancel booking → RPC offer → Realtime → WaitlistOfferBanner refresh
```

---

## Warnings

1. **Memory album write** RLS is organizer-only — `buildTripMemoryAlbum` may fail remote persist unless caller is organizer (local still works).
2. **Full `Database` typegen** not wired into `createClient<Database>()` — reference types only in `domain-10.types.ts`.
3. **Remaining local-only:** `trip-timeline`, `organizer-trust`, `trip-command-center` aggregates.

---

## Errors

None. Production migration applied. `npm run build` — PASS.

---

## Recommendations (P10)

1. Wire `trip-timeline` to Domain 10 or JSON archive column on `trip_memory_albums`.
2. Generate and attach full Supabase `Database` types to client.
3. Mark Domain 10 client wiring **complete** in architecture doc; shift to D09 registration primary deprecation plan.

---

## Overall Status

**PARTIAL** — Core trip-reservations modules wired; timeline/trust aggregates still local.
