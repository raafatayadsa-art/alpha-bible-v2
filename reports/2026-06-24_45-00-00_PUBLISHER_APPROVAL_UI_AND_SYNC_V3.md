# Publisher Approval UI + Sync V3

**Date:** 2026-06-24  
**Scope:** Publisher approval sync (DB), Alpha Control back navigation, publisher public page action buttons, audio feed visibility

---

## Executive Summary

Applied the missing database migration (`publisher_approval_trigger_and_repair`) to Supabase, unified publisher page social actions to match home verse-card chrome, and fixed Alpha Control back navigation to use TanStack Router history index instead of `window.history.length`. Remote audit shows the test publisher was never marked **approved** in `platform_approvals` — only the publisher row was partially updated — so the page cannot appear in `/audio` until the full two-step approval flow completes.

---

## Findings

### 1. Database sync (applied)

- Migration `publisher_approval_trigger_and_repair` is now live on project `usflbjlyadihyitnvzya`.
- RPC `apply_publisher_approval_sync` updated to set `is_trusted = true` on publication approval.
- Trigger `platform_approval_publisher_sync_trg` runs after `platform_approvals.status` updates.
- Repair loop executed for rows already marked `approved`.

### 2. Publisher audit (test row)

| Field | Value |
|-------|-------|
| Publisher | `3799715f-8856-42bf-b72c-1fafa895a7ec` — فغعونعغف |
| Type | `choir` (eligible for audio feed) |
| Status | `draft` (was `under_review`) |
| `is_public` | `false` |
| Setup approval | `f08cf4ec…` — **still `pending`** in DB |
| Publication approval | **none created** |
| Readiness | **80/100** (bio shorter than 40 chars) |
| Approved content | 4 items |

**Why `/audio` is empty:** feed requires `status = published` AND `is_public = true`. That only happens after **`publisher_publication`** is approved, not after setup alone.

### 3. UI changes (code)

| File | Change |
|------|--------|
| `PublisherPublicPageView.tsx` | Single row of `AlphaHeroToggleButton` / `AlphaHeroShareButton` (follow, like, share, barcode) matching home verse card; removed duplicate text grid |
| `mission-control-ui.tsx` | `usePlatformBack` uses router history `idx > 0` (same pattern as main app navigation) |
| `ApprovalDetailsScreen.tsx` | Back button uses `usePlatformBack` with fallback `/platform/approvals` |
| `publisher-discovery-api.ts` | Audio feed no longer filters `trustedOnly` (from prior round) |

### 4. Approval workflow (product)

1. **publisher_setup** approved → publisher `draft`
2. Owner completes readiness to **100** (bio ≥ 40 chars, cover, logo, contact, content)
3. Owner taps **إرسال الصفحة للنشر** → creates **publisher_publication** approval
4. **publisher_publication** approved → `published`, `is_public = true`, `is_trusted = true` → appears in `/audio`

---

## Warnings

- Clicking **اعتماد** before the RPC migration existed could fail silently and leave `platform_approvals` at `pending` even if partial client updates occurred.
- Test publisher bio is only ~9 characters; readiness stays at 80 until bio ≥ 40 characters.
- Hard refresh (Ctrl+Shift+R) required after pulling UI changes; dev server may run on port **8081** if 8080 is busy.

---

## Errors

- None blocking deployment of this round.
- Historical: setup approval row `f08cf4ec…` never reached `approved` in DB (root cause of “nothing changed”).

---

## Recommendations

1. In Alpha Control → Approvals, open **طلب ناشر — فغعونعغف** and tap **اعتماد** again (RPC + trigger now active).
2. In publisher workspace, extend bio to ≥ 40 characters, then **إرسال الصفحة للنشر**.
3. Approve the new **نشر صفحة** request → publisher appears in `/audio` and public URL works.
4. Verify owner PIN session is active before approving (approvals store requires `ab:owner-session`).

---

## Overall Status

**PARTIAL** — UI + DB infrastructure fixed; user must re-run setup approval and complete publication step for the test publisher.

---

## Changed files (this round)

- `src/features/publisher/components/PublisherPublicPageView.tsx`
- `src/features/platform-admin/mission-control-ui.tsx`
- `src/features/platform-admin/ApprovalDetailsScreen.tsx`
- `supabase/migrations/20250625003200_publisher_approval_trigger_and_repair.sql` (applied remote)
