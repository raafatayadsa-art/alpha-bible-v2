# Synaxarium Like/Share — Verse Card Ledger Fix

## Executive Summary

Corrected Synaxarium like/share controls to use **`HeroSpiritLedgerRow`** (تأمّل · انتشار with Ⲁ/Ⲱ) — the same bottom engagement bar as the verse card — instead of circular overlay buttons.

## Findings

- Verse card engagement DNA lives in **`HeroSpiritLedgerRow`**, not `HeroCardTopBar` circular controls (those are save + share at top).
- Previous implementation wrongly applied `AlphaHeroActionBar` (circular) for like/share.
- **`HeroSpiritLedgerRow`** extended with optional `onBroadcast` so «انتشار» is tappable when share action is needed (Synaxarium); verse card keeps display-only broadcast unless callback passed.
- **`SaintDynamicHeroCard`**: ledger row in content area; counts + liked state via same localStorage pattern as verse card.
- **`synaxarium.$saintId.tsx`**: ledger at bottom of hero image; bookmark save restored in header; share opens drawer via broadcast cell.

## Warnings

- Ledger on Synaxarium home card sits on light cream background (dark glass bar) — intentional contrast; verse card sits on dark photo gradient.
- `handleNativeShare` remains for drawer actions; broadcast cell opens share sheet directly.

## Errors

None. `npm run build` — PASS.

## Recommendations

- If home card ledger feels heavy on light bg, consider a compact variant token — only if design review requests it.

## Overall Status

**PASS**
