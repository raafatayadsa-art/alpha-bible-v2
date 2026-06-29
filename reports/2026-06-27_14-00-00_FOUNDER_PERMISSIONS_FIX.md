# Founder Recognition & Admin Permissions Fix

**Date:** 2026-06-27

---

## Executive Summary

إصلاح التعرف على **alpha.coptic@proton.me** كمؤسس، وتمكين تعديل صلاحيات Admin و Super Admin للمؤسس.

**Overall Status: PARTIAL** — يتطلب تشغيل SQL على Supabase

---

## Findings

### Root causes
1. **المؤسس:** التحقق كان عبر SELECT مباشر على `platform_owners` — قد يفشل مع RLS. الحل: RPC `is_platform_owner`.
2. **الصلاحيات:** حفظ الصلاحيات كان يستخدم `jsonb_each_text` — مشاكل مع boolean. الحل: `jsonb_object_keys` + `->>`.
3. **Super Admin:** فقط المؤسس (صف في `platform_owners`) يعدّل صلاحيات مسؤول أعلى.

### Client fixes
- `alpha-roles.ts` — RPC `is_platform_owner` أولاً
- `useAdminPermissions` — fallback RPC للمؤسس
- `AdminPermissionGate` — المؤسس يرى كل الأزرار فوراً
- `FounderControlHeader` — شارة **المؤسس · Alpha Control**
- `profile-role.ts` — دور owner = **المؤسس**
- `AlphaTeamPermissionsScreen` — المؤسس يعدّل الجميع

### SQL to run
**`supabase/RUN_FOUNDER_OWNER_PERMISSIONS_FIX.sql`**

---

## Warnings

- يجب تسجيل الدخول بـ `alpha.coptic@proton.me` قبل تشغيل SQL.
- شغّل `RUN_ADMIN_TEAM_MANAGEMENT.sql` أولاً إن لم يُطبَّق.

---

## Errors

- None in build.

---

## Recommendations

1. شغّل SQL → Verify: `is_owner = true`
2. أعد تحميل التطبيق → شارة المؤسس في Alpha Control
3. فريق Alpha → عضو → **صلاحيات** → عدّل واحفظ

---

## Overall Status

**PARTIAL** — code ready; run SQL on Supabase
