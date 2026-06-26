# Books OT Portraits, Hero Fix, Duplicate Title Removal

**Date:** 2026-06-18  
**Scope:** `/books-v2` book cards, hero images, Orthodox OT icon coverage

---

## Executive Summary

Removed duplicate book titles from card overlays, generated premium 3:4 portrait art for all **46 Orthodox OT books** (including 7 previously missing deuterocanonical books), and fixed library hero cards to use the correct testament reference images at card aspect ratio.

---

## Findings

### 1. Duplicate book name (on image + overlay)

Portrait art now bakes Arabic **book name + category** into the image. The UI `h3` title was removed from `BooksPremiumBookCard`; only meaning, category chip, and chapter count remain in the footer overlay. `aria-label` preserves accessibility.

### 2. Eight books without images

Root cause: **7 deuterocanonical books** were absent from `BibleBookId` / `resolveBookId` (Tobit, Judith, 1–2 Maccabees, Wisdom, Sirach, Baruch). They could not resolve to `/bible-icons/books/{id}.webp`.

**Fix:** Extended icon registry + aliases; generated portrait webp for all 46 OT books via `scripts/generate-bible-ot-portrait-cards.mjs`.

### 3. Hero card images

Books library hero used `ot-card-bg-v2.jpg` / `nt-card-bg-v4.jpg` (poor fit). Switched to **`old-testament-ref.jpg`** / **`new-testament-ref.jpg`** (same premium 3D cards as Bible 2 home), with `aspect-[3/4]`, `max-w-[340px]`, `object-cover object-center`.

Also updated `src/features/bible-v2/assets/index.ts` so Bible 2 testament tiles use the same ref images.

### 4. Portrait generation pipeline

New script: `node scripts/generate-bible-ot-portrait-cards.mjs`

- Output: `480×640` webp (3:4), gold border, symbol halo, Arabic title/category, order badge
- Font: `scripts/assets/NotoNaskhArabic-Bold.ttf` (auto-downloaded on first run)
- Texture overlay from `ot-card-bg-v2.jpg` at 22% multiply

---

## Files Changed

| Area | Files |
|------|--------|
| UI | `BooksPremiumBookCard.tsx`, `BooksV2Screen.tsx` |
| Icons | `BibleBookIcons.ts`, `book-symbol-registry.ts`, `resolve-book-icon.ts` |
| Filters | `book-meta.ts`, `books-premium-meanings.ts` |
| Assets export | `bible-v2/assets/index.ts` |
| Script | `scripts/generate-bible-ot-portrait-cards.mjs` |
| Generated | `public/bible-icons/books/*.webp` (46 OT) |

---

## Warnings

- NT book tiles still use prior circular art; user requested OT completion only.
- Regenerating OT art overwrites existing `{BookId}.webp` for all 46 OT IDs.
- Arabic shaping in SVG depends on Noto Naskh font file in `scripts/assets/`.

---

## Errors

None. Build **PASS**. All 46 OT portrait files generated successfully.

---

## Recommendations

1. Run the same portrait script pattern for **27 NT books** when ready.
2. Commit `scripts/assets/NotoNaskhArabic-Bold.ttf` for reproducible builds offline.
3. Visual QA on device: verify طوبيا، باروخ، يشوع بن سيراخ cards and hero aspect on narrow phones.

---

## Overall Status

**PASS**
