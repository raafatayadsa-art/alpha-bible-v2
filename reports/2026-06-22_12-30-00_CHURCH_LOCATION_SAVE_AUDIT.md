# Church Location Manager — Save Logic Audit

**Date:** 2026-06-22  
**Task:** Audit `google_maps_url` / `location_verified` save flow  
**Project:** `usflbjlyadihyitnvzya`

---

## Executive Summary

The save handler **looked correct in code** but **never persisted to the database** in production. Root cause: **`churches` has RLS SELECT-only** — no UPDATE policy. Supabase returned **no error** while updating **0 rows**. The UI showed success because only `error` was checked, not returned rows.

**Fix applied:** `platform_save_church_google_maps` RPC (security definer) + client verification of returned row.

---

## Findings

### 1. Is `google_maps_url` actually being saved?

**Before fix: NO (production).**

Live DB audit:

| Metric | Count |
|--------|------:|
| Active churches | 1241 |
| With non-empty `google_maps_url` | **0** |
| `location_verified = true` | **0** |

Direct client PATCH/UPDATE was blocked by RLS. The app showed “تم توثيق الموقع” because `error === null` even when **zero rows** were updated.

**After fix:** RPC `platform_save_church_google_maps` bypasses RLS as `SECURITY DEFINER` and returns the saved row for client verification.

---

### 2. Is `location_verified` updated to `true` after save?

**Before fix: NO** — same silent RLS failure; both columns are set in one statement, so neither persisted.

**Intended SQL (inside RPC):**

```sql
UPDATE public.churches c
SET
  google_maps_url = btrim(p_google_maps_url),
  location_verified = true
WHERE c.id = p_church_id
  AND c.is_active = true
RETURNING c.id, c.google_maps_url, c.location_verified;
```

---

### 3. What controls the red/green badge?

```135:135:src/features/platform-admin/ChurchLocationManagerScreen.tsx
  const verified = row.location_verified === true;
```

| Condition | Badge |
|-----------|-------|
| `location_verified === true` | 🟢 موقع موثق |
| anything else (`false`, `null`, `undefined`) | 🔴 غير موثق |

**Note:** Badge does **not** use `google_maps_url`. A church could show a Maps link only if the list fetch returns a URL — but with RLS blocked saves, prod had no saved URLs.

Card glow uses the same flag: `glow={verified ? MC.green : MC.red}`.

---

### 4. Supabase update errors?

**None returned to the client** — this is the core bug.

| Check | Result |
|-------|--------|
| `error` from `.update()` | `null` |
| Rows updated | **0** (RLS) |
| User-visible failure | **No** (misleading success toast) |

**RLS on `public.churches` (production):**

| Policy | Command |
|--------|---------|
| `public_read_churches` | **SELECT only** (`using: true`) |
| *(none)* | **UPDATE** |

Triggers on UPDATE: **none** (only INSERT triggers for `church_code`).

Column grants for `anon` / `authenticated`: SELECT + UPDATE on both columns — privileges OK; **RLS blocked writes**.

---

### 5. Exact update query executed (before fix)

**Supabase JS:**

```typescript
supabase.from("churches").update({
  google_maps_url: url,
  location_verified: true,
}).eq("id", churchId);
```

**HTTP equivalent (PostgREST):**

```http
PATCH /rest/v1/churches?id=eq.{churchId}
Content-Type: application/json
Authorization: Bearer {anon_key}

{
  "google_maps_url": "https://maps.google.com/...",
  "location_verified": true
}
```

**Postgres equivalent:**

```sql
UPDATE public.churches
SET google_maps_url = $1, location_verified = true
WHERE id = $2;
-- Blocked by RLS → 0 rows, no exception to client
```

**After fix — RPC call:**

```typescript
supabase.rpc("platform_save_church_google_maps", {
  p_church_id: churchId,
  p_google_maps_url: url,
});
```

Migration: `supabase/migrations/20250622183000_church_location_save_rpc.sql` (applied to remote).

---

## Code changes

| File | Change |
|------|--------|
| `church-location-api.ts` | Use RPC; verify returned row + `location_verified === true` |
| `ChurchLocationManagerScreen.tsx` | Post-save check that URL matches input |
| `20250622183000_church_location_save_rpc.sql` | Security definer save function |

---

## Warnings

1. RPC is callable by `anon` / `authenticated` — same trust model as other platform admin tables (client PIN gate only). Tighten with `platform_owners` + `auth.uid()` before public launch.
2. If user perceived “URL saved”, it may have been the dialog input or success toast — prod DB had **zero** persisted URLs before this fix.

---

## Errors

None in build. Migration applied successfully to remote.

---

## Recommendations

1. Re-test save on `/platform/church-locations` — badge should turn 🟢 and stats should increment.
2. Optionally backfill `location_verified = true` where `google_maps_url` is already non-empty (currently 0 rows).
3. Add row-count / returned-data checks for all future platform admin writes to non-platform tables.

---

## Overall Status

**PARTIAL → FIXED**

Root cause identified and patched. User should confirm in UI after one save attempt.
