# ALPHA-121 — Alpha Database Architecture V1

**Status:** Approved  
**Priority:** Critical Architecture  
**Last synced with production:** 2026-06-27

---

## Objective

Organize all Alpha tables into clear **Permission Domains**. Each domain owns independent RLS. Every table belongs to exactly one domain.

**Rule:** No new table may be created outside this classification.

---

## Architecture Rules

1. Each domain has its own permission model and RLS policies.
2. Cross-domain links use explicit foreign keys only.
3. No duplicated data across domains.
4. Every new feature must declare its domain before creating tables.
5. New tables inherit the permission domain of their parent feature.

---

## DOMAIN 01 — Authentication & Identity

**Responsibility:** Login, digital identity, Alpha ID, `@username`, personal QR, social profile, verification/KYC.

| Table / Object | Role |
|----------------|------|
| `auth.users` | Supabase auth (managed) |
| `user_profiles` | Social identity: `@username`, display_name, avatar, bio (**ALPHA-122**) |
| `user_identity_profiles` | Verification/trust: legal name, national_id_hash, priest verification, trust_score |
| `alpha_identities` | Permanent Alpha ID (ALPHA-076), QR version |
| `identity_documents` | KYC document references |
| `identity_access_logs` | Identity access audit trail |

**Deprecated:** `profiles` (legacy) — removed; use `user_profiles`.

**RPCs:** `is_profile_completed`, `is_username_available`, `claim_username`, `handle_new_user` (trigger)

---

## DOMAIN 02 — Church System

**Responsibility:** Churches, memberships, roles, transfers, church approval.

| Table / Object | Role |
|----------------|------|
| `churches` | Church master records |
| `church_profiles` | Extended church profile data |
| `church_memberships` | User ↔ church membership |
| `church_roles` | Role definitions |
| `church_permissions` | Permission grants |
| `join_requests` | Membership join requests |
| `church_claim_requests` | Church page ownership claims |
| `monastery_claim_requests` | Monastery page ownership claims |
| `church_setup_requests` | New church setup workflow |
| `church_transfer_requests` | Bulk membership transfers |
| `church_transfer_members` | Transfer member rows |
| `user_church_history` | Historical church membership |
| `church_links_import` | Directory import staging |

**Views:** `church_directory`

---

## DOMAIN 03 — Church Community

**Responsibility:** Church community, posts, prayer, notifications, families.

| Table | Role |
|-------|------|
| `church_posts` | Church feed posts |
| `church_post_comments` | Post comments |
| `church_post_reactions` | Post reactions |
| `church_messages` | Church messaging |
| `priest_messages` | Priest ↔ member messages |
| `church_notifications` | Church-scoped notifications |
| `prayer_requests` | Prayer request board |
| `blocked_users` | User blocks |
| `family_groups` | Family groups |
| `notifications` | Platform notifications |

---

## DOMAIN 04 — Alpha Connect

**Responsibility:** Messaging, calls, channels, presence.

| Table | Status |
|-------|--------|
| `alpha_connect_conversations` | ✅ Live |
| `alpha_connect_conversation_members` | ✅ Live |
| `alpha_connect_messages` | ✅ Live |
| `alpha_user_presence` | ✅ Live |
| `alpha_user_discovery_prefs` | ✅ Live (nearby discovery) |
| `alpha_connect_connection_requests` | ✅ Live |
| `alpha_connect_contacts` | ✅ Live |
| `alpha_connect_calls` | ⏳ Planned |
| `alpha_connect_channels` | ⏳ Planned |
| `alpha_connect_presence` | ⏳ Planned |
| `alpha_connect_call_logs` | ⏳ Planned |

---

## DOMAIN 05 — Spiritual Content

**Responsibility:** Bible, Agpeya, Synaxarium, Katameros, Kholagy, liturgical content.

