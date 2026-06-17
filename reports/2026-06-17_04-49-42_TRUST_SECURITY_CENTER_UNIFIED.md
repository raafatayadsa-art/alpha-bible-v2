# Alpha Connect — Trust & Security Center Unified Fix

**Date:** 2026-06-17  
**Scope:** All مركز الثقة والأمان panels across Alpha Connect (dark + light)

---

## Executive Summary

Rebuilt Trust Center as a **professional information modal** with spec-compliant opaque backgrounds, full-screen dim overlays, high-contrast typography (#FFFFFF / #111827), logo isolated in a footer brand strip (no text overlap, no glow), unified naming **مركز الثقة والأمان**, and shared `AlphaTrustShieldSheet` on call routes.

---

## Findings

### Background (per spec)
| Theme | Panel | Blur |
|-------|-------|------|
| Dark | `rgba(10,15,25,0.95)` | 30px |
| Light | `rgba(255,255,255,0.96)` | 30px |

Content wrapper uses 98% opaque fill so scroll text never crosses the logo.

### Overlay (per spec)
| Theme | Scrim |
|-------|-------|
| Dark | `rgba(0,0,0,0.55)` |
| Light | `rgba(0,0,0,0.18)` |

No scrim blur — background distraction fully masked.

### Logo
- Moved from center watermark to **footer brand zone** (44px, opacity 16–20%, `filter: none`)
- Text scrolls only in body area above brand strip

### Typography
- All trust-center text classes: `#FFFFFF` (dark) / `#111827` (light)
- Removed neon-green titles, gray labels, and header icon glow

### Naming
- All 11 context titles updated: `مركز الثقة والأمان …`
- Exported `TRUST_CENTER_TITLE_PREFIX` constant

### Unified shield entry points
- `AlphaTrustShield` (alpha-connect: channels, messages, calls tab, settings)
- `/call` and `/personal-call` now use `AlphaTrustShieldSheet` with `context: { type: "call" }`

---

## Warnings

- Non-trust `ConnectTopAnchorSheet` instances (e.g. call menu) keep default glass styling.

---

## Errors

None.

---

## Recommendations

- QA: open trust center over busy chat UI in both themes; confirm scrim hides background and all rows are readable.

---

## Overall Status

**PASS**

---

## Files Changed

| File | Change |
|------|--------|
| `ConnectTopAnchorSheet.tsx` | Opaque layout, footer logo, spec overlay |
| `styles.css` | Full trust-center design tokens |
| `AlphaTrustShield.tsx` | Contrast classes, no icon glow |
| `alpha-trust-shield-content.ts` | Renamed titles + prefix constant |
| `call.tsx`, `personal-call.tsx` | Unified AlphaTrustShieldSheet |
