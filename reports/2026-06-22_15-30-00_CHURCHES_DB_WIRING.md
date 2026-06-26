# Churches Table DB Wiring Report

## Executive Summary

تم ربط شاشة الكنيسة، دليل الكنائس، الملف الشخصي، وبطاقة العضوية بجدول `public.churches` الفعلي في Supabase. اكتُشف أن الجدول على الخادم يستخدم مخططًا مختلفًا عن ملفات الهجرة المحلية (`church_name` بدل `name`، `parish` بدل `diocese`، `is_active` بدل `status='approved'`). أُضيف طبقة تكييف مركزية (`churches-table.ts`) وحدّثت جميع واجهات API ذات الصلة. **`npm run build` — PASS**.

## Findings

### مخطط الجدول الفعلي (Supabase)

| عمود DB | يُستخدم في التطبيق كـ |
|---------|------------------------|
| `church_name` | `name` (مع تنظيف `\n`) |
| `parish` | `diocese` / الإيبارشية |
| `governorate`, `city` | الموقع |
| `formatted_address` | `address` |
| `latitude`, `longitude` | إحداثيات الخريطة |
| `cover_image_url`, `hero_image` | صورة الغلاف |
| `members_count`, `servants_count` | عدد الأعضاء/خدام |
| `priests` | اسم الكاهن (من النص المستورد) |
| `is_active = true` | الكنائس المعروضة في الدليل (1241 صف) |

### منطق تحديد كنيسة العضو (موحّد)

1. عضوية نشطة في `church_memberships` (`status = active`) → `church_id`
2. التحقق أن الصف في `churches` نشط (`is_active = true`)
3. بدائل الإعداد (`church_setup_requests`) للمسؤولين فقط

### الملفات المربوطة

| المسار | المصدر |
|--------|--------|
| `/church` | `fetchChurchDashboard()` → `churches` + `church_roles` + `prayer_requests` |
| `/church/directory`, `/churches-directory` | `fetchApprovedChurches()` → `is_active = true` |
| `/church/directory/$placeId` | `fetchApprovedChurchById()` |
| الملف الشخصي | `useMemberChurch()` → `fetchMemberChurchRecord()` |
| بطاقة العضوية | `useMemberChurch()` للإيبارشية |
| Alpha Connect / التسجيلات | `resolvedMemberChurchName()` من الكاش |

### ملفات جديدة/محدّثة

- `src/features/church/churches-table.ts` — طبقة التكييف
- `src/features/church/member-church-api.ts` — كاش كنيسة العضو
- `src/features/church/use-member-church.ts` — Hook
- `src/features/church/churches-directory-api.ts` — دليل DB
- `src/features/church/church-dashboard-api.ts` — لوحة الكنيسة
- `src/features/church/church-membership-api.ts` — الانضمام
- `src/features/profile/ProfilePremiumScreen.tsx`
- `src/routes/profile.membership.tsx`
- `src/components/alpha/connect-shield-center.ts`
- `src/components/alpha/alpha-trust-shield-content.ts`
- `src/features/church/post-registrations.ts`

### بيانات العضويات الحالية

- 4 عضويات نشطة مرتبطة بكنائس (مثل `church_id` 1 و 2 في أسيوط)

## Warnings

- **`setup_request_id`** غير موجود في جدول `churches` على الخادم — مسار إعداد الكنيسة الجديدة يعتمد على `church_setup_requests` فقط محليًا.
- **`status` في `churches`** = `inactive` لجميع صفوف الدليل — التطبيق يستخدم `is_active` وليس `status='approved'`.
- **`church_roles`** يحتوي 4 صفوف فقط — أسماء الكهنة تُؤخذ primarily من عمود `priests`.
- بيانات تجريبية لا تزال hardcoded في: `ProfileTripTimelineSection`, `ProfileVisitsSection`, `AlphaShield`, `profile.messages`, `data/prayer-requests.ts` (محتوى UI تجريبي وليس كنيسة العضو).

## Errors

- لا أخطاء build بعد التكييف.
- قبل التكييف: استعلامات `.eq("status", "approved")` و `.select("name")` كانت تفشل صامتًا (0 صفوف) لأن الأعمدة/القيم غير موجودة على الخادم.

## Recommendations

1. توحيد مخطط الهجرة المحلي مع مخطط الإنتاج أو إنشاء VIEW `churches_app` يعرض الأعمدة المتوقعة.
2. ربط `ProfileTripTimelineSection` و `ProfileVisitsSection` بجداول رحلات/زيارات عند توفرها.
3. إضافة فهرس على `churches(is_active, church_name)` لتحسين الدليل.
4. Consider `membership_status = 'approved'` في فلتر العضوية إذا أصبح مطلوبًا للأمان.

## Overall Status

**PASS** — الدليل يعرض 1241 كنيسة من DB؛ شاشة الكنيسة والملف الشخصي يستخدمان نفس منطق الحل (`resolveActiveChurchId` + `churches-table`).
