# Publisher Approval Sync Fix

**Date:** 2026-06-24  
**Scope:** Publisher page disappears after Alpha Control approval

## Executive Summary

After approving a publisher in Alpha Control, the approval row was marked `approved` (so it left the pending queue) but the **publisher row often never updated** because client-side `UPDATE` on `publishers` could fail silently under RLS. Fixed with a security-definer RPC, sync-before-patch ordering, UI clarity for published pages, and a repair path for already-broken records.

## Findings

1. **Silent sync failure (root cause)**
   - `syncPublisherSetupApproval` / `syncPublisherPublicationApproval` used browser `supabase.from('publishers').update(...)`.
   - Under Postgres RLS, UPDATE can return 0 rows with no error if SELECT/UPDATE policies do not allow the row.
   - Result: approval marked approved in `platform_approvals`, request disappears from pending, but publisher stays `under_review` or `pending_publication`.

2. **Wrong sync order**
   - `applyPatch` updated the approval row **before** syncing the publisher, leaving inconsistent state when sync failed.

3. **Two-step lifecycle (expected, but unclear in UI)**
   - `publisher_setup` approved → status `draft` (identity OK, not public yet)
   - `publisher_publication` approved → status `published` + `is_public=true`
   - Users who only approve setup expect a public page immediately.

4. **Missing published UX**
   - Workspace showed no banner/link after publish (`PublisherDraftBanner` returned null for `published`).

## Fixes Applied

| Area | Change |
|------|--------|
| **Migration** | `20250625003000_publisher_approval_sync_rpc.sql` — RPC `apply_publisher_approval_sync(approval_id, status)` |
| **Remote DB** | Migration applied to Supabase project `usflbjlyadihyitnvzya` |
| **platform-api.ts** | Publisher sync now calls RPC; resolves `publisherId` / `publisher_id` / `identity_approval_id`; returns boolean |
| **approvals-store.ts** | Sync publisher **before** patching approval; abort if sync fails |
| **ApprovalsCenter** | New **Publishers** filter tab |
| **PublisherCenter** | Banner for pages `pending_publication` with link to approvals |
| **Workspace / hub** | Published banner text + link to public page |
| **ApprovalDetails** | Error message when approve sync fails |

### RPC behavior

- **publisher_setup + approved** → `draft` + refresh readiness
- **publisher_publication + approved** → `published`, `is_public=true`, auto-approve pending content, refresh counts
- **rejected / needs_changes** → revert to `draft` or `suspended` per kind

## Verification

- Migration `publisher_approval_sync_rpc` applied successfully (Supabase MCP).
- Local code lints clean on touched files.
- Repair migration `20250625003100_publisher_approval_sync_repair.sql` added locally to re-sync already-approved rows (run manually if needed).

## Warnings

1. **Already broken records** from before this fix may still show wrong status until repair SQL is run or you re-open and re-approve from Alpha Control.
2. **Audio discovery cards** still require `is_trusted=true` — mark trusted in Publisher Center after publish if needed.
3. **Two approvals required** for a public page: identity (`publisher_setup`) then final publish (`publisher_publication` after 100% readiness).

## Errors

- Automated bulk repair on remote DB was not applied in this session (requires explicit approval). Local repair migration file is available.

## Recommendations

1. Run repair once in Supabase SQL editor if pages were approved before this fix:
   ```sql
   select public.apply_publisher_approval_sync(id, 'approved')
   from platform_approvals
   where kind in ('publisher_setup','publisher_publication') and status = 'approved';
   ```
2. Test flow: Apply → approve setup → workspace draft → 100% readiness → send for publication → approve publication → `/publisher/$id` loads.
3. Use Approvals Center → **Publishers** tab for publisher requests.

## Overall Status

**PASS** (with manual repair optional for historical rows)
