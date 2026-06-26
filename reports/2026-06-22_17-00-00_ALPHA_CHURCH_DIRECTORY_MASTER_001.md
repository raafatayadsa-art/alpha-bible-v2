# ALPHA-CHURCH-DIRECTORY-MASTER-001 Report

## Executive Summary

تم تنفيذ **دليل الكنائس التفاعلي الذكي** وفق مواصفة ALPHA-CHURCH-DIRECTORY-MASTER-001: View خفيف `church_directory`، RPC للبحث والصفحات (20/صفحة)، خريطة Leaflet تفاعلية مع Clustering وعلامات Alpha Premium، بحث لحظي، فلاتر Glass Pills، تزامن قائمة/خريطة، وبطاقة زجاجية عند الاختيار. **تفاصيل الكنيسة الكاملة تُحمّل فقط عند فتح صفحة التفاصيل.** **`npm run build` — PASS.**

## Findings

### قاعدة البيانات (مطبّق على Supabase)

| كائن | الغرض |
|------|--------|
| `church_directory` (VIEW) | 10 حقول فقط للخريطة/البحث/القائمة |
| `search_church_directory()` | pagination + haversine + فلاتر |
| `church_directory_facets()` | أعداد وقوائم المحافظات/المدن/القديسين |

**ممنوع** `select *` من `churches` في شاشة الدليل — ✅

### الأداء

- أول تحميل: **20 كنيسة** (الأقرب عند توفر الموقع)
- Infinite scroll: +20 لكل صفحة
- الخريطة تعرض فقط الكنائس المحمّلة (لا 1241 دفعة واحدة)
- الصور في القائمة: `church_logo` فقط (صغير)
- Hero/تواصل/وصف: **صفحة التفاصيل فقط**

### الواجهة

- هوية: Warm Beige `#F5F2ED` · Royal Purple `#5D3291` · Gold `#D4AF37`
- Glassmorphism + زوايا كبيرة + Ⲁ Ⲱ
- تبديل **خريطة / قائمة** مع تزامن التحديد
- Floating Glass Card: تفاصيل · اتجاهات · حفظ · مشاركة
- Blue Pulse لموقع المستخدم
- Alpha Church Markers + Marker Clustering

### الملفات الرئيسية

- `src/features/church-directory/` — الوحدة الكاملة
- `src/routes/church.directory.tsx` — نقطة الدخول
- `supabase/migrations/20250622170000_church_directory_view.sql`

## Warnings

- الخريطة تستخدم **Carto Light + Leaflet** (ليس Google Maps UI) — الاتجاهات تفتح Google Maps خارجياً فقط
- 41 كنيسة بدون إحداثيات — تظهر في البحث/القائمة دون marker
- `church_directory_facets()` يحمّل قوائm distinct كاملة — مقبول لـ ~1241 صف؛ يُنصح بتحسين لـ 50k+

## Errors

- لا أخطاء build بعد الإصلاح

## Recommendations

1. RPC `church_directory_cities_by_governorate(gov)` للفلتر المتسلسل عند التوسع
2. Map bounds query لتحميل markers في نطاق الخريطة فقط
3. Offline cache للصفحة الأولى (20) في Service Worker
4. ربط «القريبة مني» بعدد ديناميكي في pill

## Overall Status

**PASS**
