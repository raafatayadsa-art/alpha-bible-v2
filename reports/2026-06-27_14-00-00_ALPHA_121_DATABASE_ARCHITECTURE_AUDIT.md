# ALPHA-121 — Database Architecture V1 Audit

**Date:** 2026-06-27  
**Project:** Supabase `usflbjlyadihyitnvzya`  
**Scope:** Compare approved Domain classification vs production schema + app usage  
**Overall Status:** PARTIAL

---

## Executive Summary

Production contains **88 base tables + 4 views** mapped across ALPHA-121’s 10 domains. Core architecture aligns well (~85% coverage). Gaps: **12 spec tables not deployed**, **11 production objects not listed in spec**, and **Identity Domain split** (`user_profiles` vs `user_identity_profiles`) needs documented ownership. ALPHA-122 correctly uses `user_profiles` (Domain 01).

---

## Domain Coverage Matrix

| Domain | Spec Tables | On Production | Match |
|--------|-------------|---------------|-------|
| 01 Authentication & Identity | 4 (+ auth.users) | 6 tables | ⚠️ Split identity |
| 02 Church System | 11 | 13 tables | ✅ +2 extras |
| 03 Church Community | 7 | 8 tables | ✅ +1 extra |
| 04 Alpha Connect | 3 (+4 future) | 3 tables | ✅ Future pending |
| 05 Spiritual Content | 18 | 20 tables | ✅ +2 extras |
| 06 Library & Dictionary | 12 | 10 tables + 2 views | ⚠️ `bible_dictionary` missing |
| 07 Publisher Platform | 9 | 9 tables | ✅ Full |
| 08 Platform Management | 17 | 14 tables + 1 view | ⚠️ +1 extra table |
| 09 User Progress | 3 | 3 tables | ✅ Full |
| 10 Operations & Reservations | Future | 0 tables | ⏳ Not started |

---

## DOMAIN 01 — Authentication & Identity

### Spec tables
| Table | Production | Rows | RLS | App wired |
|-------|------------|------|-----|-----------|
| `auth.users` | ✅ Supabase | 2 | Supabase | ✅ |
| `alpha_identities` | ✅ | 0 | ✅ | Client hash fallback only |
| `user_identity_profiles` | ✅ | 0 | ✅ | ❌ Not in frontend |
| `user_profiles` | ✅ | 2 | ✅ | ✅ ALPHA-122 |

### Production extras (recommend add to spec)
| Table | Purpose | Suggested domain |
|-------|---------|------------------|
| `identity_documents` | KYC / document storage | Domain 01 |
| `identity_access_logs` | Identity access audit | Domain 01 |

### Critical note — two profile tables (by design)
| Table | Role |
|-------|------|
| `user_profiles` | Public social identity: `@username`, display_name, avatar, bio (ALPHA-122) |
| `user_identity_profiles` | Verification/trust: legal name, national_id_hash, priest verification, trust_score |

**Recommendation:** Document in ALPHA-121 that both belong to Domain 01 with distinct RLS policies — no merge.

### Removed / deprecated
| Table | Status |
|-------|--------|
| `profiles` (legacy) | **Removed** from production — frontend migrated to `user_profiles` in ALPHA-122 |

### RPCs (Domain 01)
- `is_profile_completed()` → reads `user_profiles`
- `is_username_available(text)` → reads `user_profiles`
- `claim_username(text, text)` → writes `user_profiles`
- `handle_new_user()` trigger → inserts `user_profiles` row

---

## DOMAIN 02 — Church System

### Spec coverage: ✅ All 11 tables present

| Table | Rows |
|-------|------|
| `churches` | 1,241 |
| `church_memberships` | 5 |
| `church_roles` | 4 |
| `church_permissions` | 0 |
| `church_profiles` | 0 |
| `join_requests` | 0 |
| `church_claim_requests` | 0 |
| `church_setup_requests` | 2 |
| `church_transfer_requests` | 0 |
| `church_transfer_members` | 0 |
| `user_church_history` | 0 |

### Production extras (add to spec)
| Table | Rows | Notes |
|-------|------|-------|
| `church_links_import` | 1,241 | Directory import staging |
| `monastery_claim_requests` | 0 | Monastery page claims |

### View
| View | Domain |
|------|--------|
| `church_directory` | Domain 02 (read model) |

---

## DOMAIN 03 — Church Community

### Spec coverage: ✅

| Table | Rows |
|-------|------|
| `church_posts` | 26 |
| `church_messages` | 0 |
| `church_notifications` | 0 |
| `prayer_requests` | 0 |
| `blocked_users` | 0 |
| `family_groups` | 0 |
| `notifications` | 3 |

### Production extra
| Table | Recommendation |
|-------|----------------|
| `priest_messages` | Add to Domain 03 spec |

---

## DOMAIN 04 — Alpha Connect

### Current (spec ✅)
| Table | Rows |
|-------|------|
| `alpha_connect_conversations` | 9 |
| `alpha_connect_conversation_members` | 9 |
| `alpha_connect_messages` | 46 |

### Future (spec ⏳ — not on production)
- `alpha_connect_calls`
- `alpha_connect_channels`
- `alpha_connect_presence`
- `alpha_connect_call_logs`

### Repo migrations not on production
These exist in repo migrations but **not** in production table list:
- `alpha_connect_contacts`
- `alpha_connect_connection_requests`
- `alpha_user_discovery_prefs`
- `alpha_nearby_members` RPC dependencies

