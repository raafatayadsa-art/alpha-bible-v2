# ALPHA-121 — Domain 10 Timeline + Trust + Typed Client (P10)

**Date:** 2026-06-27  
**Ticket:** ALPHA-121  
**Scope:** Final trip-reservations wire; Supabase Database types; D09 deprecation plan  
**Build:** PASS  
**Overall Status:** PASS (Domain 10 client wiring)

---

## Executive Summary

**P10** completes **Domain 10 client wiring** for `trip-reservations/`: **`trip_timeline_events`**, **`trip_organizer_trust_stats`**, generated **`database.generated.ts`** with **`createClient<Database>()`**, and documents the **Domain 09 → 10 deprecation** roadmap. All ALPHA-085–098 trip modules now dual-write to Supabase with localStorage fallback.

---

## Findings

### Database (production)

| Item | Detail |
|------|--------|
| Migration | `20260627250000_alpha_121_domain_10_timeline_trust_p10.sql` |
| Tables | `trip_timeline_events`, `trip_organizer_trust_stats` |
| RLS | Timeline: church/organizer write; Trust: public read, scoped upsert |

### Frontend

| File | Change |
|------|--------|
| `database.generated.ts` | **New** — full Supabase schema types (~165 KB, MCP generated) |
| `client.ts` | `createClient<Database>(...)` |
| `trip-timeline.ts` | `syncTripTimelineFromDb`, remote replace on archive build |
| `organizer-trust.ts` | `syncOrganizerTrustFromDb`, remote persist on completion |
| `trip-domain-api.ts` | Timeline + trust fetch/persist APIs |
| `TripPostArchiveSection.tsx` | Sync timeline from DB |
| `OrganizerTrustSheet.tsx` | Sync trust from DB |
| `ALPHA-121_DATABASE_ARCHITECTURE_V1.md` | Domain 10 **complete** + D09 deprecation phases D1–D4 |

### Domain 10 module checklist (P4–P10)

| Module | Table(s) | Status |
|--------|----------|--------|
| Waitlist | `waiting_lists` + RPC | ✅ |
| Bookings mirror | `trip_bookings` | ✅ |
| Buses / geo | `buses`, `check_ins` | ✅ |
| Wallet | `trip_payments` | ✅ |
| Prayers | `trip_prayer_requests` | ✅ |
| Certificates | `trip_participation_certificates` | ✅ |
| Companion | `trip_companion_groups` | ✅ |
| Passport | `trip_pilgrimage_passport_entries` | ✅ |
| Memory album | `trip_memory_albums` | ✅ |
| Emergency | `trip_emergency_contacts` | ✅ |
| Timeline | `trip_timeline_events` | ✅ |
| Organizer trust | `trip_organizer_trust_stats` | ✅ |

---

## Warnings

1. **`database.generated.ts`** must be regenerated after future migrations (MCP or `supabase gen types`).
2. **`trip-command-center.ts`** remains a local aggregate (reads other modules) — no dedicated table.
3. **D09 deprecation** not started — `post_registrations` still primary UX path.

---

## Errors

None. Production migration applied. `npm run build` — PASS.

---

## Recommendations (post-P10)

1. Execute **D1–D4** deprecation plan when ready to cut localStorage fallbacks.
2. Regenerate types after each Domain 10 migration.
3. Add E2E tests for waitlist RPC + realtime offer flow.

---

## Overall Status

**PASS** — Domain 10 `trip-reservations/` client wiring complete. D09 deprecation is the next program phase.
