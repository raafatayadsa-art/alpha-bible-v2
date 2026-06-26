# Church Location Manager — Auto Verify All

## Executive Summary

Added **🤖 Auto Verify All** to Church Location Manager. It scans all `location_verified = false` churches, classifies each `google_maps_url` using **URL structure heuristics only** (no Google Places API, no browser automation), then applies verify or `needs_review` or counts as failed.

## Findings

### Verification mechanism (honest)

| Method used | Used? |
|-------------|-------|
| Google Places API | **No** |
| Browser automation | **No** |
| HTTP fetch to Google Maps | **No** |
| URL string heuristics | **Yes** |

**Auto-verify ONLY when URL structure indicates one pinned place:**

- `/maps/place/…`
- `place_id=` parameter
- `cid=` or `ftid=` parameters

**`needs_review` when:**

- `/maps/search/` or text `q=` / `query=` without place path
- Coordinate-only pins
- Short links (`goo.gl`, `maps.app.goo.gl`) — cannot resolve without redirect
- Ambiguous / unknown patterns

**Failed when:**

- Missing `google_maps_url`
- Invalid URL or non-Google host
- Database RPC error

No fake verification when result count cannot be determined from the URL alone.

### UI

- Button: **🤖 Auto Verify All** with progress counter
- Confirm dialog explains mechanism before run
- Report modal: Verified Automatically · Needs Manual Review · Failed + samples + mechanism notes
- Cards show **مراجعة** badge when `location_status = 'needs_review'`

### Database

- Column: `location_status` (`needs_review` | null)
- RPC: `platform_mark_church_location_needs_review`
- Verify RPC clears `location_status` on success
- Migration applied on remote

## Warnings

- Short Google links always go to manual review — correct by design.
- Bulk run over ~1200 churches may take several minutes (sequential RPC per row).
- Heuristics may miss edge-case place URL formats → marked `needs_review`, not auto-verified.

## Errors

- None. Build: **PASS**.

## Recommendations

- Future: optional server-side redirect resolver for short links (still no Places API).
- Filter chip for `needs_review` queue if volume grows.

## Overall Status

**PASS**

## Files Added/Changed

| File | Role |
|------|------|
| `church-location-url-classifier.ts` | URL heuristics + mechanism docs |
| `church-location-api.ts` | `runAutoVerifyAll`, `markChurchLocationNeedsReview` |
| `ChurchLocationManagerScreen.tsx` | Button, progress, report dialog |
| `20250622210000_church_location_status.sql` | `location_status` + RPCs |