| Table | Role |
|-------|------|
| `bible_verses` | Bible text |
| `daily_verses` | Daily verse pool |
| `daily_verse_assignments` | Daily verse scheduling |
| `daily_content` | Daily content bundle |
| `agpeya_prayers` | Agpeya prayers |
| `agpeya_sections` | Agpeya sections |
| `katamaros_days` | Katameros calendar days |
| `katamaros_readings` | Katameros readings (legacy name) |
| `katameros_readings` | Katameros readings |
| `synaxarium_days` | Synaxarium calendar |
| `synaxarium_entries` | Synaxarium entries |
| `synaxarium_events` | Synaxarium events |
| `synaxarium_saints` | Premium saint gallery links |
| `kholagy` | Hymn / tasbeha lyrics |
| `kholagy_liturgies` | Kholagy liturgy structure |
| `saints` | Saints master |
| `monasteries` | Monasteries directory |
| `liturgical_occasions` | Liturgical occasions |
| `coptic_months` | Coptic month metadata |
| `coptic_month_slug_aliases` | Month slug aliases |
| `saint_gallery_images` | Saint community gallery images |
| `saint_gallery_likes` | Gallery likes |

**Views:** `synaxarium_catalog_v` (catalog read model; shared with Domain 06)

---

## DOMAIN 06 — Library & Dictionary

**Responsibility:** Encyclopedias, dictionaries, indexing, search.

| Table / View | Role |
|--------------|------|
| `dictionary_entries` | Dictionary entries |
| `dictionary_index` | **View** — search index |
| `dictionary_stopwords` | Stopwords |
| `alpha_dictionary` | Alpha dictionary |
| `alpha_dictionary_deep` | Deep dictionary |
| `bible_encyclopedia` | Bible encyclopedia |
| `bible_names_dictionary` | Bible names |
| `bible_book_abbreviations` | Book abbreviations |
| `saints_index` | Saints search index |
| `synaxarium_catalog_v` | **View** — unified synaxarium catalog |
| `pope_shenouda_audio_sermons` | Audio sermon library |

**Planned:** `bible_dictionary` (not yet deployed)

---

## DOMAIN 07 — Publisher Platform

**Responsibility:** Publishers, content, rights, teams.

| Table | Role |
|-------|------|
| `publishers` | Publisher accounts |
| `publisher_content_items` | Content items |
| `publisher_team_members` | Team membership |
| `publisher_page_follows` | Follows |
| `publisher_page_likes` | Likes |
| `publisher_policy_actions` | Policy enforcement |
| `publisher_terms_acceptance` | Terms acceptance |
| `publisher_copyright_reports` | Copyright reports |
| `publisher_legal_consents` | Legal consents |

---

## DOMAIN 08 — Platform Management

**Responsibility:** Alpha Control, reports, support, AI rules, audit.

| Table / View | Role |
|--------------|------|
| `platform_modules` | Feature module toggles |
| `platform_settings` | Global settings |
| `platform_dashboard_stats` | Dashboard stats |
| `platform_reports` | User reports |
| `platform_audit_log` | Audit log |
| `platform_scan_history` | QR scan history |
| `platform_library_docs` | Internal docs |
| `platform_privacy_metrics` | Privacy metrics |
| `platform_emergency` | Emergency mode |
| `platform_owners` | Platform owners |
| `platform_approvals` | Approval workflow |
| `platform_approval_notifications` | Approval notifications |
| `platform_ai_rules` | AI rules |
| `platform_trust_profiles` | Trust center profiles |
| `support_tickets` | Support tickets |
| `approvals` | **View** — approval read model |
| `app_reviews` | App store reviews |
| `feature_requests` | Feature requests |

---

## DOMAIN 09 — User Progress

**Responsibility:** Spiritual progress, saved verses, registrations.

| Table | Role |
|-------|------|
| `users_progress` | Reading / journey progress |
| `saved_verses` | Saved verses |
| `post_registrations` | Event / post registrations |

---

## DOMAIN 10 — Operations & Reservations

**Responsibility:** Trips, conferences, bookings, buses, check-in.

**Status:** ✅ Schema + client wiring complete (2026-06-27, P1–P10). Dual-write: Domain 10 primary remote + localStorage optimistic fallback. Domain 09 `post_registrations` remains registration UX source until deprecation phase.

