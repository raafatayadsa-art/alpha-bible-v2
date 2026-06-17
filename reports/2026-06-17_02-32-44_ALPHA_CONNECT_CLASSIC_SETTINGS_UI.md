# Alpha Connect Classic Settings UI Refresh

**Date:** 2026-06-17  
**Scope:** Classic theme — settings screen only  
**Build:** PASS

---

## Executive Summary

Replaced the disliked beige settings background with a cool sage-mist gradient, elevated white cards with stronger shadows, and tactile press micro-interactions across interactive settings elements.

---

## Findings

1. **Background** — `.connect-settings-screen` now uses `linear-gradient(180deg, #edf3ef → #e3ece7 → #dae5de)` instead of inheriting beige `#f7f4ec` / stone card tones.
2. **Cards** — Settings glass surfaces use white `#ffffff` with layered shadows (`--set-card-shadow`, hover/active variants).
3. **Press feedback** — New `.connect-settings-pressable` class on switches, selects, stats, theme cards, save button, header back, live panel. Section headers use `:has(.connect-settings-section-toggle:active)` for whole-card sink on expand/collapse.
4. **Palette cleanup** — Removed `--set-stone` / `--set-stone-deep` beige tokens; replaced with sage-mist greens and white card surfaces.
5. **Build** — `npm run build` completed successfully.

---

## Warnings

- Main Alpha Connect Classic app frame outside settings still uses ivory/beige accents (`#f7f4ec` header, etc.) — unchanged per scope.
- Secure (dark) theme settings untouched.

---

## Errors

None.

---

## Recommendations

1. User QA on device — verify press feel on iOS Safari ( `:active` timing ).
2. If user wants full app Classic palette aligned with sage-mist, extend gradient to `.alpha-connect-theme--classic` frame separately.

---

## Overall Status

**PASS**

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/alpha/styles.css` | Sage-mist bg, white elevated cards, press CSS |
| `src/components/alpha/AlphaConnectSettings.tsx` | `connect-settings-pressable`, header/card classes, `min-h-[100dvh]` |
