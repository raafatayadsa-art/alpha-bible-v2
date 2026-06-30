# Church Setup End-to-End Provision Fix

**Date:** 2026-06-27  
**Scope:** طلب تأسيس الكنيسة — إكمال الإرسال وإنشاء الكنيسة

---

## Executive Summary

طلب تأسيس الكنيسة كان يتوقف بعد الإرسال لأن **إنشاء الكنيسة (provisioning)** كان يستخدم أعمدة مخطط قديم (`name`, `location_lat`, `member_count`) بينما قاعدة البيانات الفعلية تستخدم (`church_name`, `latitude`, `members_count`, `id` bigint). تم إصلاح التزويد على العميل، وإضافة RPC آمن `provision_church_from_setup_request`، وربطه تلقائياً بعد نجاح الإرسال.

---

## Findings

1. **Schema mismatch (root cause):** `provisionChurchFromSetupRequest` كان يُدرج في `churches` بأعمدة غير موجودة على الإنتاج → فشل صامت عند الاعتماد أو التزويد.
2. **لا إنشاء تلقائي بعد الإرسال:** النجاح كان يعرض «قيد المراجعة» فقط دون إنشاء كنيسة أو عضوية.
3. **عمود `setup_request_id`:** غير موجود في `database.generated.ts` على الإنتاج — أُضيف fallback عبر `description` + SQL migration.
4. **RLS:** إدراج الكنيسة من العميل قد يفشل بدون RPC `security definer`.

---

## Warnings

- يجب تشغيل **كلا** الملفين على Supabase SQL Editor إن لم يُشغَّلا:
  - `supabase/RUN_CHURCH_SETUP_SUBMIT.sql`
  - `supabase/RUN_CHURCH_SETUP_PROVISION.sql` (**جديد**)
- بدون RPC التزويد، يعمل fallback على العميل بمخطط صحيح لكن قد يُحجب بـ RLS.
- المستخدم **غير المسجّل** لن يحصل على عضوية حتى يسجّل الدخول (سلوك متوقع).

---

## Errors

- لا أخطاء build بعد الإصلاح (`npm run build` — PASS).

---

## Recommendations

1. تشغيل `RUN_CHURCH_SETUP_PROVISION.sql` على المشروع `usflbjlyadihyitnvzya`.
2. اختبار مسار كامل: تسجيل دخول → إعداد الكنيسة → إرسال → «تم إنشاء الكنيسة» → `/church`.
3. مراجعة سياسة الاعتماد: التزويد التلقائي يعتمد الطلب فوراً — إن رُغب بمراجعة يدوية، أزل استدعاء `finalizeChurchSetupAfterSubmit` من `church-setup-api.ts`.

---

## Changes Made

| File | Change |
|------|--------|
| `src/features/church/church-provisioning.ts` | مخطط إنتاج صحيح + fallback `description` |
| `src/features/church/church-dashboard-api.ts` | بحث كنيسة مرتبطة بالطلب |
| `src/features/church-management/church-setup-api.ts` | `finalizeChurchSetupAfterSubmit` + RPC |
| `src/features/church-management/church-hub-store.ts` | حالة `approved` عند نجاح التزويد |
| `src/features/church-management/ChurchSetupForm.tsx` | شاشة نجاح مختلفة عند إنشاء الكنيسة |
| `supabase/migrations/20260630130000_church_setup_provision_rpc.sql` | RPC + عمود |
| `supabase/RUN_CHURCH_SETUP_PROVISION.sql` | نسخة تشغيل يدوي |

---

## Overall Status

**PARTIAL** — الكود جاهز والـ build ينجح؛ يتطلب تشغيل SQL على Supabase للاكتمال الكامل في الإنتاج.
