# Church Directory Join + Alpha Connect + Setup Approval Flow

## Executive Summary

Implemented church directory join buttons, Alpha Connect contact/messaging on church cards, deferred church provisioning until Alpha Control approval, and a dedicated document-request action for `church_setup` approvals. Production build **PASS**.

## Findings

### 1. الانضمام من دليل الكنائس
- **`JoinChurchButton`** added to `ChurchDirectoryListView` (compact, `stopPropagation` so row tap still works).
- **`JoinChurchButton`** added to `ChurchDirectoryFloatingCard` (full-width row above actions).
- Existing join on detail tabs (`ChurchDirectoryInfoTabs`) unchanged.
- Join uses `joinChurch()` → `church_memberships` (active membership on approved churches).

### 2. Alpha Connect على كارت الكنيسة
- New **`ChurchDirectoryConnectActions.tsx`**:
  - **اتصال**: popup lists priest, servants, and church phone/WhatsApp → opens Alpha Connect calls tab.
  - **رسائل**: popup lists priest + servants → opens Alpha Connect chat (respects `messagingAllowed`).
- Wired in **`ChurchDirectoryFullDetailView`** (replaces raw `tel:` / `wa.me` links).
- Wired in **`ChurchDirectoryFloatingCard`** map popup.
- Uses `fetchChurchContactsByChurchId` from `church-dashboard-api.ts`.

### 3. تأجيل إنشاء الكنيسة حتى الموافقة
- **`attachProvisionResult`** in `church-setup-api.ts` is a no-op (no auto-provision on submit).
- **`church-hub-store.ts`** always returns `churchCreated: false` and `status: "pending"` after submit.
- **`ChurchSetupForm`** success screen shows "تم إرسال طلب تأسيس الكنيسة للمراجعة" when not provisioned.
- Provisioning runs on Alpha Control **approve** via `platform-api.ts` → `provisionChurchFromSetupRequest`.

### 4. Alpha Control — طلب مستندات
- **`RefDetailsFooter`**: optional third action **"طلب مستندات"** for `church_setup`.
- **`ApprovalDetailsScreen`**: modal sends `requestInfo` with `[مستندات مطلوبة]` prefix → status `needs_info`.
- Existing **"طلب معلومات"** retained for general data requests.

### 5. Build
- `npm run build` — **exit 0** (PASS).

## Warnings

- **SQL not applied in this session**: run updated scripts on Supabase if not already deployed:
  - `supabase/RUN_CHURCH_SETUP_SUBMIT.sql`
  - `supabase/RUN_CHURCH_SETUP_PROVISION.sql`
- **`join_requests` table** exists in schema but is unused; join flow uses `church_memberships` directly (matches current app code).
- **Platform admin page control** after church creation relies on existing RLS/roles — no new RLS migration in this change set.
- **`backfillApprovedChurchSetupRequests`** still provisions only **approved** setup rows (safe for deferred flow).

## Errors

- None in build or lint for touched files.

## Recommendations

1. Apply/run SQL provision scripts on Supabase production.
2. Test end-to-end: submit setup → approval queue → request documents → resubmit → approve → priest opens `/church`.
3. Verify `church_roles` rows exist for test churches so Connect popups show priest/servant numbers.
4. Consider future migration to `join_requests` if priest approval for membership is required.

## Overall Status

**PASS** (frontend complete; database scripts require manual run on Supabase)
