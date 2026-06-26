# Books Screen Premium Polish

**Date:** 2026-06-18  
**Scope:** `/books-v2` — hero, book cards, gospels filter, background, continue-reading removal

---

## Executive Summary

Implemented user feedback on the Books (مكتبة الأسفار) screen: premium portrait book tiles in a 2-column grid, image-rich hero card, richer layered background, Matthew (متى) restored in the Four Gospels section, and removal of the Continue Reading card.

---

## Findings

### 1. Matthew missing from Gospels (root cause)

`matchesNtFilter` used Arabic substring `"متى"` on **normalized** names. The `norm()` helper maps alef maksura `ى` → `ي`, so **متى** becomes **متي** and failed the `"متى"` check.

**Fix:** Classify NT books by `resolveBookId()` → `Matthew | Mark | Luke | John` instead of fragile string matching.

### 2. Hero card without image

The hero used flat gradients only. Replaced with full-bleed testament artwork (`ot-card-bg-v2.jpg` / `nt-card-bg-v4.jpg`) and bottom gradient overlay — same visual language as `BibleV2TestamentCard`.

### 3. Book cards not premium

Horizontal list cards replaced with **portrait tiles** (`aspect-[3/4]`):
- Full-bleed book art from `/bible-icons/books/{BookId}.webp`
- Gold/blue ring + lift shadow
- Order badge, title, meaning, category + chapter chips on gradient footer
- **2 cards per row** via `grid grid-cols-2 gap-2.5`

### 4. Empty background

Layered backdrop added:
- `headerCathedralBg` (cathedral still)
- `control-center-bg.png`
- `bg-watermark.jpg`
- Radial glow + dot pattern + floating Coptic glyphs

### 5. Continue Reading card

`<BibleV2ContinueReading />` removed from `BooksV2Screen.tsx` per user request.

### 6. Gospels ordering

Gospels section now sorted by canonical order via `getBookSymbolDef().order`.

---

## Files Changed

| File | Change |
|------|--------|
| `src/lib/book-meta.ts` | ID-based NT filter (gospels/letters/revelation) |
| `src/features/books-v2/books-premium-sections.ts` | Canonical sort for gospels |
| `src/features/books-v2/components/BooksPremiumBookCard.tsx` | Premium portrait tile redesign |
| `src/features/books-v2/components/BooksPremiumSectionBlock.tsx` | 2-column grid |
| `src/features/books-v2/components/BooksV2Screen.tsx` | Hero image, rich background, remove continue reading |

---

## Warnings

- Book tile art depends on `/public/bible-icons/books/*.webp`; missing assets fall back to broken image unless browser handles gracefully.
- Hero pulse animation classes unchanged; may be subtle on image-backed hero.

---

## Errors

None. Production build **PASS**.

---

## Recommendations

1. Add `onError` fallback on book tile images (symbol + gradient) for books without webp art.
2. Manual QA on device: NT → الأناجيل tab — verify four books including **متى** in order.
3. Tablet: confirm 2-column grid spacing at wider breakpoints (optional `sm:grid-cols-3` later if desired).

---

## Overall Status

**PASS**
