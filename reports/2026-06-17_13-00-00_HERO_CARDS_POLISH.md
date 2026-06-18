# Hero Cards Polish + Alpha Button Pulse

**Date:** 2026-06-17  
**Scope:** Peek daily cards redesign, verse font, progress rail, Alpha dock button feedback

---

## Executive Summary

Redesigned the three hero peek cards (readings, saint, feast) to match the verse card DNA with professional labels, share/save top bar, and Ⲁ/Ⲱ spirit ledger. Increased verse card text size. Replaced dot indicators with a segmented progress rail below the stack. Added subtle golden glow and press pulse on the center Alpha (Bible) dock button.

---

## Findings

### Daily hero cards (`HeroDailyCard.tsx`)
- Full card chrome: accent border, gradient overlay, inset glow
- Top bar: share | badge | save (same pattern as verse card)
- Title 17px + subtitle 12px on front; compact badge-only on peek
- Ⲁ تأمّل / Ⲱ انتشار ledger with per-card localStorage engagement
- Save tracked in `alpha.hero.saved-cards`
- Share wired to branded share sheet via `onBrandedShare`

### Shared chrome (`hero-card-chrome.tsx`)
- `HeroCardTopBar`, `HeroSpiritLedgerRow`, `HeroProgressRail`
- `HERO_STACK_LABELS`: آية اليوم · القطمارس · قديس اليوم · مناسبة

### Verse card (`PremiumVerseHeroCard.tsx`)
- Body text: 15px → **17.5px** (front), 12px → **13px** (peek)
- Reference: 10.5px → **11px**
- Refactored to shared top bar + ledger components

### Progress rail (`HomeVerseHeroStack.tsx`)
- Golden gradient fill track (3px) showing overall progress
- Four labeled segments below; tap to jump to card
- Removed overlapping dots inside card stack area

### Alpha dock button (`BottomDock.tsx`)
- Resting glow slightly stronger (gold emphasis)
- On press: radial golden halo + `alphaDockRaisedPulse` animation (520ms)

---

## Warnings

- Daily card save is local-only (not synced to Supabase saved verses)
- Peek cards remain non-interactive (pointer-events-none on stack slots)

---

## Errors

None. Build passes.

---

## Recommendations

1. Device QA: swipe through all 4 cards and verify ledger/share/save on daily front cards
2. Consider fetching live readings/saint/feast titles from API for card body text

---

## Overall Status

**PASS**
