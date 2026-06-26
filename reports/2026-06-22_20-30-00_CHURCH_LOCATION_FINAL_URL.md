# Church Location Manager — Final URL Paste Flow

## Executive Summary

Updated Church Location Manager to support multi-result Google Maps searches. The top verify button was replaced with a **Final Google Maps URL** text input. **Verify Location** saves the pasted URL to `verified_location_url` (or falls back to `google_maps_url` when empty).

## Findings

### UI workflow

1. **Google Maps Search** — opens name/city search (not stored URL)
2. Admin picks correct church on Maps and copies final URL
3. Paste into **Final Google Maps URL**
4. Click **Verify Location**

### Verify logic

| Input | Result |
|-------|--------|
| Pasted URL | `verified_location_url = input`, `location_verified = true` |
| Empty input | `verified_location_url = google_maps_url`, `location_verified = true` |
| Empty input + no `google_maps_url` | Error — verify disabled |

### API / DB

- `verifyChurchLocation(churchId, finalUrl?)` → RPC `platform_verify_church_location(p_church_id, p_final_url)`
- Migration applied on remote: `20250622203000_church_location_verify_final_url`

### Unchanged behavior

- Stats refresh after verify
- Card removed from unverified list
- Next church shown automatically

## Warnings

- `google_maps_url` is not overwritten on verify — only `verified_location_url` and `location_verified` update.
- Churches with neither pasted URL nor `google_maps_url` cannot be verified.

## Errors

- None. Build: **PASS**.

## Recommendations

- Optionally pre-fill input from clipboard when returning from Maps (not requested).
- Consider updating `google_maps_url` when admin pastes a corrected final URL for future searches.

## Overall Status

**PASS**

## Files Changed

| File | Change |
|------|--------|
| `ChurchLocationManagerScreen.tsx` | Search + URL input + Verify Location |
| `church-location-api.ts` | `finalUrl` param + search helpers |
| `20250622203000_church_location_verify_final_url.sql` | RPC accepts optional final URL |
