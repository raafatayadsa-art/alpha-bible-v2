# Alpha Control Dashboard Cleanup

**Date:** 2026-06-27  
**Scope:** Remove duplicate sections + fix bottom nav

---

## Executive Summary

تم تنظيف لوحة Alpha Control: حذف «استخدام الميزات» و«الرؤى الذكية»، إزالة تكرار Emergency والإعدادات، وتفعيل شريط القائمة السفلي بـ Link.

**Overall Status: PASS** (build verified)

---

## Findings

### Removed (Image 1 & 2 sections)
- `FounderFeatureUsage` — استخدام الميزات
- `FounderSmartInsights` — بطاقات التنبيهات/الأداء

### Removed duplicates
- `FounderEmergencyModuleCard` — كان يكرر `FounderEmergencyBanner`
- «إعدادات النظام» من قسم System (يبقى في شريط المنيو)
- من أدوات سريعة: الإعدادات، الإشعارات، النسخ الاحتياطي (كلها كانت → settings)
- تبويب Emergency من `FounderSectionNav`

### Bottom nav fix
- استبدال `button + navigate()` بـ **`Link`** من TanStack Router
- `z-50` + `touch-manipulation` + `preload="intent"`
- تحديد التبويب النشط تلقائياً من المسار الحالي

---

## Warnings

- الإعدادات متاحة فقط من شريط المنيو السفلي (وليس من بطاقة System).
- Emergency Center: بطاقة واحدة فقط (`FounderEmergencyBanner`).

---

## Errors

- None (`npm run build` — PASS)

---

## Overall Status

**PASS**
