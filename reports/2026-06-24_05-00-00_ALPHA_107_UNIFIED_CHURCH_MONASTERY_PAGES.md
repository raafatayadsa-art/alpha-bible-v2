# ALPHA-107 — Unified Church & Monastery Pages System

**Date:** 2026-06-24  
**Status in spec:** مؤجل لما بعد الإطلاق  
**Priority:** متوسطة  
**Audit type:** Current-state vs target architecture (no implementation)

---

## Executive Summary

ALPHA-107 defines unifying **Directory → Page → Join → Membership → Community** for churches and monasteries, with all pages pre-created by Alpha and claimed later by priests/admins. The app already has a **strong church directory foundation** (search, map, detail page, join). **Monastery pages and the unified `page_status` lifecycle are not built yet.** Recommended: defer full build until post-launch priest/church approval system is stable, then execute in 4 phases.

---

## Findings

### What exists today ✅

| Area | Current state |
|------|----------------|
| Church directory | `/church/directory` — search, filters, map, list (~1241 churches) |
| Church detail page | `/church/directory/$placeId` — hero, location, priest, members, join |
| Join flow | `JoinChurchButton` on detail page; instant membership when church active |
| Church hub | `/church` — feed, posts, trips (after membership) |
| Admin tools | Alpha Control location verify, approvals for new church setup |
| Geocoding | Offline Google geocoding pipeline for missing coordinates |
| Verified map pins | Alpha Control `location_verified` + coords |

### Gaps vs ALPHA-107 ❌

| Requirement | Gap |
|-------------|-----|
| Unified `page_status`: inactive / pending_claim / verified / suspended | DB uses `is_active`, `is_verified`, `location_verified` — no claim lifecycle |
| Inactive page message + Join + Claim buttons | Detail page shows join; no inactive banner; no claim/manage request |
| Search → real page directly | Directory list opens map/card; detail route exists but not unified with `/church` hub |
| Claim workflow → Verified Church | Not implemented |
| Verified unlock (posts, events, members admin) | Hub exists separately; not tied to page_status |
| **Monasteries** (69) — directory + pages + follow/join/claim | No monastery routes/features in `src/` yet |
| No user-created churches/monasteries | User can still submit setup via `/profile/church/setup` (conflicts with spec rule) |
| Directory = Page = Join (single entity) | Partially split: directory detail vs `/church` community hub |

### Architecture today

```
Directory → /church/directory/$placeId (info + join)
                ↓
         /church hub (if member)

Monasteries: not in app routes
```

### Target (ALPHA-107)

```
Directory / Search
       ↓
Church or Monastery Page (page_status aware)
       ↓
Join Request / Claim Request
       ↓
Membership / Verified ownership
       ↓
Community features
```

---

## Warnings

1. **Do not rebuild approved directory/map UI** — extend it; preserve Alpha DNA per project rules.
2. **1241 + 69 rows** need migration to `page_status` without breaking search/map RPCs.
3. **Instant join vs moderated join** — spec implies buttons on inactive pages; current join is immediate.
4. **Existing `/profile/church/setup`** conflicts with “no user creates church” rule — needs product decision at launch.
5. Spec depends on **priest approval system** maturity post-launch.

---

## Errors

None (planning audit only).

---

## Recommendations — Phased rollout (post-launch)

### Phase 0 — Schema (1–2 weeks)
- Add `page_status` enum on `churches`
- Create `monasteries` table + directory RPCs
- Bulk set existing rows → `inactive` (or map verified churches → `verified`)
- RPCs: `platform_create_church`, `platform_create_monastery`, `platform_set_page_status`, `submit_church_claim`

### Phase 1 — Unified public pages (2–3 weeks)
- Shared page shell for church + monastery
- State-aware UI: inactive message, join, claim/manage
- Wire directory search results → same page URL
- Claim request tables + Alpha Control approval

### Phase 2 — Verified unlock (2+ weeks)
- On `verified`: bridge to existing `/church` hub features
- Monastery follow + join parity

### Phase 3 — Admin & polish
- Platform cards: Churches Management, Monasteries Management
- Suspend/reactivate enforcement
- Global search includes churches + monasteries

---

## Overall Status

**PLANNING — NOT STARTED** (aligned with spec: post-launch)

---

## COPYABLE REPORT

```
ALPHA-107 — 2026-06-24 | PLANNING
- Church directory + detail + join: EXISTS
- page_status + claim workflow: MISSING
- Monastery pages (69): MISSING
- Defer until post-launch per spec
- Phase 0: schema → Phase 1: unified pages → Phase 2: verified unlock
```
