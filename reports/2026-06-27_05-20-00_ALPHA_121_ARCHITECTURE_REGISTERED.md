# ALPHA-121 — Database Architecture V1 (Registered)

**Date:** 2026-06-27  
**Ticket:** ALPHA-121  
**Status in spec:** Approved · Critical Architecture  
**Scope:** Register approved domain classification; reconcile with production + repo  
**Overall Status:** PARTIAL (architecture approved; enforcement in progress)

---

## Executive Summary

**ALPHA-121** is registered as the canonical database architecture for Alpha. Production (~88 tables + 4 views) aligns with the 10-domain model at **~85%**. Spec document, audit, RPC fix, and Cursor enforcement rule are in place. Remaining work: domain comments on all tables, deploy/retire orphan Connect migrations, Domain 10, and `bible_dictionary`.

---

## Spec vs Production — Domain Matrix

| Domain | Name | Spec tables | Production | Status |
|--------|------|-------------|------------|--------|
| 01 | Authentication & Identity | 4 + auth.users | 6 tables | ⚠️ Intentional split (`user_profiles` / `user_identity_profiles`) |
| 02 | Church System | 11 | 13 + view | ✅ + staging/claims |
| 03 | Church Community | 7 | 10 | ✅ + comments/reactions/priest_messages |
| 04 | Alpha Connect | 3 (+4 future) | 3 (+ `alpha_user_presence`) | ✅ Future calls/channels pending |
| 05 | Spiritual Content | 18 | 22 + view | ✅ + coptic + saint gallery |
| 06 | Library & Dictionary | 12 | 10 + 2 views | ⚠️ `bible_dictionary` not deployed |
| 07 | Publisher Platform | 9 | 9 | ✅ Full |
| 08 | Platform Management | 17 | 14 + 1 view | ✅ + `platform_trust_profiles` |
| 09 | User Progress | 3 | 3 | ✅ Full |
| 10 | Operations & Reservations | Planned | 0 | ⏳ Not started |

---

## Architecture Rules — Compliance

| Rule | Status |
|------|--------|
| One domain per table | ⚠️ Views bridge domains (by design) |
| Independent RLS per domain | ✅ All production tables RLS-enabled |
| FK-only cross-domain links | ✅ Review on new FKs |
| No data duplication | ⚠️ Saints/synaxarium indexes overlap by design |
| Declare domain before new table | ✅ Cursor rule + migration comments (Domain 01 started) |
| New tables inherit domain permissions | ✅ Policy pattern per feature |

---

## Already Done (2026-06-27)

| Item | Location |
|------|----------|
| Canonical spec (production-synced) | `docs/ALPHA-121_DATABASE_ARCHITECTURE_V1.md` |
| Production audit | `reports/2026-06-27_14-00-00_ALPHA_121_DATABASE_ARCHITECTURE_AUDIT.md` |
| RPC fix `list_publisher_team_members` → `user_profiles` | `supabase/migrations/20260627140000_alpha_121_user_profiles_rpc_fix.sql` |
| Domain 01 `COMMENT ON TABLE` | Same migration (applied production) |
| Cursor enforcement rule | `.cursor/rules/alpha-121-database-domains.mdc` |

---

## Findings

1. **Approved spec matches production** for core product domains (Church, Connect MVP, Publisher, Platform, Progress).
2. **Domain 01** uses two profile tables by design — social vs verification; `profiles` legacy removed.
3. **Production extras** documented in spec: `identity_documents`, `church_links_import`, `monastery_claim_requests`, `priest_messages`, `platform_trust_profiles`, `coptic_months`, `church_post_comments/reactions`, `saint_gallery_*`, `alpha_user_presence`.
4. **Repo-only Connect tables** (`alpha_connect_contacts`, `alpha_connect_connection_requests`, `alpha_user_discovery_prefs`) — not on production; deploy or retire.
5. **Domain 10** entirely future; trip UI still client/local until DB exists.

---

## Warnings

1. Do not create tables without domain header + `COMMENT ON TABLE`.
2. Do not merge `user_profiles` and `user_identity_profiles`.
3. `alpha_user_presence` may be renamed/consolidated into future `alpha_connect_presence`.

---

## Errors

None.

---

## Recommendations (Priority)

1. **P1:** Migration batch — `COMMENT ON TABLE` for Domains 02–09 (enforcement).
2. **P1:** Resolve Connect repo/production drift (nearby/contacts migrations).
3. **P2:** Deploy `bible_dictionary` or remove from spec until ready.
4. **P2:** Wire `user_identity_profiles` + `alpha_identities` in frontend (Domain 01 completion).
5. **P3:** Design Domain 10 schema before moving trips off localStorage.

---

## Reference

Full approved domain table lists: user message ALPHA-121 (2026-06-27 05:20) + `docs/ALPHA-121_DATABASE_ARCHITECTURE_V1.md`.
