# Shell Top Curved Cap Fix — V3

**Date:** 2026-06-17  
**Scope:** Home / global shell viewport (`/home` and all routes using root `AlphaScreenFrame`)

---

## Executive Summary

The beige curved strip above the home header persisted because the shell used **two competing background layers**: a fixed gradient backdrop (lighter `#f7eed6` at top) and html/body overscroll color (`#ecdcb6` at bottom). That mismatch created a visible lighter “cap” in the safe-area / Dynamic Island zone. V3 removes the fixed backdrop layer, paints a **single flat shell color** (`#f4ead8`) on the viewport root and html/body, and unmounts the global `SearchOverlay` when closed to prevent any ghost top panel.

---

## Findings

1. **Root cause (confirmed):** `.alpha-viewport-backdrop--shell` used `linear-gradient(180deg, #f7eed6 → #f4ead8 → #ecdcb6)` while `html.alpha-viewport-bg-shell body` used `#ecdcb6`. The top stop read as a separate band above headers.
2. **Layering:** Fixed backdrop was a sibling inside `.alpha-viewport-root` — redundant with document overscroll fill and prone to visual seams on iOS safe-area.
3. **SearchOverlay:** Global bible search overlay stayed in DOM when closed (`opacity-0`, `-translate-y-full`) with `rounded-b-3xl` — potential ghost UI at top (white, not beige, but removed as hardening).

---

## Changes Applied

| File | Change |
|------|--------|
| `src/components/alpha/alpha-viewport.css` | Shell/messaging → flat `#f4ead8` on `.alpha-viewport-root--*`; html/body shell color aligned; removed fixed `.alpha-viewport-backdrop` |
| `src/components/alpha/AlphaScreenFrame.tsx` | Apply backdrop class on root; removed fixed backdrop `<div>` |
| `src/components/alpha/alpha-viewport.ts` | Added `backdropToRootClass()` |
| `src/styles.css` | `.alpha-messaging-bg` → flat `#f4ead8` |
| `src/components/overlays/SearchOverlay.tsx` | `return null` when `!open` |

Connect secure/classic gradients unchanged (no top ellipse).

---

## Warnings

- Some individual routes (profile, church, books) still mount local `fixed inset-0` radial gradients. They do not affect `/home` but may show a soft top glow on those screens only.
- Flat `#f4ead8` replaces the subtle vertical gradient on shell — palette preserved, depth slightly reduced (per user request to remove cap, not recolor).

---

## Errors

None. `npm run build` — **PASS**.

---

## Recommendations

1. Hard-refresh on device (`Cmd+Shift+R` / clear cache) after deploy.
2. If any sub-route still shows a top glow, remove that route’s local `radial-gradient(… at 50% 0%)` fixed layer (same pattern as shell fix).
3. Verify on iPhone with Dynamic Island: `/home` should show uniform cream behind status bar and greeting header only.

---

## Overall Status

**PASS**
