# Agpeya Scroll Bar Alignment — Bible Chapter Parity

## Executive Summary

تم إلغاء شريط التقدّم القديم في الأجبية (3px متعدد الأقسام وغير متزامن بشكل صحيح) واستبداله بشريط القراءة الموحّد من شاشة الإصحاح — نفس المنطق والحجم (5px) والتدرّج والتوهج ونسبة الإكمال.

## Findings

1. **شريط الأجبية القديم:** `h-[3px]` مقسّم لكل قسم — بصرياً ضعيف ولا يطابق تجربة الكتاب المقدس.
2. **شريط الإصحاح:** `ReaderArticleProgress` يعتمد على `articleScrollProgress` + fill متحرك + تسميات «X% مكتمل».
3. **شريط التحكم السفلي:** الأجبية كان يستخدم `compact` بدون إخفاء تلقائي؛ الإصحاح يستخدم `comfort` + `chromeHidden` بعد 5 ثوانٍ.

## Changes

| File | Change |
|------|--------|
| `ReaderArticleProgress.tsx` | مكوّن مشترك مستخرج من شريط الإصحاح |
| `$book.$chapter.tsx` | يستخدم المكوّن المشترك |
| `agpeya.$prayerId.tsx` | حذف الشريط القديم؛ إضافة `ReaderArticleProgress` + `chromeHidden` + `barSize="comfort"` |

## Warnings

- شرائح الأقسام (chips) ما زالت تعتمد `sectionFills` للتلوين — لم تُمس.
- حفظ موضع القراءة في الأجبية ما زال يعتمد `state.progress` من `computeAgpeyaScrollState`.

## Errors

- لا يوجد.

## Recommendations

- فتح صلاة في `/agpeya/...` والتمرير للتحقق من الشريط والشريط الأخضر السفلي.

## Overall Status

**PASS**