| Table | Role |
|-------|------|
| `trips` | Trip master (`post_id` bridges church feed) |
| `trip_bookings` | Seat bookings |
| `waiting_lists` | Smart waitlist |
| `buses` | Bus fleet |
| `bus_assignments` | Seat assignments |
| `accommodations` | Lodging |
| `trip_payments` | Payment ledger |
| `trip_prayer_requests` | Trip prayer board (ALPHA-088) |
| `trip_participation_certificates` | Digital certificates (ALPHA-089) |
| `trip_companion_groups` | Room/seat matching (ALPHA-096) |
| `trip_pilgrimage_passport_entries` | Spiritual journey log (ALPHA-097) |
| `trip_memory_albums` | Post-trip album (ALPHA-090) |
| `trip_emergency_contacts` | Emergency contacts (ALPHA-094) |
| `trip_timeline_events` | Timeline replay (ALPHA-091) |
| `trip_organizer_trust_stats` | Organizer reputation (ALPHA-093) |
| `trip_channels` | Trip group chat links |
| `organizer_channels` | Organizer channels |
| `check_ins` | Geo/QR/manual check-in |
| `attendance_logs` | Attendance audit |
| `conferences` | Conferences |
| `conference_registrations` | Conference registrations |
| `events` | Generic events |

**Migration base:** `supabase/migrations/20260627180000_alpha_121_domain_10_operations_schema.sql`

**Client module map:** `src/features/church/trip-reservations/` → `trip-domain-api.ts` bridge

### Domain 09 → 10 deprecation plan (post-P10)

| Phase | Action |
|-------|--------|
| D1 | Read path: prefer `trip_bookings` when `isDomain10RemoteAvailable()` |
| D2 | Write path: `post_registrations` mirror-only; bookings authoritative |
| D3 | Remove localStorage fallbacks behind feature flag |
| D4 | Drop redundant D09 trip columns / consolidate RPCs |

**P4 (2026-06-27):** `trip-domain-api.ts` + waitlist/booking mirror to `trips` / `waiting_lists` / `trip_bookings`; RPC `ensure_trip_for_post`.

**P5 (2026-06-27):** Buses/check-in wire + `trip_is_organizer` RLS (`20260627200000`).

**P6 (2026-06-27):** Wallet → `trip_payments`; `resolveTripPostContext`; church-scoped RLS + `user_in_church` (`20260627210000`).

**P7 (2026-06-27):** Bookings/waitlist church RLS; `trip_prayer_requests` + wire; organizer payment panel (`20260627220000`).

**P8 (2026-06-27):** `offer_next_waitlist_seat` RPC; certificates + companion groups; custom payment amounts (`20260627230000`).

**P9 (2026-06-27):** Passport + memory album + emergency contacts; waitlist realtime; Domain 10 types (`20260627240000`).

**P10 (2026-06-27):** Timeline + organizer trust wire; `database.generated.ts` + typed client (`20260627250000`).

---

## Related tickets

| Ticket | Domain | Notes |
|--------|--------|-------|
| ALPHA-122 | 01 | Username onboarding → `user_profiles` |
| ALPHA-076 | 01 | Alpha ID → `alpha_identities` |
| ALPHA-PROFILE-004 | 01 | Social fields → `user_profiles` |

---

## Change log

| Date | Change |
|------|--------|
| 2026-06-27 | Initial production sync: added 11 missing tables/views, deprecated `profiles`, documented Domain 01 split |
| 2026-06-27 | Spec re-confirmed (ALPHA-121 Approved): added `church_post_*`, `saint_gallery_*`, `alpha_user_presence`; Cursor rule added |
| 2026-06-27 | Migration `20260627160000_alpha_121_domain_comments_02_09` — `COMMENT ON TABLE/VIEW` for Domains 02–09 on production |
| 2026-06-27 | P1 Connect deploy: presence + nearby + contacts (`20260627170000`) |
| 2026-06-27 | P2 Church post comments/reactions deploy (`20260627171000`) |
| 2026-06-27 | P3 Domain 10 operations schema v1 (`20260627180000`) |
| 2026-06-27 | P4 Domain 10 client wire + `ensure_trip_for_post` (`20260627190000`) |
| 2026-06-27 | P5 Buses/check-in wire + organizer RLS (`20260627200000`) |
| 2026-06-27 | P6 Wallet/church scope + `trip_payments` RLS (`20260627210000`) |
| 2026-06-27 | P7 Bookings/waitlist RLS + trip prayers + organizer payments (`20260627220000`) |
| 2026-06-27 | P8 Waitlist RPC + certificates + companion groups (`20260627230000`) |
| 2026-06-27 | P9 Archive/passport/emergency wire + waitlist realtime (`20260627240000`) |
| 2026-06-27 | P10 Timeline/trust wire + Supabase Database types (`20260627250000`) |
