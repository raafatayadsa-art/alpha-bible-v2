# تحليل — لماذا لم تظهر/تثبت تعديلات شاشة الخولاجي

**Date:** 2026-06-24  
**Scope:** Khoulagy index screen UI (card spacing, border glow, home card, module gate)  
**Project:** Alpha Bible

---

## Executive Summary

التعديلات **موجودة فعلاً على القرص المحلي** وتُخدم من `npm run dev` على `http://localhost:8080`.  
سبب عدم رؤيتها ليس «فشل الكتابة في الملفات»، بل **فجوة بين بيئة التطوير المحلية وبيئة العرض التي يختبرها المستخدم** — غالباً **نسخة منشورة قديمة** أو **تبويب/جهاز يعرض bundle قديم**، مع عوامل ثانوية: **بوابة الموديولات + cache المتصفح**، و**تأثيرات hover غير مرئية على الموبايل**، و**فروق spacing دقيقة جداً**.

**Overall Status: PARTIAL** — الكود محلياً PASS، ظهور التعديلات للمستخدم FAIL/PARTIAL حسب البيئة.

---

## Findings

### 1) التعديلات موجودة محلياً (مؤكد)

| العنصر | الملف | الحالة | دليل |
|--------|------|--------|------|
| شبكة الكروت + glow | `src/routes/kholagy.index.tsx` | ✅ | `kholagy-grid-card`, `gap-1`, `opacity-100` على الإطار |
| شاشة القراءة | `src/routes/kholagy.$groupId.tsx` | ✅ | ملف جديد غير متتبع |
| API + تجميع البيانات | `src/features/kholagy/` | ✅ | 127 صف من جدول `kholagy` |
| كارت الرئيسية | `src/components/home/KholagyHomeCard.tsx` | ✅ | مُعرَض في `home.tsx` |
| تسجيل المسارات | `src/routeTree.gen.ts` | ✅ معدّل | `/kholagy/` و `/kholagy/$groupId` |

**تحقق dev server (2026-06-24):**  
طلب `http://localhost:8080/src/routes/kholagy.index.tsx?tsr-split=component` يحتوي:
- `kholagy-grid-card`: **True**
- `gap-1`: **True**
- `opacity-100`: **True**

---

### 2) السبب الرئيسي — لم تُنشر ولم تُ commit (Critical)

```
git status (ملخص):
?? src/routes/kholagy.index.tsx
?? src/routes/kholagy.$groupId.tsx
?? src/features/kholagy/
?? src/lib/platform-modules/
?? src/components/home/KholagyHomeCard.tsx
 M src/routes/home.tsx
 M src/routeTree.gen.ts
```

- `git ls-files` على مسارات الخولاجي → **فارغ** (لم تُ commit أبداً).
- آخر commits على `main` لا تتضمن الخولاجي (`Update Hero Carousel`, …).
- **Cloudflare Workers deploy** يعتمد على `npm run build && wrangler deploy`.
- أي اختبار على **رابط الإنتاج** (Workers / PWA / bookmark) يعرض **نسخة ما قبل الخولاجي** — لا كروت جديدة، لا spacing، لا glow.

**الاستنتاج:** التعديلات «لم تثبت» لأنها **لم تصل للبيئة التي يفتحها المستخدم**.

---

### 3) بوابة الموديولات + localStorage (سبب شائع لـ «الشاشة مش شغالة»)

`PlatformModuleGate` في `src/routes/__root.tsx` يحيط بكل الشاشات:

- مسار `/kholagy` مربوط بمفتاح `kholagy` في `module-route-map.ts`.
- إذا `isModuleEnabled("kholagy") === false` بعد انتهاء التحميل → **redirect فوري إلى `/home`**.
- يبدو للمستخدم أن الشاشة «لا تعمل» أو «لا تتغير».

**مصادر تعطيل خاطئ:**

| المصدر | المفتاح | المشكلة |
|--------|---------|---------|
| Cache قديم | `ab:platform-modules-public` (v1) | لا يحتوي `kholagy` → سلوك غير متوقع |
| Cache قديم | `ab:platform-modules-public-v2` | قد يحفظ `enabled: false` |
| Alpha Control | `ab:mc-modules` + `patchCachedPlatformModule` | toggle محلي يعطّل قبل sync من DB |

