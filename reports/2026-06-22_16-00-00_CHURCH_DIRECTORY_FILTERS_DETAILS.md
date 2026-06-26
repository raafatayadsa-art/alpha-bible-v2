# Church Directory Filters & Details Report

## Executive Summary

تم تحديث دليل الكنائس ليدعم **تصفية متسلسلة** بالإيبارشية والمحافظة والمدينة، وتفعيل **زر التفاصيل** بصفحة بطاقة شاملة من جدول `churches`، وتفعيل **زر الاتجاهات** باستخدام `latitude`/`longitude` من DB (1200/1241 كنيسة) أو العنوان النصي كبديل. **`npm run build` — PASS**.

## Findings

### تصفية الموقع
- 3 قوائم: **الإيبارشية** (68) → **المحافظة** (26) → **المدينة** (111)
- القوائم متسلسلة: اختيار إيبارشية يضيّق المحافظات والمدن
- بحث نصي إضافي لاسم الكنيسة/الكاهن
- زر «مسح الكل» لإعادة التصفية

### التفاصيل
- مسار `/church/directory/$placeId` يعرض `ChurchDirectoryDetailCard`
- البيانات من DB: الاسم، الإنجليزي، الإيبارشية، المحافظة، المدينة، الكاهن، القديس الشفيع، الأعياد، العنوان، الإحداثيات، التواصل، الروابط، الأعضاء/خدام، كود الكنيسة

### الاتجاهات
- `mapsDirectionsUrlForChurch()` → Google Maps `/dir/` مع `destination=lat,lng`
- بدون إحداثيات: `destination=اسم الكنيسة، المدينة، المحافظة، مصر`
- `churchHasMapTarget()` يتحقق قبل تفعيل الزر

### ملفات جديدة/محدّثة
- `src/features/church/directory-filters.ts`
- `src/features/church/ChurchDirectoryDetailCard.tsx`
- `src/features/church/churches-directory-api.ts` (حقول موسّعة + directions)
- `src/features/church/churches-table.ts` (SELECT موسّع)
- `src/routes/church.directory.tsx`
- `src/routes/church.directory.$placeId.tsx`

## Warnings

- 41 كنيسة بدون إحداثيات — الاتجاهات تعتمد على البحث النصي
- بعض حقول DB (email, website, description) فارغة لمعظم الصفوف — تُخفى أقسامها تلقائياً

## Errors

- لا أخطاء build

## Recommendations

1. إكمال `latitude`/`longitude` للـ 41 صف المتبقي
2. إضافة فلتر سريع «محافظتي» من موقع المستخدم لاحقاً
3. Lazy-load الدليل عند >2000 كنيسة (pagination)

## Overall Status

**PASS**
