# Journey Discover — Ledger-Style CTA Button

**Date:** 2026-06-17  
**Scope:** Match small CTA inside "اكتشف رحلتك" cards to Ⲁ meditate ledger cell from verse hero card.

---

## Executive Summary

Replaced the rounded "ادخل الرحلة" pill in journey discover cards with a shared `HeroCompactGlyphCell` component that mirrors the Ⲁ ledger button styling from the verse hero card (gold glyph, two-row label · sublabel, gradient border, press animation).

---

## Findings

- **New export:** `HeroCompactGlyphCell` in `src/components/home/hero-card-chrome.tsx` — decorative ledger-shaped cell for non-interactive reuse inside parent links.
- **Styles host:** `HeroLedgerStylesHost` exported so journey section loads pulse/glyph CSS once (not per card).
- **HomeJourneyDiscover:** Bottom CTA now shows glyph + `ادخل · {badge}` (e.g. الكتاب، أجبية) aligned right; removed duplicate top-left glyph and old pill/chevron footer.
- **Interaction:** Parent `Link` retains `group` + `active:scale`; cell uses `group-active:hero-ledger-meditate-press` for one-shot press feel matching Ⲁ.
- **Build:** `npm run build` — PASS.

---

## Warnings

- Cell is decorative (`aria-hidden`); navigation remains on the card `Link` — same pattern as before (whole card clickable).
- `HeroLedgerStylesHost` must stay mounted once per section that uses ledger CSS classes.

---

## Errors

None.

---

## Recommendations

- If journey cards later need a live counter (like meditate count), extend `HeroCompactGlyphCell` with optional `count` prop matching `HeroSpiritLedgerCell` row layout.
- Consider using Ⲱ variant styling for broadcast-themed journey items if desired (currently uses per-item glyph from data).

---

## Overall Status

**PASS**
