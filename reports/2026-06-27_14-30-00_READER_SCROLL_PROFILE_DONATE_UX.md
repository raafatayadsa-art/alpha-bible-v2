# Reader Scroll · Profile · Donate UX Update

**Date:** 2026-06-27

---

## Executive Summary

تحسين تجربة التمرير في شاشات القراءة (الكتاب المقدس، الأجبية، الخولاجي)، نقل «المزيد» إلى الصفحة الشخصية، إزالة قفل إعدادات الموديول، إعادة تصميم شاشة التبرع، وإضافة غلاف قابل للتغيير خلف الأفاتار.

---

## Findings

1. **التمرير:** شريط التمرير والمنيو كانا يختفيان لكن بدون hook موحّد؛ الأجبية lacked custom scroll rail.
2. **Autoscroll:** لم يكن يتوقف عند السحب اليدوي.
3. **المزيد:** مكرر في قائمة الأفاتار و`/more`.
4. **الإعدادات:** إشعارات الكنيسة/المجتمع مخفية عند تعطيل الموديول؛ `bibleAutoscrollSpeed` غير مربوط بالقارئ.
5. **التبرع:** تصميم بطاقة صغيرة وليس full-screen glass.

---

## Changes

| Area | Change |
|------|--------|
| `useReadingChromeVisibility` | إخفاء موحّد بعد 5 ثوانٍ |
| `useReadingAutoscroll` | إيقاف عند touch/wheel/سحب الشريط |
| `ChapterReadingScrollRail` | `hidden` + إيقاف autoscroll |
| Bible / Agpeya / Kholagy | Hook + rail في الأجبية |
| `BottomDock` | idle 5s |
| `ProfileSettingsMenu` | إزالة «المزيد» |
| `ProfileServicesSection` | «المزيد والخدمات» في `/profile` |
| `ProfileSimpleHeader` | غلاف + أفاتار متداخل |
| `profile-user-store` | `customCoverUrl` |
| `DonateScreen` | Full-height glass iPhone style |
| `AlphaControlCenter` | إزالة قفل الموديول + إعدادات قراءة مكررة |
| `ReadingSettingsScreen` | رجوع إلى `/profile` |

---

## Warnings

- صورة الغلاف تُحفظ محلياً (data URL) — رفع سحابي لاحقاً إن رُغب.
- `/more` route ما زال موجوداً للروابط القديمة.

---

## Errors

- Build: **PASS**

---

## Overall Status

**PASS**
