# TOP LAYER VISUAL DEBUG — Red Border Forensics

**Date:** 2026-06-17  
**Mode:** Temporary debug borders — no design changes, no cleanup, no deletions  
**Goal:** Visually identify which DOM layer draws the top area of the screen

---

## Executive Summary

A query-param debug system was added. Append `?alphaTopDebug=N` (N = 1..8) to any shell route URL. **Exactly one layer** receives `border: 5px solid red` at a time. A floating red badge at the bottom shows the active target name.

**Start here:** `/katameros?alphaTopDebug=1`

---

## Findings

| N | Target | DOM location | Notes |
|---|--------|--------------|-------|
| 1 | **AlphaScreenFrame** | `div.alpha-screen-frame.alpha-viewport-root` | Full viewport frame |
| 2 | **alpha-viewport-root** | Same node as #1 | Same red box; label differs |
| 3 | **alpha-viewport-stage** | `div.alpha-viewport-stage` | Phone column inside frame |
| 4 | **AlphaHeaderShell** | `AlphaHeaderShell` wrapper div | Includes safe-area top padding |
| 5 | **AlphaHeader** | `<header>` inside shell | Toolbar row only (no safe-area pad) |
| 6 | **Fixed Background Layer** | `[data-alpha-background]` fixed | `AlphaBackground` global shell |
| 7 | **PNG Background Layer** | `[data-alpha-png-bg]` | `KatamerosScreenBackground` (Katameros only) |
| 8 | **Safe Area Container** | Fixed band at top | Height = `max(env(safe-area-inset-top), 14px)` |

### Files touched (debug only)

- `src/components/alpha/alpha-top-debug.ts` — parser + hook
- `src/components/alpha/AlphaTopDebugLabel.tsx` — on-screen badge
- `src/components/alpha/AlphaTopDebugSafeArea.tsx` — target 8 overlay
- `src/components/alpha/AlphaScreenFrame.tsx` — targets 1–3
- `src/components/navigation/AlphaHeader.tsx` — targets 4–5
- `src/components/alpha/AlphaBackground.tsx` — target 6
- `src/features/katameros/components/KatamerosScreenBackground.tsx` — target 7
- `src/routes/__root.tsx` — mounts label + safe-area overlay

### Usage

```
/katameros?alphaTopDebug=1   → AlphaScreenFrame
/katameros?alphaTopDebug=2   → alpha-viewport-root
/katameros?alphaTopDebug=3   → alpha-viewport-stage
/katameros?alphaTopDebug=4   → AlphaHeaderShell
/katameros?alphaTopDebug=5   → AlphaHeader
/katameros?alphaTopDebug=6   → Fixed Background Layer
/katameros?alphaTopDebug=7   → PNG Background Layer
/katameros?alphaTopDebug=8   → Safe Area Container
```

Aliases also work: `?alphaTopDebug=png-background`, `?alphaTopDebug=header-shell`, etc.

Without the query param, **no borders appear** — zero visual change to production.

---

## Warnings

- Targets **1** and **2** border the **same DOM node** — expect identical outlines; use the badge label to distinguish.
- Target **7** only appears on routes with `KatamerosScreenBackground` (e.g. `/katameros`).
- Target **8** is a synthetic overlay for the safe-area band, not an existing named component.
- Debug borders use inline `style` only when param is set — remove param to disable.

---

## Errors

None during implementation.

---

## Recommendations

1. Open `/katameros?alphaTopDebug=7` first if investigating the top curve — prior forensic analysis points to the PNG layer.
2. Compare #4 vs #5 to see whether safe-area padding (shell) vs header row owns the top gap.
3. When finished, remove `alphaTopDebug` from URL; no cleanup commit required until you ask.

---

## Overall Status

**PASS** — Visual debug harness ready; one active border per URL value.
