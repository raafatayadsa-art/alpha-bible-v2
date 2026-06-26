# Profile People Cards — Ledger Title & Dark Glow

## Executive Summary

Centered family/contacts titles using verse-card like-button DNA (`HeroSpiritLedgerCell`), removed chevron toggle, circle-only expand, and replaced plain cream background with rich dark atmospheric card art.

## Findings

### Layout
- Vertical centered stack: **orbit circle** → **ledger title bar** → optional scroll list.
- **Only the circle** toggles open/close — chevron removed.

### Title bar (like verse «تأمّل»)
- Reuses **`HeroSpiritLedgerCell`** inside dark ledger frame (`rgba(0,0,0,0.32)` + blur).
- **Ⲁ** for family, **Ⲱ** for contacts — golden shimmer glyphs on dark ground.
- Centered label + count + sublabel.

### Background
- Deep gradient `#1a1228 → #2a1f45 → #2d2018`.
- Accent radial glows, subtle diagonal texture, watermark glyph, gold inset frame.

## Warnings

None.

## Errors

None. `npm run build` — PASS.

## Recommendations

None.

## Overall Status

**PASS**
