# ALPHA-CHURCH-LOCATION-MANAGER-001 — Church Location Manager

**Date:** 2026-06-22  
**Task ID:** ALPHA-CHURCH-LOCATION-MANAGER-001  
**Scope:** Platform admin screen only (no admin redesign)

---

## Executive Summary

Implemented **Church Location Manager** inside the existing Platform Mission Control panel. Admins can search/filter 1,241 active churches, open Google Maps search, copy search text, and save a Google Maps URL — which sets `location_verified = true`. Build **PASS**.

---

## Findings

| Item | Detail |
|------|--------|
| Route | `/platform/church-locations` (PIN-gated via `PlatformAccessGate`) |
| Entry | New `LuxuryCommandCard` on `/platform` home — **مدير مواقع الكنائس** |
| Stats | Total · verified · unverified · progress % (from `location_verified`) |
| Search | `church_name`, `city`, `governorate` (debounced 280ms) |
| Filters | All · verified only · unverified only |
| Pagination | 30 rows/page + **تحميل المزيد** |
| Save dialog | Updates `google_maps_url` + `location_verified = true` |
| Audit | Local audit log entry on successful save |
| DB columns | `google_maps_url`, `location_verified` (migration added for local parity) |
| Live DB (prior audit) | 1241 active churches, 0 with `location_verified = true` |

### Files Added

- `src/features/platform-admin/church-location-api.ts`
- `src/features/platform-admin/ChurchLocationManagerScreen.tsx`
- `src/routes/platform.church-locations.tsx`
- `supabase/migrations/20250622180000_church_location_verified.sql`

### Files Updated

- `src/features/platform-admin/index.ts`
- `src/features/platform-admin/AlphaMissionControl.tsx`
- `src/features/platform-admin/mission-control-ui.tsx` (`COMMAND_ICONS.churchLocations`)

---

## Warnings

1. **Stats vs coordinates:** `location_verified` is independent of `latitude`/`longitude`. Churches with coords but no saved Maps URL still show as **غير موثق** until admin saves a link.
2. **PostgREST search:** Multi-field `.or()` ilike may need tuning for edge-case Arabic punctuation; empty search loads full paginated list.
3. **RLS:** Updates use the anon/authenticated client; production relies on existing permissive `churches_service_write` policy — consider tightening to platform-owner role later.

---

## Errors

None. `npm run build` completed successfully.

---

## Recommendations

1. Apply migration `20250622180000_church_location_verified.sql` on any environment missing the columns.
2. Optionally backfill `location_verified = true` where a valid `google_maps_url` already exists.
3. Add server-side RPC with `security definer` if RLS is tightened for church writes.

---

## Overall Status

**PASS**
