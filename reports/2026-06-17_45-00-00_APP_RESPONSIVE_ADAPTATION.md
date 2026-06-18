# App Responsive Adaptation

**Date:** 2026-06-17  
**Scope:** Global viewport / content column scaling (phone → tablet → desktop)

---

## Executive Summary

Enhanced the existing Alpha responsive system so all primary screens scale fluidly to any viewport (phone, tablet, iPad, web) without horizontal overflow or breaking header button slots. Content columns now clamp to `100vw − padding` at every breakpoint tier.

---

## Findings

1. **Foundation existed** (`alpha-responsive.css`) but max-widths were fixed pixel caps without viewport clamping — risk of bleed on narrow devices and mismatch on tablet/desktop.
2. **Several overlays/sheets** used hardcoded `460px` / `480px` / `520px` instead of shared CSS variables.
3. **Viewport shell** lacked `min-width: 0` / `overflow-x: clip` guards on scroll containers.

---

## Changes

| Area | Change |
|------|--------|
| `alpha-responsive.css` | Fluid `min(calc(100vw − padding), cap)` for all column tokens; `.alpha-app-shell`, `.alpha-toolbar-row`, `.alpha-overlay-panel`, `.alpha-dock-bar` utilities |
| `alpha-viewport.css` | Full-width stage; phone column `min-width: 0`; lock mode `max-width: 100vw` |
| `AlphaScreenFrame.tsx` | `w-full min-w-0` + `alpha-app-shell` on scroll owner |
| `alpha-responsive.ts` | `readingWidthStyle` returns `width: 100%` |
| `styles.css` | Global `html/body` overflow-x clip |
| Overlays & sheets | Search, notifications, dictionary sheets → `var(--alpha-content-max-width)` |
| `search.tsx`, agpeya routes | Hardcoded widths → CSS variables |
| `$book.$chapter.tsx` | Header uses `.alpha-toolbar-row` pattern (buttons preserved) |

---

## Breakpoint Behavior

| Viewport | Content max (cap) |
|----------|-------------------|
| Phone | 440px (fluid below) |
| 600px+ | 520px |
| 768px+ | 680px |
| 1024px+ | 760px |
| 1367px+ | 880px |

Padding scales with `clamp(12px, 2.5vw, 24px)`.

---

## Warnings

- Alpha Connect / messages routes render outside `AlphaScreenFrame` — they keep their own layout (unchanged).
- Some church/platform modals still use `400px` caps by design for compact dialogs.

---

## Errors

None — `npm run build` PASS.

---

## Overall Status

**PASS**
