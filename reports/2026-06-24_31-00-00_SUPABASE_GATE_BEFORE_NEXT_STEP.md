# Supabase Gate — إغلاق الثغرات قبل أي خطوة جديدة

**Date:** 2026-06-24  
**Rule:** لا خطوة client جديدة (aggregator، audio، likes…) قبل **PASS** على Supabase.

---

## Executive Summary

قبل الانتقال لأي خطوة تالية في منظومة الناشر الموحّد، يجب تطبيق سلسلة migrations بالكامل والتحقق من الجداول والـ RPCs. الكود في المشروع يفترض أن Supabase محدّث؛ بدون ذلك تظهر أخطاء select/RPC وتبقى الميزات «شكل فقط».

---

## Findings

### ترتيب التطبيق الإلزامي (Supabase SQL Editor)

| # | ملف | ماذا يضيف |
|---|-----|-----------|
| 1 | `20250624200000_alpha_107_page_status_claim.sql` | `page_status`, claim tables, `monasteries`, church claim RPCs |
| 2 | `20250624210000_alpha_110_publishers_content.sql` | `publishers`, `publisher_content_items`, publisher RPCs, RLS |
| 3 | `20250624220000_unified_publisher_content.sql` | `visibility`, `allow_download`, `likes_count`, `duration`, `media_url`, `pdf` |
| 4 | `20250624230000_unified_publisher_supabase_gate.sql` | `ensure_church_publisher` grant + RLS visibility |

**لا تخطّ خطوة.** الخطوة 3 تعتمد على جداول الخطوة 2. الخطوة 4 تعتمد على عمود `visibility`.

---

### استعلامات تحقق (بعد التطبيق)

```sql
-- جداول أساسية
select to_regclass('public.publishers');
select to_regclass('public.publisher_content_items');
select to_regclass('public.church_claim_requests');

-- أعمدة unified content
select column_name from information_schema.columns
where table_name = 'publisher_content_items'
  and column_name in ('visibility','allow_download','likes_count','duration_seconds','media_url');

-- RPCs
select proname from pg_proc
where proname in (
  'submit_publisher_application',
  'submit_publisher_content',
  'ensure_church_publisher',
  'submit_church_claim'
);
```

**PASS** = كل الاستعلامات ترجع صفوفاً (ليست NULL للجداول).

---

### ما يعمل في الكود اليوم (يعتمد على Supabase)

| ميزة | جداول / RPC |
|------|-------------|
| صفحة ناشر عامة `/publisher/$id` | `publishers` + `publisher_content_items` |
| رابط كنيسة → ناشر | `publishers.church_id` + `ensure_church_publisher` |
| workspace / apply | `submit_publisher_*` RPCs |
| claim كنيسة | `church_claim_requests` + `page_status` |
| Content Review | `publisher_content_items` + `platform_approvals` |

---

### ثغرات مقصودة للمراحل القادمة (ليست blockers للـ gate)

| عنصر | الحالة | متى |
|------|--------|-----|
| `publisher_content_likes` | غير منشأ | خطوة Likes |
| Aggregator API | غير منشأ | بعد PASS gate |
| ربط `/audio` | mock | بعد PASS + aggregator |
| Storage bucket صوت/PDF | غير منشأ | لاحقاً |
| دمج `church_posts` | منفصل | لاحقاً |
| seed 69 دير | غير منشأ | ALPHA-107 monasteries |

---

## Warnings

1. **تطبيق migration 220 فقط** بدون 210 → فشل `ALTER TABLE publisher_content_items`.
2. **تطبيق 210 بدون 200** → claim / `page_status` لا يعمل على detail page.
3. **RLS القديم** كان يعرض كل `approved` بدون `visibility` — **210+220+230** يصلح ذلك في gate migration.
4. Geocoding (إحداثيات الكنائس) مسار منفصل — لا يمنع publisher gate لكن يؤثر على الخريطة.

---

## Errors

None in repo files. **Runtime errors expected** if migrations not applied (missing columns/tables).

---

## Recommendations

1. طبّق الـ 4 ملفات بالترتيب في Supabase SQL Editor.
2. شغّل استعلامات التحقق أعلاه — سجّل النتيجة PASS/FAIL.
3. اختبار يدوي واحد: `submit_publisher_application` أو قراءة `publishers` من Table Editor.
4. **بعد PASS فقط** — وافق على الخطوة 2 (Aggregator API) أو 4 (`/audio`).

---

## Overall Status

**BLOCKED** على Supabase حتى تطبيق migrations + تحقق PASS.

---

## COPYABLE CHECKLIST

```
SUPABASE GATE — قبل أي خطوة جديدة
[ ] 20250624200000_alpha_107_page_status_claim.sql
[ ] 20250624210000_alpha_110_publishers_content.sql
[ ] 20250624220000_unified_publisher_content.sql
[ ] 20250624230000_unified_publisher_supabase_gate.sql
[ ] تحقق: publishers + publisher_content_items موجودة
[ ] تحقق: visibility column موجود
[ ] تحقق: RPCs موجودة
→ ثم فقط: خطوة 2 أو 4
```
