# Alpha Connect Home Card — Premium Hero DNA

**Date:** 2026-06-17  
**Scope:** Redesign `AlphaConnectHomeCard` on `/home` to match verse hero premium styling.

---

## Executive Summary

Alpha Connect home gateway now uses the same dark image-forward card, ✦ badge emblem, and Ⲁ/Ⲱ spirit ledger row as the verse hero card.

---

## Findings

- **Layout:** 248px dark premium card, gold rim, control-center bg + cinematic gradient.
- **Top:** `HeroBadgeEmblem` — ✦ ألفا كونكت ✦ with live green dot when activity exists.
- **Watermark:** `AlphaConnectLogo` (animated when active) at low opacity.
- **Bottom ledger:**
  - Ⲁ رسائل · جديد — unread count
  - Ⲱ قنوات/مكالمات · نشطة/فائتة — dynamic based on missed calls
- **Removed:** Light glass card, Sparkles, framer-motion, separate activity pills.
- **Data:** Unchanged `useAlphaConnectHomeActivity` hook.
- Build: PASS.

---

## Warnings

None.

---

## Errors

None (fixed `HeroLedgerStyles` → `HeroLedgerStylesHost` export).

---

## Recommendations

None.

---

## Overall Status

**PASS**
