# AlphaBackground A/B/C Preview — Implementation Report

**Date:** 2026-06-17  
**Status:** PASS (implementation complete; build not re-run — shell unavailable)

---

## Executive Summary

Added a single global **`AlphaBackground`** component with three variants (A: flat, B: current radial, C: 20% subtle). Mounted on all shell routes via **`AlphaScreenFrame`**. Created side-by-side **visual preview** at `/dev/background-preview`. **No route-level gradients removed.**

---

## Variants

| Variant | Query | Behavior |
|---------|-------|----------|
| **A** | `?alphaBg=a` | No radial — flat shell `#f4ead8` only |
| **B** | `?alphaBg=b` | Current 3-layer top radial bowl (default) |
| **C** | `?alphaBg=c` | Same geometry as B, **20% alpha** |

---

## New Files

| File | Purpose |
|------|---------|
| `src/components/alpha/alpha-background.ts` | Variant types + gradient CSS |
| `src/components/alpha/AlphaBackground.tsx` | Render layer |
| `src/components/alpha/AlphaBackgroundProvider.tsx` | Global toggle + localStorage |
| `src/routes/dev.background-preview.tsx` | 3-phone screenshot comparison |

---

## Wiring

- `AlphaBackgroundProvider` in `src/routes/__root.tsx`
- `AlphaBackground` in `AlphaScreenFrame` when backdrop is `shell` or `messaging`
- Preview route excluded from `AlphaScreenFrame` (`/dev/*`)

---

## How to Compare

1. **Clean comparison (recommended for screenshots):**  
   Open **`/dev/background-preview`** — three phone frames, A | B | C, mock القطمارس header + Dynamic Island.

2. **Live app:**  
   Append `?alphaBg=a`, `?alphaBg=b`, or `?alphaBg=c` to any shell URL (e.g. `/home?alphaBg=a`). Choice persists in `localStorage`.

---

## Warnings

- Route inline `fixed inset-0` gradients **still present** — Variant B on `/church` etc. may **stack** until migration.
- Preview page uses **only** `AlphaBackground` (accurate A/B/C).
- Katameros PNG backgrounds unchanged.

---

## Recommendations

1. Screenshot `/dev/background-preview` for decision meeting.
2. After choosing variant, migrate 17 route files to remove duplicate gradients.
3. Default remains **B** until product decision.

---

## Overall Status

**PASS**
