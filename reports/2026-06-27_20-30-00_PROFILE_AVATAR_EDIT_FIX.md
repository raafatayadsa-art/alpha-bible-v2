# Profile Avatar Edit Fix

**Date:** 2026-06-27  
**Scope:** Profile picture editing conflict with full-app user sync v2  
**Build:** PASS  
**Overall Status:** PASS

---

## Executive Summary

Fixed profile picture editing breaking after full-app sync v2. Root cause: cloud sync pull overwrote the in-progress edit draft and could push oversized `data:` URLs. Four targeted fixes protect the crop/save flow without changing UI or navigation.

---

## Findings

1. **`ProfileEditScreen`** — `useEffect` reset `draft` from `saved` on every sync event and cleared `dirty`, wiping a cropped photo before Save.
2. **`profile-user-store`** — `syncLocalProfileAvatarFromCloud` replaced local `data:` URLs with cloud URL during edit.
3. **`user-progress-sync`** — `collectExtras` could upload multi-MB base64 avatars in `users_progress.payload`.
4. **`applyExtrasToLocal` / `mergeExtras`** — remote profile extras could overwrite local state during pull while user was on edit screen.

---

## Fixes Applied

| File | Change |
|------|--------|
| `ProfileEditScreen.tsx` | Sync `draft` from `saved` only when `!dirty`; flush sync after successful save |
| `profile-user-store.ts` | Skip cloud avatar overwrite when local has pending `data:` crop; defer sync schedule until crop saved |
| `user-progress-sync.ts` | Strip `data:` URLs from profile extras on collect/apply; preserve pending crop on merge and apply |

---

## Warnings

- Avatar still uploads only on **Save** — crop preview lives in React state until then (by design).
- First-time upload still requires network + storage RLS; upload errors show via existing `mapProfileAvatarUploadError`.

---

## Errors

None during build verification.

---

## Recommendations

1. Test flow: Profile → Edit → pick photo → crop → confirm preview → Save → verify on second device after sync.
2. If upload fails, check `publisher-assets` bucket policies for authenticated user path `{userId}/profile/avatar/*`.

---

## User Test Steps

1. Open **تحرير الملف الشخصي**.
2. Change photo → crop → confirm thumbnail updates.
3. Tap **حفظ** — wait for success flash.
4. Re-open profile on another device/browser (same account) — avatar should match.

---

## Overall Status

**PASS** — build OK; edit draft protected from sync overwrite.
