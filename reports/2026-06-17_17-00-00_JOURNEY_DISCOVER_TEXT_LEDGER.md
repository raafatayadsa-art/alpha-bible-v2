# Journey Discover — Text-Only Ledger Chips

**Date:** 2026-06-17  
**Scope:** Remove Coptic glyphs and Sparkles icon from journey discover cards; use verse-card ledger background for text-only chips.

---

## Executive Summary

Journey discover cards now use `HeroCompactLedgerCell` — same gradient border/background as the Ⲁ meditate button in the verse hero card, but text only (no Coptic letter, no icon).

---

## Findings

- **Renamed/replaced:** `HeroCompactGlyphCell` → `HeroCompactLedgerCell` in `hero-card-chrome.tsx`.
- **Top chip:** Badge word only (e.g. الكتاب، أجبية) — Sparkles icon removed; ledger pill styling applied.
- **Bottom chip:** `ادخل · {badge}` — no Coptic glyph row.
- **Data:** Removed `glyph` from `JourneyDiscoverItem` and all `primary` entries in `home.tsx`.
- **Build:** `npm run build` — PASS.

---

## Warnings

None.

---

## Errors

None.

---

## Recommendations

None required.

---

## Overall Status

**PASS**
