# Journal Compose Sheet UX Refactor

**Date:** 2026-06-19  
**Scope:** Compose sheet layout — tabs, dropdowns, reference picker, Bible search

---

## Executive Summary

Refactored the journal/meditation compose sheet per UX request: removed duplicate note/meditation tabs, replaced prompt/tag rows with compact dropdown chips, added Bible 2 word search above reference pickers, and laid out book/chapter/verse horizontally with verse link summary below.

---

## Findings

### Changes
1. **Removed** in-sheet «ملاحظة دراسة / تأمل روحي» tabs (type comes from main screen tab).
2. **Notes:** two side-by-side menu chips — «نوع الدراسة» + «اقتراحات سريعة» — each opens a small dropdown list.
3. **Meditation:** single «وصف التأمل» chip; all `MEDITATION_PROMPTS` inside dropdown (append to body on select).
4. **Layout order:** menu chips → title → body → **Bible word search** → book | chapter | verse (3 columns) → linked verse badge below.
5. **JournalReferencePicker:** horizontal chips; link summary under pickers; fixed «بدون رقم آية» handler.

### New files
- `JournalComposeMenuChip.tsx` — reusable dropdown chip
- `JournalComposeBibleSearch.tsx` — compact Bible 2 search in sheet

---

## Warnings

- Bible search in compose navigates away to scripture (same as main journal search).
- Dropdowns close on outside tap; z-index 20 within sheet scroll.

---

## Errors

- None. `npm run build` **PASS**.

---

## Recommendations

- Optional: Bible search in compose could fill reference instead of navigating.
- Add `goldMuted` was missing from tokens — added.

---

## Overall Status

**PASS**
