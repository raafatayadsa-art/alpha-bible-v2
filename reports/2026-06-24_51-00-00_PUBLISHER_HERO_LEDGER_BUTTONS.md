# Publisher Hero Ledger Buttons Unification

**Date:** 2026-06-24  
**Scope:** Unify publisher like/share/follow buttons with verse card HeroSpiritLedger DNA

---

## Executive Summary

Replaced circular publisher hero action chips with the approved verse-card ledger system (Ⲁ/Ⲱ cells, glass frame, pulse animations). Follow uses the same meditate-cell shape as verse «تأمّل» with a soft amethyst accent; like and share mirror verse like/broadcast styling.

---

## Findings

- Publisher page used generic `AlphaHeroToggleButton` / `AlphaHeroShareButton` in a light bar — visually disconnected from verse card DNA.
- Verse card engagement uses `HeroSpiritLedgerRow` with Coptic glyphs, counts, and dark glass frame.

---

## Changes

| File | Change |
|------|--------|
| `hero-card-chrome.tsx` | `AlphaHeroPublisherEngagementBar`, label overrides on `HeroSpiritLedgerRow`, `valueHidden` for barcode cell |
| `PublisherPublicPageView.tsx` | Ledger bar: follow (purple Ⲁ) + like/share/QR row |
| `PublisherAlbumDetailView.tsx` | Like/share ledger row parity |

---

## Design Notes

- **Follow:** `#9d7bd8` accent — same cell anatomy as verse meditate, different hue
- **Like:** rose `#e85d7a` with Heart icon
- **Share:** gold `#e7c97a` broadcast cell (Ⲱ)
- **Barcode:** compact third ledger cell without numeric count

---

## Warnings

- Share count on publisher page is display-seeded + local increment (same pattern as verse card broadcasts).

---

## Errors

None.

---

## Overall Status

**PASS**