**Action:** Either deploy missing Connect tables or remove from repo if superseded.

---

## DOMAIN 05 — Spiritual Content

### Spec coverage: ✅ All 18 listed tables present

Notable row counts: `bible_verses` 35,759 · `daily_verses` 1,221 · `kholagy` 127 · `saints` 2,096

### Production extras (add to spec)
| Table | Rows |
|-------|------|
| `coptic_months` | 13 |
| `coptic_month_slug_aliases` | 23 |

### View
| View | Domain |
|------|--------|
| `synaxarium_catalog_v` | Domain 05 / 06 bridge (catalog read model) |

---

## DOMAIN 06 — Library & Dictionary

### Present ✅
`dictionary_entries`, `dictionary_stopwords`, `alpha_dictionary` (8,123), `alpha_dictionary_deep` (1,244), `bible_encyclopedia` (1,123), `bible_names_dictionary` (3,217), `bible_book_abbreviations` (34), `saints_index` (2,096), `pope_shenouda_audio_sermons` (0)

### Views ✅
- `dictionary_index`
- `synaxarium_catalog_v` (shared with Domain 05)

### Missing from production ❌
| Spec table | Status |
|------------|--------|
| `bible_dictionary` | Not deployed |

---

## DOMAIN 07 — Publisher Platform

### Full match ✅ — all 9 spec tables on production with RLS enabled

---

## DOMAIN 08 — Platform Management

### Present ✅ (14/17 spec tables)

### Missing from production
| Spec table | Status |
|------------|--------|
| — | All listed platform_* tables exist except naming: `approvals` is a **VIEW** over workflow, not separate table |

### Production extra
| Table | Recommendation |
|-------|----------------|
| `platform_trust_profiles` | Add to Domain 08 spec |

### View
| View | Maps to |
|------|---------|
| `approvals` | Domain 08 workflow read model |

---

## DOMAIN 09 — User Progress

### Full match ✅
| Table | Rows |
|-------|------|
| `users_progress` | 0 |
| `saved_verses` | 0 |
| `post_registrations` | 2 |

---

## DOMAIN 10 — Operations & Reservations

### Status: ⏳ Not started
No `trips`, `trip_bookings`, `conferences`, etc. on production. App has client-side trip features (localStorage) — future Domain 10 deployment required.

---

## Architecture Rules Compliance

| Rule | Status | Notes |
|------|--------|-------|
| One domain per table | ⚠️ PARTIAL | Views bridge domains (expected) |
| Independent RLS per domain | ✅ | All 88 tables have RLS enabled |
| FK-only cross-domain links | ⚠️ REVIEW | `user_identity_profiles.father_of_confession_church_id` → churches (OK) |
| No data duplication | ⚠️ | `saints` + `saints_index` + `synaxarium_saints` overlap by design |
| New tables declare domain first | ❌ | No domain metadata in DB comments yet |

---

## Frontend ↔ Domain Alignment

| Domain | Frontend status |
|--------|-----------------|
| 01 Identity | ✅ `user_profiles` via ALPHA-122 |
| 01 Identity | ❌ `user_identity_profiles` not wired |
| 01 Identity | ⚠️ `alpha_identities` table empty; app uses client-derived Alpha ID |
| 04 Connect | ✅ conversations/messages |
| 07 Publisher | ✅ full workspace |
| 02 Church | ✅ churches, memberships, posts |

### Known broken cross-reference
- RPC `list_publisher_team_members` still JOINs deleted `profiles` table → must use `user_profiles`

---

## Findings

1. **ALPHA-121 spec matches production well** for Domains 02, 03, 07, 09.
2. **Domain 01 has intentional split:** `user_profiles` (social) + `user_identity_profiles` (verification).
3. **11 production objects** not listed in spec — should be added to avoid “orphan tables.”
4. **`bible_dictionary`** in spec but not deployed.
5. **Domain 10** entirely future — no DB objects yet.
6. **Repo vs production drift:** some Connect/nearby tables in migrations not on production.

---

## Warnings

1. Do not merge `user_profiles` and `user_identity_profiles` — different permission models.
2. Adding domain comments to tables in Supabase would help enforce ALPHA-121 going forward.
3. `church_links_import` is operational/staging — consider Domain 02 “import” sub-label or separate ops schema.

---

## Errors

None during audit query execution.

---

## Recommendations

1. **Update ALPHA-121 spec** with 11 missing production tables/views.
2. **Document Domain 01 table roles** in one page (social vs verification vs alpha_id).
3. **Fix `list_publisher_team_members`** to join `user_profiles`.
4. **Deploy or retire** Connect nearby/contacts migrations not on production.
5. **Add `COMMENT ON TABLE ... 'DOMAIN:01-Identity'`** for all tables (enforcement).
6. **Plan Domain 10** before moving trip features off localStorage.

---

## Relation to ALPHA-122

ALPHA-122 correctly targets **Domain 01 → `user_profiles`** only. Does not touch `user_identity_profiles` (verification layer) or `alpha_identities` (permanent ID). Architecture-compliant ✅

---

## Overall Status

**PARTIAL** — Architecture approved and largely reflected in production; spec document needs sync with 11 extra objects, 1 missing table, and Domain 01 role clarification.
