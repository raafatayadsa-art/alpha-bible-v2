# Church Directory Home Card — Implementation Report

**Date:** 2026-06-22  
**Task:** Premium home card for interactive church directory at bottom of `/home`

---

## Executive Summary

Added `ChurchDirectoryHomeCard` to the main home screen, placed after the church news section. The card follows the approved Alpha Connect home card DNA (glass ledger, Coptic glyphs, hero chrome) with church-directory brand tokens (purple `#5D3291`, gold `#D4AF37`, beige glass). It links to `/church/directory` and shows a live church count from Supabase facets RPC when available.

---

## Findings

- **New component:** `src/components/home/ChurchDirectoryHomeCard.tsx`
  - Background: `card-church.jpg` with purple/gold gradient overlay
  - Badge: «دليل الكنائس» with Ⲁ Ⲱ glyphs
  - Title: «دليل الكنائس التفاعلي»
  - Subtitle: smart map + search + dynamic count
  - Bottom ledger: كنائس (count) | خريطة (interactive)
  - CTA pill: «استكشف»
- **Home integration:** `src/routes/home.tsx` — new section after «أخبار كنيستك»
- **Data:** `fetchChurchDirectoryFacets()` via React Query, 15 min stale time; fallback `1,241`
- **Navigation:** `useNavigate` to `/church/directory` (SPA, no full reload)
- **Build:** `npm run build` — **PASS**

---

## Warnings

- Facets RPC failure silently falls back to static count `1,241`.
- Card uses same height family as Alpha Connect card (~156px) — may need spacing tweak on very small screens after manual QA.

---

## Errors

None.

---

## Recommendations

1. Manual QA on device: tap card, ledger cells, and «استكشف» — all should open directory.
2. Optional: add section header «دليل الكنائس» above card to match other home sections.
3. Optional: prefetch directory facets on home mount for faster count display.

---

## Overall Status

**PASS**
