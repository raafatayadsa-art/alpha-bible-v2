# Home Page Runtime Fix — Missing `valueHidden` Prop

## Executive Summary

الشاشة الرئيسية (`/home`) كانت تتعطل وتعرض «تعذّر تحميل الصفحة» بسبب `ReferenceError: valueHidden is not defined` داخل `HeroSpiritLedgerCell` عند استخدام `glyphPosition="edge"`. تمت إضافة الخاصية `valueHidden` إلى توقيع المكوّن مع القيمة الافتراضية `false`. بعد الإصلاح تُحمَّل الرئيسية بنجاح (تحية، كروت الهيرو، Alpha Connect، إلخ).

## Findings

1. **السبب الجذري:** في `src/components/home/hero-card-chrome.tsx`، فرع JSX عند `glyphPosition === "edge"` يستخدم `!valueHidden` (سطر ~330) بينما `valueHidden` لم يُعرَّف في destructuring أو في نوع الـ props.
2. **المكوّنات المتأثرة على الرئيسية:**
   - `AlphaConnectHomeCard` — `glyphPosition="edge"` لرسائل/مكالمات
   - `ChurchDirectoryHomeCard` — أزرار ledger على الحافة
   - `KholagyHomeCard` — أزرار ledger على الحافة
3. **آلية الخطأ:** TanStack Router `ErrorComponent` في `__root.tsx` يلتقط الخطأ ويعرض واجهة «تعذّر تحميل الصفحة».
4. **التحقق:** بعد HMR، `http://localhost:8082/home` يعرض التحية («تصبح على خير»)، كروت القراءات/الآية، Smart Context، بدون رسالة الخطأ.

## Warnings

- إصلاح `index.tsx` / onboarding السابق كان صحيحاً لمسار الدخول لكنه لم يكن سبب تعطل `/home`.
- أي مكوّن جديد يستخدم `glyphPosition="edge"` يعتمد الآن على `valueHidden` الاختياري — القيمة الافتراضية `false` تحافظ على السلوك السابق.

## Errors

| قبل الإصلاح | بعد الإصلاح |
|-------------|-------------|
| `ReferenceError: valueHidden is not defined` عند render `HeroSpiritLedgerCell` مع `glyphPosition="edge"` | لا أخطاء runtime على `/home` |

## Recommendations

1. عند إضافة props جديدة في JSX، إكمال destructuring + نوع TypeScript في نفس التعديل.
2. إضافة اختبار smoke بسيط (Playwright) لـ `/home` يتحقق من عدم ظهور «تعذّر تحميل الصفحة».
3. تشغيل `npx playwright install` محلياً لتفعيل سكربتات `reports/audit-*-runtime.mjs`.

## Overall Status

**PASS**

---

**File changed:** `src/components/home/hero-card-chrome.tsx`  
**Fix:** Added `valueHidden?: boolean` prop with default `false` to `HeroSpiritLedgerCell`.
