# ALPHA-100 Upload Error Diagnosis & Fix

**Date:** 2026-06-18  
**Issue:** "حدث خطأ أثناء الرفع" on saint image submit  
**Build:** PASS (after code fix)

---

## Executive Summary

Upload failed because **Supabase remote project does not have ALPHA-100 schema yet**: table `saint_gallery_images` missing and storage bucket `saint-gallery` not found. Code now surfaces a clear Arabic error and includes a one-click SQL runner file.

---

## Findings

### Root cause (verified against live Supabase)
| Check | Result |
|-------|--------|
| `saint_gallery_images` table | **Missing** — `Could not find the table in the schema cache` |
| `saint-gallery` bucket upload | **Fails** — `Bucket not found` |

### Why UI showed generic error
`SaintGalleryUploadSheet` caught thrown storage exception with generic message `"حدث خطأ أثناء الرفع"` without reading Supabase error text.

### Code fixes applied
1. `mapSaintGalleryError()` — maps bucket/table/auth/mime errors to Arabic
2. `checkSaintGalleryBackendReady()` — preflight on upload sheet open
3. Upload button disabled when backend not ready
4. MIME detection fallback from filename (screenshots with empty `file.type`)
5. `supabase/RUN_SAINT_COMMUNITY_GALLERY.sql` — run in SQL Editor (+ `notify pgrst`)

---

## Warnings

- **Migration must be applied manually** — `supabase db push` failed (403, no DB password in env).
- After running SQL, wait ~10s or reload schema if REST still caches old state.

---

## Errors

- Remote: table + bucket absent (infrastructure, not app logic bug after migration).

---

## Recommendations

1. Open Supabase Dashboard → SQL Editor
2. Paste and run **`supabase/RUN_SAINT_COMMUNITY_GALLERY.sql`**
3. Retry upload from saint page
4. Optional: store `SUPABASE_DB_PASSWORD` locally and run `npx supabase db push`

---

## Overall Status

**FAIL (remote infra)** → **PASS after SQL run**

---

## User action required

```
Supabase → SQL Editor → Run: supabase/RUN_SAINT_COMMUNITY_GALLERY.sql
Then refresh app and upload again.
```
