# Media Manager Action Buttons Fix

**Date:** 2026-06-29  
**Scope:** Approve, Reject, Set Primary, Delete in Media Manager side panel

---

## Executive Summary

Enabled all four media detail panel actions via security-definer RPCs, category-scoped primary for Hero/media without entity, Arabic button labels, and in-panel error messages.

---

## Findings

1. UI was wired but **UPDATE/DELETE blocked by RLS** on `media_library` for owner console.
2. **Set Primary** was disabled for Hero items without `entity_type` / `entity_id`.
3. Errors appeared behind the overlay at page top — hard to see.

---

## Warnings

- **Run once on Supabase:** `supabase/RUN_MEDIA_LIBRARY_OWNER_ACTIONS.sql`
- User must exist in `platform_owners` table (same as upload permission).

---

## Errors

- Fixed duplicate `error` binding in `setMediaPrimary` fallback (build).

---

## Recommendations

1. Apply `RUN_MEDIA_LIBRARY_OWNER_ACTIONS.sql` in SQL Editor.
2. Test: open pending Hero image → قبول / تعيين رئيسية / حذف.
3. Reject opens reason sheet → confirms status change.

---

## Overall Status

**PARTIAL** — code complete; requires Supabase SQL apply
