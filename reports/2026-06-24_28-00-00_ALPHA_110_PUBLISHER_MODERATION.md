# ALPHA-110 — Publisher Verification & Content Moderation (Phase 1 Foundation)

**Date:** 2026-06-24  
**Scope:** Schema + private workspace + content moderation + Alpha Control integration

---

## Executive Summary

Implemented **ALPHA-110 Phase 1 foundation** aligned with ALPHA-107: unified `publishers` entity, private workspace with draft banner and readiness (0–100%), content items with **Pending Review** only, Content Review Center in Alpha Control, and approval sync for `publisher_setup`, `publisher_publication`, and `content_review`. Churches/monasteries remain **claim-only** (not self-created publisher pages).

**Build note:** Full `tsc` reports pre-existing project errors; new publisher/platform files lint clean.

---

## Findings

### Delivered ✅

| Area | Implementation |
|------|----------------|
| **Schema** | `supabase/migrations/20250624210000_alpha_110_publishers_content.sql` |
| **Publisher types** | church, monastery, hymn_team, choir, priest, bishop, church_service, publishing_house, institution |
| **Publisher lifecycle** | under_review → draft → pending_publication → published / suspended |
| **Private workspace** | `/publisher/workspace/$publisherId` — edit profile, add content, readiness, preview |
| **Apply flow** | `/publisher/apply` — choir, hymn team, publishing house, etc. only |
| **Draft banner** | Spec message: *"هذه الصفحة تحت المراجعة…"* |
| **Readiness 0–100%** | cover, logo, bio, contact, first content — blocks final submit until 100% |
| **Preview mode** | `/publisher/preview/$publisherId` |
| **Content moderation** | All content → `pending_review` + `platform_approvals` kind `content_review` |
| **Content Review Center** | `/platform/content-review` — accept / reject / needs changes |
| **Approvals sync** | `platform-api.ts` — publisher_setup, publisher_publication, content_review |
| **ALPHA-107 bridge** | `ensure_church_publisher` on church claim approve |
| **Profile entry** | "صفحات الناشر" → `/publisher` |
| **Alpha Control card** | Content Review under Tools |

### Routes

| Path | Purpose |
|------|---------|
| `/publisher` | My publisher pages hub |
| `/publisher/apply` | New publisher application |
| `/publisher/workspace/$publisherId` | Private workspace |
| `/publisher/preview/$publisherId` | Preview as public page |
| `/platform/content-review` | Admin content queue |

### Not in this phase (by design) ⏸️

- Audio file upload / album player
- PDF library storage
- Trusted Publisher fast-track (schema has `is_trusted` — admin patch API ready)
- Public search indexing of publishers
- Full publisher tabs (video, playlists UI)
- Church post moderation policy change

---

## Warnings

1. **Apply both migrations** on Supabase before testing:
   - `20250624200000_alpha_107_page_status_claim.sql`
   - `20250624210000_alpha_110_publishers_content.sql`
2. **Logo/cover** use URL fields in v1 — no storage bucket upload yet.
3. **Admin RLS** uses authenticated read/update policies (dev parity with platform tables).
4. **Monasteries/churches** must use directory **claim**, not `/publisher/apply`.

---

## Errors

None in new module lints. Migration not applied remotely in this session.

---

## Recommendations

1. Apply migrations in Supabase SQL Editor.
2. Test flow: Profile → صفحات الناشر → Apply → Workspace → add content → Content Review → Approvals for publication.
3. Phase 2: audio storage bucket + album UI + public `/publisher/$id` route.
4. Phase 3: `is_trusted` fast-track + church post moderation policy.

---

## Overall Status

**PARTIAL** — Client + migration complete; DB apply + end-to-end test pending.

---

## COPYABLE REPORT

```
ALPHA-110 Phase 1 — 2026-06-24 | PARTIAL
- Migration: supabase/migrations/20250624210000_alpha_110_publishers_content.sql
- Feature: src/features/publisher/
- Admin: /platform/content-review
- Routes: /publisher, /publisher/apply, /publisher/workspace/$id, /publisher/preview/$id
- Approvals: publisher_setup, publisher_publication, content_review
- ALPHA-107 bridge: ensure_church_publisher on claim approve
- Apply migrations on Supabase then test
Report: reports/2026-06-24_28-00-00_ALPHA_110_PUBLISHER_MODERATION.md
```
