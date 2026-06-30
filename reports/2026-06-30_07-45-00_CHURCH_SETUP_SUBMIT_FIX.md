# Church Setup Submit Fix

## Executive Summary

Church setup submission failed with a generic connection error because direct client inserts to `church_setup_requests` / `platform_approvals` likely fail on the live Supabase project (missing table, RLS drift, or schema mismatch). A **security definer RPC** was added plus improved client error handling. **Build: PASS.**

## Findings

### Root cause (likely)
- Client used direct `.insert()` on `church_setup_requests`.
- On production, table/policies may not exist or may block the insert+select pattern.
- Generic Arabic error hid the real failure.

### Fixes applied
1. **`submit_church_setup_request` RPC** — atomic setup row + platform approval (migration + RUN script).
2. **`update_church_setup_request` RPC** — resubmit path.
3. **`church-setup-api.ts`** — RPC first, direct insert fallback, mapped error messages.
4. **`church-hub-store.ts` / `ChurchSetupForm.tsx`** — show specific error text from API.
5. **`hasChurchLocation`** — reject NaN coordinates before submit.

## Warnings

- **RPC must be deployed on Supabase** for reliable production submit. Until then, fallback direct insert may still fail with a clearer message pointing to `RUN_CHURCH_SETUP_SUBMIT.sql`.

## Errors

- User-reported: «تعذر إرسال الطلب. تحقق من الاتصال وحاول مرة أخرى.»

## Recommendations

1. Open Supabase Dashboard → SQL Editor.
2. Paste and run entire file: `supabase/RUN_CHURCH_SETUP_SUBMIT.sql`
3. Retry church setup submit while logged in.
4. If still failing, check browser console for `[church_setup]` logs.

## Overall Status

**PARTIAL** — code fixed and build PASS; **requires SQL run on Supabase** to complete.
