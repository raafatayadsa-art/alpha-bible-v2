# KATAMEROS CURVE SOURCE — Preview Implementation Report

**Date:** 2026-06-17  
**Mode:** IMPLEMENTATION PREVIEW ONLY — no cleanup, no commit, no asset deletion  
**Goal:** Compare 3 fixes for PNG medallion arc before permanent change

---

## Executive Summary

Temporary A/B/C preview system for the **confirmed primary curve source** (`katameros-reading-bg.png` medallion arc in `KatamerosScreenBackground`).

**Production behaviour unchanged** unless `?katamerosBg=a|b|c` is present on `/katameros`.

**Preview hub:** `/dev/katameros-curve-preview` — three side-by-side phone mocks for screenshots.

---

## Preview Variants

| Variant | Mechanism | What disappears | Identity impact |
|---------|-----------|-----------------|-----------------|
| **A** | No `<img>` — flat `#f4ead8` | Entire parchment PNG (medallion + letters + texture) | **Loses** lectionary parchment DNA; hero/glass cards only |
| **B** | Extended flat cap + PNG start +72px, `objectPosition: center 14%` | Top medallion arc only | **Strong** — keeps lower parchment & floating letters |
| **C** | Full PNG unchanged + opaque `AlphaHeaderShell` (`#f4ead8/97`) | Arc behind header band only | **Mostly yes** — arc may reappear when scrolling content up |

---

## Visual Comparison Map

```
Dynamic Island
     ↓
┌─────────────────────────────────────────────────────────────
│ CURRENT (production, no query param)
│   Flat cap (#f4ead8) 0 → ~115px
│   PNG starts ~115px → MEDALLION ARC VISIBLE ★
│   Transparent AlphaHeaderShell → arc shows through header
├─────────────────────────────────────────────────────────────
│ VARIANT A — ?katamerosBg=a
│   Flat #f4ead8 full screen — NO PNG
│   Header on plain cream — NO curve, NO parchment
├─────────────────────────────────────────────────────────────
│ VARIANT B — ?katamerosBg=b
│   Extended flat cap 0 → ~187px (115+72)
│   PNG starts ~187px — medallion skipped, letters visible below
│   Header on flat cream — NO arc at top
├─────────────────────────────────────────────────────────────
│ VARIANT C — ?katamerosBg=c
│   Same PNG as production
│   Opaque header band masks arc in header zone only
│   Body below header still full parchment
└─────────────────────────────────────────────────────────────
     ↓
  Hero card (first card) — unchanged in all variants
```

---

## What Disappears / What Is Affected

### Variant A

| Disappears | Unaffected |
|------------|------------|
| Medallion arc | Hero card image |
| Floating Coptic/Latin letters | Reading list glass cards |
| Parchment mottling | Header cross + title |
| Warm texture behind cards | Bottom dock |

**Identity verdict:** Feels like generic Alpha shell — **weakest** Katameros identity.

### Variant B

| Disappears | Unaffected |
|------------|------------|
| Top circular cross medallion arc | Lower parchment texture |
| "Screen inside screen" top frame illusion | Floating letters in body |
| Curve behind transparent header | Hero card, list cards |

**Identity verdict:** **Recommended balance** — lectionary atmosphere without top curve.

### Variant C

| Disappears | Unaffected |
|------------|------------|
| Arc in header viewport only | Full PNG asset (including medallion) |
| PNG bleed through header buttons | Medallion visible when scrolling |

**Identity verdict:** Good static view; **scroll may re-expose arc** above hero.

---

## Files Added / Modified (Preview Only)

| File | Role |
|------|------|
| `src/features/katameros/katameros-curve-preview.ts` | Variant types, labels, crop constant |
| `src/features/katameros/useKatamerosCurvePreview.ts` | Query param hook |
| `src/features/katameros/components/KatamerosPreviewHeaderShell.tsx` | Variant C opaque header |
| `src/features/katameros/components/KatamerosScreenBackground.tsx` | Optional `previewVariant` prop |
| `src/routes/dev.katameros-curve-preview.tsx` | Side-by-side comparison page |
| `src/routes/katameros.index.tsx` | Live preview when `?katamerosBg=` set |

**No PNG files deleted. No permanent default changed.**

---

## How to Test

1. **Screenshot comparison:** open `/dev/katameros-curve-preview`
2. **Live on device:**
   - `/katameros?katamerosBg=a`
   - `/katameros?katamerosBg=b`
   - `/katameros?katamerosBg=c`
3. **Production (unchanged):** `/katameros` (no query param)

---

## Warnings

- Variant B crop (`72px`) is forensic estimate — may need tuning on real device.
- Variant C does not remove medallion from asset — scroll/pull may reveal arc.
- Preview query param is **not persisted** — refresh without param returns to production.

---

## Errors

None during implementation.

---

## Recommendations (for decision only — not applied)

| Rank | Variant | When to choose |
|------|---------|----------------|
| 1 | **B** | Remove curve permanently while keeping parchment identity |
| 2 | **C** | Quick header-only mask if asset crop is risky |
| 3 | **A** | Only if full flat shell is acceptable for Katameros |

---

## Overall Status

**PASS** — Preview ready for visual decision.
