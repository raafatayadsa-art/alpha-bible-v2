# Supabase Schema Fix — Applied Successfully

**Date:** 2026-06-24  
**Project:** `usflbjlyadihyitnvzya` (raafatayadsa-art's Project)

---

## Executive Summary

تم تطبيق إصلاح تعارض الـ schema القديم على Supabase بنجاح. الجداول والـ RPCs والـ RLS المطلوبة لمنظومة ALPHA-107 + الناشر الموحّد أصبحت جاهزة. **Overall Status: PASS**

---

## Findings

### Migrations applied (remote)

| Migration | Purpose |
|-----------|---------|
| `legacy_schema_bridge` | حذف `publishers` القديم + ترقية أعمدة `monasteries` |
| `alpha_107_page_status_claim` | `page_status`, claim tables, RPCs, `church_directory` view |
| `alpha_110_publishers_content_tables` | enums, `publishers`, `publisher_content_items`, readiness |
| `alpha_110_publishers_content_rpcs_rls` | publisher RPCs + RLS + grants |
| `unified_publisher_content` | `visibility`, `media_url`, extended `submit_publisher_content` |
| `unified_publisher_supabase_gate` | `ensure_church_publisher` grant + visibility RLS |

### Verification (post-apply)

| Check | Result |
|-------|--------|
| `publishers` table (new schema) | ✅ |
| `publisher_content_items` | ✅ |
| `church_claim_requests` | ✅ |
| `publishers.status` column | ✅ |
| Legacy `verification_status` gone | ✅ |
| `visibility` on content | ✅ |
| `churches.page_status` | ✅ |
| `monasteries.monastery_name` + `page_status` | ✅ |
| Monasteries seed preserved | ✅ 69 rows |
| RPCs + authenticated EXECUTE | ✅ |
| RLS policies: publishers (4), content (4), claims (1) | ✅ |

### Repo files added/updated

- **New:** `supabase/migrations/20250624240000_legacy_schema_bridge.sql`
- **Updated:** `20250624200000_alpha_107_page_status_claim.sql` — `DROP VIEW` before recreate + `page_status` on legacy monasteries

---

## Warnings

1. **`submit_publisher_content`** — نسختان (قديمة 5 معاملات + جديدة 9 معاملات). الكلاينت يستخدم النسخة الموسّعة.
2. **Admin RLS** على publishers/content = `using (true)` لكل `authenticated` — مؤقت لـ dev parity؛ يُقيَّد لاحقاً بـ `platform_owners`.
3. **`publisher_content_likes`** — لم يُنشأ بعد (خطوة Likes القادمة).
4. أعمدة legacy على `monasteries`: `monastery_code`, `source_url` — بقيت ولا تؤثر على الكلاينت.

---

## Errors

None during apply. Initial `alpha_107` attempt failed on view replace — fixed with `DROP VIEW IF EXISTS church_directory`.

---

## Recommendations

1. ✅ **Gate PASS** — يمكن الانتقال لخطوة 2 (Aggregator API) أو 4 (`/audio`) بعد موافقتك.
2. اختبار يدوي: claim كنيسة + تقديم طلب ناشر + إضافة محتوى من workspace.
3. لاحقاً: تقييد admin policies + جدول likes + storage للصوت/PDF.

---

## Overall Status

**PASS**
