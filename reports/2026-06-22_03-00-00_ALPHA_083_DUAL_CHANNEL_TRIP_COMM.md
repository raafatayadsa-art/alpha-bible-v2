# ALPHA-083 — Dual Channel Trip Communication (v1 Foundation)

## Executive Summary

عند إنشاء رحلة/مؤتمر/حجز دير، يُنشئ النظام تلقائياً **قناتين منفصلتين** مرتبطتين بنفس الرحلة: قناة عامة للمشاركين وقناة تنظيم داخلية للمنظمين فقط — مع تبويبات للمنظم، لوحة تشغيل، وتنبيهات داخلية.

## Findings

### ما تم بناؤه

| المكوّن | الوظيفة |
|---------|---------|
| `provision-trip-channels.ts` | إنشاء قناتين تلقائياً عند نشر رحلة |
| `trip-channel-links.ts` | ربط `postId` ↔ `tripChannelId` + `organizerChannelId` |
| `trip-channel-access.ts` | صلاحيات الأدوار + إخفاء قناة التنظيم عن الأعضاء |
| `trip-operations-store.ts` | لوحة تشغيل + Internal Alerts |
| `TripChannelTabs.tsx` | تبويبا الرحلة / التنظيم للمنظم |
| `TripOperationsPanel.tsx` | حضور، غائبون، حافلات، سكن، تنبيهات سريعة |

### التكامل

- **PostBuilder:** بعد `createChurchPost` لنوع `trip` → `provisionTripChannels`
- **post-registrations:** بعد الحجز → انضمام تلقائي لقناة الرحلة
- **Alpha Connect:** `?channel=ch-xxx&tab=channels` + PTT مرتبط بالقناة النشطة
- **Smart Context (082):** زر «قناة الرحلة» يفتح القناة مباشرة
- **نهاية الرحلة:** `markTripCompleted` → أرشفة القناتين

### قناة 1 — Trip Channel (`trip_public`)

- للمشاركين المقبولين + المنظمين
- إعلانات، تعليمات، PTT (admins_only للمنظمين)
- انضمام تلقائي عند الحجز

### قناة 2 — Organizer Channel (`trip_organizer`)

- مخفية عن الأعضاء العاديين في قائمة القنوات
- للمنظمين فقط — تبويب «التنظيم»
- لوحة تشغيل + Internal Alert (لا يصل للمشاركين)

### الأدوار (v1 local)

`owner`, `organizer`, `assistant`, `bus_lead`, `attendance_lead`, `housing_lead` — مع صلاحيات مستقلة في `TRIP_ORGANIZER_PERMISSIONS`.

## Warnings

- التخزين **localStorage** في v1 — لا مزامنة بين الأجهزة
- لا جداول Supabase للقنوات بعد — migration مقترحة لـ v1.5
- Check-In / QR / GPS — واجهة جاهزة جزئياً؛ backend لاحقاً
- الرحلات القديمة (`trip-monastery`) تُنشأ قنواتها عند أول عرض في Smart Context

## Errors

- لا يوجد.

## Recommendations

1. Migration `trip_channel_links` على `church_posts.details` أو جدول مخصص
2. Realtime لتحديث `trip-operations-store` من لوحة المنظم
3. ربط QR الحجز بـ `post_registrations.qr_token`
4. أرشيف read-only UI عند `archived: true` على القناة

## Overall Status

**PARTIAL** — v1 foundation مع dual channels + UX منظم؛ backend كامل للتشغيل المباشر لاحقاً.
