# Books Screen Premium Redesign

**Date:** 2026-06-19  
**Scope:** `/books-v2` — مكتبة الأسفار

---

## Executive Summary

Redesigned the Bible 2 books screen into a premium **Alpha Library** experience: testament hero with pulse, sectioned OT/NT layout, cinematic book cards with per-book art and meanings, and selective gold/blue twinkle animations aligned with verse-card DNA.

---

## Findings

### Visual system
- Ivory watermark backdrop + floating orb + star twinkles
- Hero card with **pulse animation** (OT gold / NT navy variants)
- Testament tabs with **gold pulse** when active (journal-chip DNA)
- Every 5th book card gets **spotlight pulse** (verse-card rhythm)

### Structure
- **Old Testament:** الشريعة · التاريخ · الحكمة · الأنبياء
- **New Testament:** الأناجيل · الأعمال · الرسائل · الرؤيا
- Category filter chips + inline book name search (unchanged logic)

### Book cards
- Per-book **webp art** from `/bible-icons/books/` with SVG fallback
- **Order badge**, category chip, chapter count (expected chapters)
- **Premium Arabic meaning** line per book (`books-premium-meanings.ts`)
- Color accent from `book-symbol-registry`

### Removed
- Non-functional «ترتيب» button

---

## Warnings

- Chapter counts use `BIBLE_EXPECTED_CHAPTERS` keys — may miss if DB book name differs.
- Acts section uses name heuristics (`اعمال` / `أعمال`).

---

## Errors

- None. `npm run build` **PASS**.

---

## Recommendations

- Device QA on tablet for section scroll length.
- Add missing book webp assets for deuterocanonical books if icons 404.

---

## Overall Status

**PASS**

---

## Files Added/Changed

| File | Role |
|------|------|
| `books-premium-tokens.ts` | Palette |
| `books-premium-meanings.ts` | Per-book subtitles |
| `books-premium-sections.ts` | Section grouping |
| `BooksPremiumStyles.tsx` | Pulse/twinkle CSS |
| `BooksPremiumBookCard.tsx` | Cinematic card |
| `BooksPremiumSectionBlock.tsx` | Section header + list |
| `BooksPremiumTestamentTabs.tsx` | Testament switcher |
| `BooksV2Screen.tsx` | Full screen rewrite |
