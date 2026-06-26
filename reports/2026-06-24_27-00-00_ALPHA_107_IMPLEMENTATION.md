# ALPHA-107 Implementation — Launch + Unified Church Pages

**Date:** 2026-06-24  
**Scope:** Pre-launch stability + Phase 0–2 + Platform admin + Monasteries foundation

---

## Executive Summary

Implemented the phased ALPHA-107 rollout without rebuilding approved directory/map UI. Pre-launch: list search now opens the unified detail page directly; geocoding easy-mode npm scripts added. Phase 0 migration file is ready (must be applied in Supabase). Phase 1 wires `page_status`, claim UI, and join on the existing detail view. Phase 2 bridges verified churches to `/church` hub. Platform admin gained Churches/Monasteries management cards and `church_claim` approval sync.

**Build:** `npm run build` — PASS (exit 0)

---

## Findings

### Pre-launch (Launch + map + geocoding + join)

| Item | Status |
|------|--------|
| Map themes / markers | Preserved (no rebuild) |
| List → detail navigation | **Fixed** — tap row navigates to `/church/directory/$placeId` |
| Geocoding easy mode | **Scripts:** `npm run geocode:easy`, `npm run geocode:export` |
| Join flow | **Unchanged** — `JoinChurchButton` on detail page; membership API stable |

### Phase 0 — Schema + claim tables

Migration: `supabase/migrations/20250624200000_alpha_107_page_status_claim.sql`

- Enum `place_page_status`
- `churches.page_status` + backfill from `is_verified` / `location_verified` / `is_active`
- Tables: `church_claim_requests`, `monasteries`, `monastery_claim_requests`
- View `church_directory` exposes `page_status`
- RPCs: `submit_church_claim`, `get_church_claim_status`

**Not applied remotely in this session** — apply via Supabase SQL Editor or CLI.

### Phase 1 — Unified page shell (detail view)

New feature module: `src/features/church-page/`

Wired into `ChurchDirectoryFullDetailView`:

- `ChurchPageStatusBanner`
- `ClaimChurchButton` (+ live status via RPC)
- `JoinChurchButton` (existing)
- `pageStatus` on `ChurchDirectoryFullDetails` via `deriveChurchPageStatus` fallback

API: `fetchChurchDirectoryFullDetails` selects `page_status`, `is_active`.

### Phase 2 — Bridge to `/church` hub

- `ChurchCommunityHubLink` shown when `pageStatus === "verified"`
- Membership check via `getActiveMembershipChurchId`
- CTA: member → "افتح مجتمع الكنيسة" / guest → "استكشف مجتمع الكنيسة" → `/church`

### Monasteries + Platform admin

| Route | Screen |
|-------|--------|
| `/platform/churches` | `ChurchesManagementScreen` — stats + filter by `page_status` + quick verify/suspend |
| `/platform/monasteries` | `MonasteriesManagementScreen` — list from `monasteries` table |
| Alpha Control home | Two new module cards under Tools |

Approvals:

- Kind `church_claim` added to platform types + filters
- `syncChurchClaimApproval` on approve/reject updates `church_claim_requests` + `churches.page_status`

---

## Warnings

1. **Apply migration before testing claim/RPC** — without `page_status` column, detail fetch may fail on `page_status` select until migration runs.
2. **Geocoding still manual** — run `npm run geocode:easy` then paste `reports/geocode-updates.sql` in Supabase SQL Editor (no service role key required).
3. **`monasteries` table is empty** until seed import — admin screen will show empty state.
4. **Public monastery pages** not routed yet — admin foundation only; public `/monastery/...` is next slice.
5. **Church claim approve** sets `is_verified=true` — aligns with existing verified badge/hub gate; review if product wants location_verified separate.

---

## Errors

None in build. Migration not applied (environment — no Supabase apply MCP in session).

---

## Recommendations

1. **Apply migration now:**
   ```sql
   -- Paste contents of supabase/migrations/20250624200000_alpha_107_page_status_claim.sql
   ```
2. **Run geocoding batch:** `npm run geocode:easy` → apply generated SQL.
3. **Smoke test:** directory list tap → detail → claim (logged in) → approve in `/platform/approvals` → verify hub link appears.
4. **Seed 69 monasteries** into `monasteries` table (CSV/script) then add public directory route.
5. **RLS tighten** on `church_claim_requests` insert (currently RPC-only via security definer — OK for v1).

---

## Overall Status

**PARTIAL** — Client + migration file complete; DB migration + geocode SQL apply pending on Supabase.

---

## Changed files (summary)

- `src/features/church-directory/` — types, api, screen navigation, detail view
- `src/features/church-page/` — status, claim API, UI components
- `src/features/platform-admin/` — church_claim sync, management screens, types
- `src/routes/platform.churches.tsx`, `platform.monasteries.tsx`
- `supabase/migrations/20250624200000_alpha_107_page_status_claim.sql`
- `package.json` — `geocode:easy`, `geocode:export`
