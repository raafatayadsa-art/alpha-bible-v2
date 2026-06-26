# Church Location Manager — One-Tap Verify Flow

## Executive Summary

Updated **Church Location Manager** (`/platform/church-locations`) to remove URL paste workflow. Admins now open the existing `google_maps_url` from the database, review on Maps, then tap **✅ اعتماد الموقع** to verify in one step. No dialog, no copy/paste, no `verified_location_url` field in the UI.

## Findings

### UI changes (done)

| Before | After |
|--------|-------|
| MapsUrlDialog — paste/save URL | **Removed** |
| Google Maps Search → encoded name query | Opens **`google_maps_url`** from DB |
| Maps Link / Save button | **Removed** |
| Copy church name button | **Removed** |
| URL shown in card | **Removed** |
| — | **✅ اعتماد الموقع** button added |

### Post-approve behavior

- Stats counter refreshes (`verified` / `unverified` / progress %)
- Approved card removed from list immediately
- Default filter: **غير الموثقة فقط** — next unverified church appears at top
- Toast: «تم اعتماد الموقع — التالي»

### API

- Removed `saveChurchGoogleMapsUrl`, search helpers
- Added `verifyChurchLocation(churchId)` → RPC `platform_verify_church_location`

### Database (migration prepared)

```sql
UPDATE churches SET
  location_verified = true,
  verified_location_url = btrim(google_maps_url)
WHERE id = :church_id AND google_maps_url IS NOT NULL;
```

Files:
- `supabase/migrations/20250622200000_church_location_verify_rpc.sql`
- `supabase/RUN_CHURCH_LOCATION_VERIFY.sql`

## Warnings

- Churches without `google_maps_url` cannot be approved; card shows warning.
- Old RPC `platform_save_church_google_maps` remains in DB but is no longer called from the app.

## Errors

- None in build. Production build: **PASS**.

## Recommendations

1. Apply `supabase/RUN_CHURCH_LOCATION_VERIFY.sql` on project `usflbjlyadihyitnvzya`.
2. Confirm bulk `google_maps_url` data is populated for active churches.
3. Optionally deprecate/remove `platform_save_church_google_maps` if no longer needed.

## Overall Status

**PASS** — UI, client API, and remote migration applied on `usflbjlyadihyitnvzya`.

## Files Changed

| File | Change |
|------|--------|
| `ChurchLocationManagerScreen.tsx` | New verify flow, no dialog |
| `church-location-api.ts` | `verifyChurchLocation` RPC client |
| `20250622200000_church_location_verify_rpc.sql` | New column + RPC |
| `RUN_CHURCH_LOCATION_VERIFY.sql` | Manual run script |
