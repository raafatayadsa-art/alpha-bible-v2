# Books Cards UI + OT/NT Art Regeneration

**Date:** 2026-06-18  
**Scope:** Book card overlay, OT 46 portraits, 8 Paul epistles, testament hero cards

---

## Executive Summary

Removed all overlay text from book tiles (meaning, category, order — now baked in art only). Regenerated **46 OT** and **8 Paul NT** portrait cards at **960×1280** with top category/order layout matching NT logic. Created new **3:4 hero** images for OT/NT library tabs with integrated book counts and 3D break-out styling.

---

## Findings

### 1. Card UI cleanup
- Removed meaning sentence under cards
- Removed duplicate category + order badges from UI (moved into image top bar)
- Card is now **image-only** + hover scale; `aria-label` kept for accessibility

### 2. OT art — full regeneration (46 books)
- Upgraded from 480×640 → **960×1280** (retina 3:4)
- Shared renderer: `scripts/lib/bible-portrait-art.mjs`
- Layout: **category top-right**, **order top-left**, **title bottom**, 3D symbol with glow/break-out
- Gold parchment theme + texture overlay

### 3. Paul epistles — 8 books (NT blue theme)
Generated with subtitle **«رسالة بولس الرسول»**:
1. Romans  
2. 1 Corinthians  
3. 2 Corinthians  
4. Galatians  
5. Ephesians  
6. Philippians  
7. Colossians  
8. 1 Thessalonians  

### 4. Hero cards (OT + NT)
- New assets: `src/features/books-v2/assets/books-hero-ot.webp`, `books-hero-nt.webp`
- 960×1280, integrated **46 / 27 سفراً**, 3D crown break-out
- `BooksV2Screen` uses baked hero art only (removed duplicate HTML overlay)

---

## Scripts

| Command | Output |
|---------|--------|
| `node scripts/generate-bible-ot-portrait-cards.mjs` | 46 OT webp |
| `node scripts/generate-bible-nt-paul-portrait-cards.mjs` | 8 Paul webp |
| `node scripts/generate-bible-testament-hero-cards.mjs` | 2 hero webp |

---

## Warnings

- Remaining NT books (gospels, Acts, other epistles) still use prior 1536×1024 assets until regenerated with same pipeline.
- Remaining 5+ Paul epistles (2 Thess, 1–2 Tim, Titus, Philemon, Hebrews) not in this batch — user asked for 8.

---

## Errors

None. Build **PASS**.

---

## Recommendations

1. Run full NT portrait batch (27 books) with `--testament=nt` flag when approved.
2. Extend Paul script for remaining epistles if user wants all 13–14 Paul letters unified.

---

## Overall Status

**PASS**
