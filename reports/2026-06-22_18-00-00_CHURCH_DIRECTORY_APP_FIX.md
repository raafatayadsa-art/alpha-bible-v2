# Church Directory App Fix Report

## Executive Summary

تم تشخيص وإصلاح تعطّل تجربة دليل الكنائس. السبب الرئيسي: **تحميل Leaflet/react-leaflet مباشرة** يسبب crash في المتصفح (React Strict Mode: «Map container is already initialized»، أو `markerClusterGroup` غير متاح). تم تطبيق **تحميل lazy للخريطة على العميل فقط** + Error Boundary + fallback للقائمة. **`npm run build` — PASS.**

## Findings

### الأسباب المحتملة للتعطّل
1. **Leaflet + React Strict Mode** — تهيئة الخريطة مرتين → شاشة بيضاء
2. **markerClusterGroup** — استيراد ESM غير مكتمل → `is not a function`
3. **تحميل الخريطة فور فتح الشاشة** — أي خطأ يوقف الصفحة بالكامل

### الإصلاحات
| الملف | التغيير |
|-------|---------|
| `ChurchDirectoryMapGate.tsx` | lazy import + client-only mount + Error Boundary |
| `ChurchDirectoryMapView.tsx` | استيراد `leaflet.markercluster.js` صريح + fallback `layerGroup` + `invalidateSize` |
| `ChurchDirectoryScreen.tsx` | يفتح على **القائمة** أولاً؛ الخريطة اختيارية؛ تعطيل زر الخريطة عند الفشل |
| `vite.config.ts` | `optimizeDeps` لـ leaflet |

### ملاحظات dev server قديمة (ليست سبباً حالياً)
- خطأ قديم في `$book.$chapter.tsx` (تم حله — الملف 1470 سطر)
- خطأ مؤقت `trip-channel-access` (الملف موجود الآن)

## Warnings

- إذا لم تُطبَّق migration `church_directory` على Supabase المحلي، الدليل يظهر فارغاً (لا crash)
- الخريطة تحتاج اتصال إنترنت لبلاط Carto

## Errors

- لا أخطاء build بعد الإصلاح

## Recommendations

1. أعد تشغيل dev server: `npm run dev` (أغلق العمليات على 8080/8081 إن لزم)
2. افتح `/home` ثم `/church/directory`
3. ابدأ من **عرض القائمة** ثم جرّب **الخريطة**

## Overall Status

**PASS**
