# ALPHA-108 — Unified Church & Monastery Pages + Dynamic Creation

**Date:** 2026-06-22  
**Status in spec:** مؤجل لما بعد الإطلاق  
**Priority:** مرتفعة بعد الإطلاق  
**Audit type:** Architecture gap analysis (no implementation)

---

## Executive Summary

ALPHA-108 defines a **unified page lifecycle** for all churches and monasteries, with **admin-only creation** from Alpha Control and **no manual Supabase work**. The app already has a **working church directory** (1,241 churches), directory pages, join flow, and priest setup → approval → provision. **Monasteries (69)** are not in the database. The main gaps are: unified `page_status` enum, claim workflow, monastery table/pages, admin Add Church/Monastery forms, and schema unification between prod and migrations.

---

## Findings

### What exists today ✅

| Area | State |
|------|--------|
| Church directory | `/church/directory`, RPC `search_church_directory`, map/list |
| Church detail page | `/church/directory/$placeId` — name, address, diocese, join button |
| Member hub | `/church` — feed, posts, trips (requires active membership) |
| Join flow | Instant join via `church_memberships` when `is_active = true` |
| New church (user) | `/profile/church/setup` → `church_setup_requests` → Approvals → provision |
| Alpha Control | Church Location Manager, Approvals (church_setup), live church count |
| DB churches | ~1,241 rows on prod (`is_active`, `is_verified`, `location_verified`) |

### What ALPHA-108 requires ❌ (gaps)

| Requirement | Gap |
|-------------|-----|
| Page states: `inactive`, `pending_claim`, `verified`, `suspended` | Prod uses `is_active` + `is_verified`; `status` column unused (all `inactive`) |
| Inactive page message + Join / Claim buttons | Directory hides inactive (`is_active` filter); no claim UI |
| Verified → posts, events, members | Only via separate `/church` hub after membership, not page state |
| **Claim / pending_claim** workflow | Not implemented |
| **Monasteries** table + pages + directory (69) | No `monasteries` table; mock data only |
| **Add Church** from Alpha Control | Only user setup + location manager |
| **Add Monastery** from Alpha Control | Missing |
| Auto page on save (search + directory + join + claim) | Partial: import has directory row only |
| Global search → church/monastery page | `/search` excludes churches |
| Admin suspend → app enforcement | Scan center mock only |

### Architecture today (simplified)

```
Directory (is_active) → Detail page → Join (instant active)
                              ↓
Profile setup → Approval → provision → /church hub

Monasteries: not in DB
```

### Target architecture (ALPHA-108)

```
Directory / Search
       ↓
Church or Monastery Page (page_status aware)
       ↓
Join Request / Claim Request
       ↓
Membership / Verified ownership
       ↓
Community features (posts, events, …)
```

---

## Warnings

1. **Dual schema risk:** Local migrations use `name`, `status=approved`; prod uses `church_name`, `is_active`. Provisioning may fail or write wrong columns until unified.
2. **1241 + 69 rows:** Bulk migration to `page_status` must preserve directory visibility rules.
3. **Instant join vs moderated join:** Spec implies join + claim buttons on inactive pages; current join is instant with no approval.
4. Do not start full ALPHA-108 before launch unless scope is explicitly approved — spec says post-launch.

---

## Errors

None (planning audit only).

---

## Recommendations — Phased rollout (post-launch)

### Phase 0 — Schema foundation (1–2 weeks)
- Add canonical `page_status` enum on `churches` (map from `is_active` / `is_verified`)
- Create `monasteries` table mirroring church page fields
- Migration script for 1,241 churches + 69 monasteries → `inactive` default where unclaimed
- RPCs: `platform_create_church`, `platform_create_monastery`, `platform_set_page_status`
- Unify `churches-table.ts` adapter with single source of truth

### Phase 1 — Unified public pages (2–3 weeks)
- Route: `/church/$id` and `/monastery/$id` (or shared `/place/$kind/$id`)
- State-aware UI: inactive message, join, claim/manage buttons
- Wire directory + global search to same page URL
- `church_claim_requests` / `monastery_claim_requests` tables + Approvals kind

### Phase 2 — Alpha Control admin (1–2 weeks)
- **Churches Management** + **Monasteries Management** cards on `/platform`
- Add Church / Add Monastery forms (fields per spec)
- List, filter by `page_status`, suspend/reactivate
- On save: RPC creates row + page + directory index in one transaction

### Phase 3 — Verified community unlock (2+ weeks)
- On `verified`: enable posts, announcements, events, member/servant admin
- Bridge existing `/church` hub to verified page owner
- Monastery follow + join parity

### Phase 4 — Scale & polish
- Global search facets for churches/monasteries
- Migrant churches, new monasteries workflow
- Analytics in Mission Control dashboard

---

## Key files (current)

| Area | Path |
|------|------|
| Directory | `src/features/church-directory/` |
| Directory routes | `src/routes/church.directory*.tsx` |
| Join | `src/features/church/church-membership-api.ts` |
| Setup / provision | `src/features/church-management/`, `church-provisioning.ts` |
| Platform admin | `src/features/platform-admin/ChurchLocationManagerScreen.tsx` |
| DB view/RPC | `supabase/migrations/20250622170000_church_directory_view.sql` |
| Schema adapter | `src/features/church/churches-table.ts` |

---

## Overall Status

**PLANNING — NOT STARTED** (aligned with spec: post-launch)

Implementation should begin only after explicit go-ahead post-launch.
