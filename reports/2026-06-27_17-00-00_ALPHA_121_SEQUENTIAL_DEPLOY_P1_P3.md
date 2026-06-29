# ALPHA-121 — Sequential Deploy (P1 → P2 → P3)

**Date:** 2026-06-27  
**Ticket:** ALPHA-121  
**Project:** Supabase `usflbjlyadihyitnvzya`  
**Overall Status:** PASS

---

## Executive Summary

Completed the **ordered ALPHA-121 backlog** after domain comments (02–09):

1. **P1** — Connect repo drift resolved: deployed presence, nearby discovery, contacts, connection RPCs (fixed for `user_profiles` + production church schema).
2. **P2** — Church post comments/reactions deployed (Domain 03).
3. **P3** — Domain 10 operations schema v1 deployed (14 tables, RLS skeleton, domain comments).

Frontend modules (`nearby-api`, `presence.ts`, `post-interactions.ts`) can now use Supabase instead of local-only fallbacks where tables were missing.

---

## P1 — Connect Drift (DOMAIN-04)

### Deployed tables

| Table | Domain comment |
|-------|----------------|
| `alpha_user_presence` | ✅ Realtime enabled |
| `alpha_user_discovery_prefs` | ✅ |
| `alpha_connect_connection_requests` | ✅ |
| `alpha_connect_contacts` | ✅ |

### Deployed RPCs

- `alpha_upsert_discovery_location`
- `alpha_nearby_members` — joins `user_profiles`, `church_name`, uuid memberships
- `alpha_send_connection_request`
- `alpha_respond_connection_request`

### Fixes vs legacy `20250618190000`

- **No** `profiles` table recreation
- **Uses** `user_profiles` for display/avatar
- **Uses** `churches.church_name` (not `name`)
- **Uses** `church_memberships.user_id uuid` (not text cast)
- **RLS** scoped to self/parties (not `using (true)` on all)

### Repo migration

`supabase/migrations/20260627170000_alpha_121_connect_domain_deploy.sql`

---

## P2 — Church Post Interactions (DOMAIN-03)

| Table | Status |
|-------|--------|
| `church_post_comments` | ✅ Deployed |
| `church_post_reactions` | ✅ Deployed |

Unblocks `src/features/church/post-interactions.ts` remote sync.

**Migration:** `20260627171000_alpha_121_church_post_interactions_deploy.sql`

---

## P3 — Domain 10 Operations Schema v1

### Deployed (14 tables)

`trips`, `trip_bookings`, `waiting_lists`, `buses`, `bus_assignments`, `accommodations`, `trip_payments`, `trip_channels`, `organizer_channels`, `check_ins`, `attendance_logs`, `conferences`, `conference_registrations`, `events`

- RLS enabled with authenticated read/write skeleton
- `post_id text` on trips/conferences/events bridges church feed until client migration
- `trip_channels.conversation_id` FK → `alpha_connect_conversations` (Domain 04 cross-link)

**Migration:** `20260627180000_alpha_121_domain_10_operations_schema.sql`

**Not wired yet:** `trip-reservations/*` still uses localStorage + `post_registrations` (Domain 09).

---

## Findings

1. All targeted objects verified on production with `DOMAIN-XX` comments.
2. Legacy migration `20250618190000` marked superseded in repo header.
3. Empty MCP migration record `alpha_121_connect_domain_deploy` superseded by `alpha_121_connect_domain_deploy_fix` + RPC migration on production.

---

## Warnings

1. **Domain 10 RLS** is permissive (`authenticated using (true)`) — tighten to church/organizer scope before public trip booking goes live.
2. **Church post RLS** remains open (matches prior repo migration) — review before production scale.
3. **Repo vs remote migration names** differ slightly (MCP split apply) — repo files are source of truth for fresh environments.

---

## Errors

None on final verification.

---

## Recommendations

1. Wire `trip-waitlist.ts` / `post-registrations.ts` → Domain 10 tables incrementally.
2. Add organizer-scoped RLS policies + RPCs for trips/bookings.
3. Deprecate localStorage keys in `trip-reservations/` as each module migrates.
4. Deploy future Connect tables (`alpha_connect_calls`, `alpha_connect_channels`) under Domain 04 when features ship.

---

## Files Changed

| Path | Action |
|------|--------|
| `supabase/migrations/20260627170000_alpha_121_connect_domain_deploy.sql` | Created |
| `supabase/migrations/20260627171000_alpha_121_church_post_interactions_deploy.sql` | Created |
| `supabase/migrations/20260627180000_alpha_121_domain_10_operations_schema.sql` | Created |
| `supabase/migrations/20250618190000_alpha_nearby_members.sql` | Superseded note |
| `docs/ALPHA-121_DATABASE_ARCHITECTURE_V1.md` | Domain 04/10 + changelog |

---

## Overall Status

**PASS** — P1, P2, P3 complete on production.
