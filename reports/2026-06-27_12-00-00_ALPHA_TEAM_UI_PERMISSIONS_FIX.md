# Alpha Team UI & Permissions Fix

**Date:** 2026-06-27  
**Scope:** فريق Alpha screen polish + permissions reliability

---

## Executive Summary

تم تحديث شاشة **فريق Alpha** لتطابق DNA باقي أقسام Alpha Control (بطاقات زجاجية، خطوط أكبر، عربي واضح). تم أيضاً إصلاح مسار الصلاحيات: دخول المساعدين بدون PIN، حفظ كامل للصلاحيات، وتحديث فوري بعد الحفظ.

**Overall Status: PASS** (build verified)

---

## Findings

### UI Improvements
- **`AlphaTeamUI.tsx`** (new): `TeamGlassStats`, `TeamHeaderPanel`, `TeamMemberCard` — نفس أسلوب Media Manager / Module Control.
- **`AlphaTeamScreen.tsx`**: خطوط 13–17px، فلاتر عربية، `PrivacyStrip`، إحصائيات (إجمالي / نشط / معطّل / بانتظار).
- **`AlphaTeamPermissionsScreen.tsx`**: `ModuleControlRow` بخط كبير، عدّاد صلاحيات، رسالة نجاح بعد الحفظ.
- **`AlphaTeamMemberScreen.tsx`** + **`AlphaTeamInviteSheet.tsx`**: typography موحّد وعربي.
- **`permissions.ts`**: تسميات عربية لكل مجموعة صلاحية.

### Permissions Fixes
- **`PlatformAccessGate.tsx`**: المساعد النشط يدخل Alpha Control تلقائياً إذا `admin_fetch_my_permissions` يُرجع صلاحيات (بدون إجبار PIN المالك).
- **`admin-team-api.ts`**: parsing آمن لـ jsonb؛ حفظ **كل** مفاتيح `ADMIN_PERMISSION_KEYS` صراحةً.
- **`AlphaTeamPermissionsScreen`**: `notifyAdminPermissionsChanged()` بعد الحفظ لتطبيق الصلاحيات فوراً.
- **`routeRequiresPermission`**: مسار `/platform/team/.../permissions` يتطلب `team.permissions` وليس `team.view` فقط.

---

## Warnings

- يجب تشغيل **`supabase/RUN_ADMIN_TEAM_MANAGEMENT.sql`** على Supabase إذا لم يُطبَّق بعد — بدونه RPCs والجداول غير موجودة.
- المالك يبقى في `platform_owners` فقط (مخفي من قائمة الفريق).
- دعوة البريد يدوية (نسخ الرابط) حتى إعداد SMTP.

---

## Errors

- None in build (`npm run build` — PASS).

---

## Recommendations

1. بعد دعوة مساعد: يفتح رابط `/invite/accept?token=...` ويسجّل بنفس البريد.
2. من **صلاحيات العضو**: فعّل فقط ما يحتاجه (مثلاً `content.edit` لـ Media Manager).
3. المساعد يعيد تحميل `/platform` أو ينتظر ثوانٍ بعد الحفظ لرؤية الموديولات المحدّثة.

---

## Overall Status

**PASS** — UI aligned with Alpha Control; permissions pipeline fixed client-side.
