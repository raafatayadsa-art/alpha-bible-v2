# ALPHA-082 — Smart Context Card System (v1 Foundation)

## Executive Summary

تم تنفيذ الأساس الأول لنظام **Smart Context Card** — مساحة ذكية موحّدة على الشاشة الرئيسية تختار المحتوى تلقائياً حسب الأولوية (رحلة نشطة → حجز → فعالية → طلب صلاة → قراءة → كونكت → رحلة روحية).

## Findings

### ما تم بناؤه

| مكوّن | المسار |
|--------|--------|
| الأنواع | `src/features/smart-context/types.ts` |
| محرك الأولوية | `src/features/smart-context/smart-context-engine.ts` |
| حالة الرحلة الحية (local) | `src/features/smart-context/trip-live-store.ts` |
| Hook التجميع | `src/features/smart-context/useSmartContext.ts` |
| واجهة الكارت | `src/features/smart-context/SmartContextCard.tsx` |
| التركيب على الرئيسية | `src/routes/home.tsx` (بعد Hero Stack) |

### أولوية العرض (v1)

1. رحلة نشطة (Trip Companion) — عند وجود حجز
2. ملخص إكمال الرحلة (72 ساعة)
3. رحلة قادمة / حجز مفتوح
4. فعالية / اجتماع / قداس
5. إعلان مثبّت
6. طلبات صلاة عاجلة
7. متابعة القراءة
8. نشاط Alpha Connect
9. رحلتي مع الكتاب (fallback)

### Trip Companion Card

يعرض عند الحجز: العنوان، ETA، المحطة، آخر إعلان، شريط تقدّم، أزرار القناة وQR والتفاصيل.

## Warnings

- **GPS / إشعارات فورية:** غير متصلة بعد — الحالة من `localStorage` (`alpha:082:trip-live`)
- **مصدر المنشورات:** `CHURCH_POSTS` المحلية على الرئيسية (لم يُربط بعد بـ `useChurchPosts`)
- **آية اليوم:** متعمداً خارج الكارت الذكي لتجنب التكرار مع Hero Stack
- **QR الحجز:** يفتح صفحة المنشور حتى اكتمال تدفق QR

## Errors

- لا يوجد.

## Recommendations

1. ربط `useSmartContext` بـ `fetchChurchPosts(churchId)` عند توفر الكنيسة
2. Edge Function / Realtime لتحديثات الرحلة (انطلاق، وصول، مغادرة)
3. استدعاء `markTripCompleted()` من لوحة المنظم بعد انتهاء الرحلة
4. دمج `platform-store` flag لـ `reservations` عند تفعيله

## Overall Status

**PARTIAL** — v1 foundation على الرئيسية؛ بيانات حية كاملة للرحلات تتطلب backend.