**قاعدة البيانات (Supabase):** `platform_modules.kholagy.enabled = true` ✅

**إصلاح جزئي موجود محلياً:** cache v3 + `purgeLegacyPlatformModuleCaches()` — لكن يحتاج **Hard Refresh** أو مسح storage يدوياً.

---

### 4) SSR معطّل — المحتوى client-only

```tsx
// kholagy.index.tsx
ssr: false
```

- HTML الأولي من `/kholagy` **لا يحتوي** نص «الخولاجي» أو classes.
- التعديلات تظهر **بعد تحميل JS** فقط.
- View Source أو curl بدون JS → يبدو أن «لا شيء تغير».

---

### 5) التعديلات البصرية «خفية» على الموبايل (سبب إدراكي)

| التعديل المطلوب | التطبيق الحالي | لماذا لا يُلاحظ |
|-----------------|----------------|-----------------|
| تصغير الفواصل | `gap-3` → `gap-1.5` → `gap-1` | فرق 4–8px فقط بين الكروت |
| glow مثل الكتاب | `@media (hover: hover)` للرفع والتوهج | **لا hover على اللمس** — يظهر فقط بالماوس على Desktop |
| إطار خفيف | `opacity-100` + box-shadow خفيف | موجود لكن subtle على خلفية بنفسجية فاتحة |

**ملاحظة:** `:active` glow أُضيف لاحقاً — يظهر عند **الضغط** فقط، وليس «عند المرور».

---

### 6) احتمالات بيئة اختبار إضافية

| السيناريو | الأثر |
|-----------|-------|
| فتح `https://…workers.dev` بدلاً من `localhost:8080` | لا تعديلات |
| تبويب dev قديم على port آخر (8081, 8084) | bundle قديم |
| الهاتف على Wi‑Fi لكن bookmark للإنتاج | لا تعديلات |
| HMR لم يُحدّث `/kholagy` (دخول مباشر قبل reload) | Hard refresh يحل |

---

## Warnings

- مسح `localStorage` يعيد defaults — قد يؤثر على onboarding وقراءات محفوظة.
- commit بدون deploy → CI/production ما زالت قديمة.
- deploy بدون commit → يعمل من الجهاز المحلي فقط؛ فريق/CI لا يرى الكود.

---

## Errors

- **لا أخطاء build** في آخر تشغيل محلي.
- **لا خطأ DB** — جدول `kholagy` (127 صف) + module مفعّل.

---

## Recommendations (بالترتيب)

1. **تأكيد البيئة:** افتح `http://localhost:8080/kholagy` (أو `192.168.100.8:8080` من نفس الجهاز الذي يشغّل `npm run dev`).
2. **Hard Refresh:** Ctrl+Shift+R على `/kholagy` و `/home`.
3. **مسح cache الموديولات (DevTools → Application → Local Storage):**
   - `ab:platform-modules-public`
   - `ab:platform-modules-public-v2`
   - `ab:platform-modules-public-v3` (ثم reload)
4. **اختبار glow على Desktop** بالماus — أو اضغط مطوّلاً على الكارت على الموبايل لرؤية `:active`.
5. **لثبات الإنتاج:** `git add` + commit + `npm run build && npm run deploy`.
6. **اختياري:** جعل glow ظاهراً دائماً على touch (ليس hover-only) إذا كان المطلوب واضحاً على الهاتف.

---

## Root Cause Matrix

| # | السبب | الاحتمال | يفسر «لا شيء تغير» | يفسر «الشاشة لا تفتح» |
|---|--------|----------|---------------------|------------------------|
| 1 | إنتاج بدون deploy | **عالي جداً** | ✅ | ✅ |
| 2 | ملفات غير committed | **عالي** | ✅ | ✅ |
| 3 | Module gate + cache | متوسط | جزئي | ✅ |
| 4 | hover-only على موبايل | **عالي** للـ glow | ✅ | ❌ |
| 5 | spacing subtle | متوسط | ✅ | ❌ |
| 6 | SSR false / JS قديم | منخفض–متوسط | ✅ | ✅ |

---

## Overall Status

**PARTIAL**

- **Local codebase:** PASS — التعديلات مكتوبة وتُخدم من dev.
- **User-visible / production:** FAIL — لم تُثبت لأن البيئة المعروضة غالباً ليست نفس build التطوير المحلي.
