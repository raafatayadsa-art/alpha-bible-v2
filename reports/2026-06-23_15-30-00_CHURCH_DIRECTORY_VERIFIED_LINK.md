# Church Directory ↔ Alpha Control Verified Churches Link

**Date:** 2026-06-23  
**Project:** Alpha Bible (`usflbjlyadihyitnvzya`)

---

## Executive Summary

Linked **Alpha Control Church Location Manager** (`location_verified`) with **Church Directory** (`is_verified`). Verified churches in platform admin now appear as **موثقة** in directory list/map/filter, with count synced in facets. Migration applied to production; build PASS.

---

## Findings

### Root cause
Two separate flags on `public.churches`:
| Column | Used by |
|--------|---------|
| `location_verified` | Alpha Control `/platform/church-locations` |
| `is_verified` | Church Directory view, search RPC, facets, badges |

Admin verification only set `location_verified` → directory never showed verified badge or filter results.

### Production state (after fix)
| Metric | Count |
|--------|------:|
| Active churches | 1241 |
| `location_verified` | 19 |
| `is_verified` (synced) | 19 |
| Directory `verifiedCount` (facets) | 19 |

---

## Changes Made

### Database (`20250623150000_church_directory_verified_link.sql`)
1. **Backfill** — `is_verified = true` where `location_verified = true`
2. **View** `church_directory` — `is_verified := is_verified OR location_verified`
3. **RPC** `platform_verify_church_location` — also sets `is_verified = true`
4. **RPC** `platform_save_church_google_maps` — also sets `is_verified = true`

### Client
| File | Change |
|------|--------|
| `src/features/church/churches-table.ts` | `isChurchDirectoryVerified()` helper; select `location_verified` |
| `src/features/church/churches-directory-api.ts` | Unified verified mapping |
| `src/features/church-directory/api.ts` | Detail page uses unified flag + `verified_location_url` |
| `src/features/church-directory/types.ts` | `verifiedLocationUrl` on full details |
| `src/features/church-directory/normalize.ts` | Directions prefer admin verified Google Maps URL |
| `src/features/church-directory/components/ChurchDirectoryFullDetailView.tsx` | Pass verified URL to directions |

---

## Warnings

- Only churches with `location_verified = true` in Alpha Control appear under filter **الموثقة** (currently 19 of 1241).
- Legacy `is_verified = true` without location verify still counts as verified in directory view.

---

## Errors

None. Migration applied via Supabase MCP. `npm run build` — **PASS**.

---

## Recommendations

1. Continue verifying churches in Alpha Control — each verify auto-syncs to directory.
2. Optional: show verified count on home card subtitle (currently total only).

---

## Overall Status

**PASS**
