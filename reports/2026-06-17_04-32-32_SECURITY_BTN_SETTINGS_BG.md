# Alpha Connect — Security Button Background Alignment

**Date:** 2026-06-17  
**Scope:** Trust shield (security) button — match chat settings row background in dark + light themes

---

## Executive Summary

Updated the Alpha Trust Shield button to use the same visual DNA as in-chat conversation settings menu rows (`border-white/12`, `bg-white/6`, backdrop blur) in Secure (dark) mode, and matching sage card surface in Classic (light) mode.

---

## Findings

1. **Component** — `AlphaTrustShieldButton` now uses `rounded-[14px] border border-white/12 bg-white/6 backdrop-blur-sm` (same as settings menu rows).

2. **Secure / dark theme** — CSS override replaced solid oklch fill with `rgba(255,255,255,0.06)` background and `rgba(255,255,255,0.12)` border; removed green glow box-shadow.

3. **Classic / light theme** — Button uses `var(--classic-sage)` + `var(--classic-border-soft)` with standard classic shadow tokens.

4. **Settings screen (Classic)** — Trust shield in settings header aligned to `--set-sage` / `--set-border-soft` (same palette as chat settings cards).

5. **Chat settings rows (Classic)** — Added CSS so menu row buttons inside `glass-strong` panels also map to classic-sage, keeping rows and security button visually consistent.

---

## Warnings

- Standalone `/messages` route does not host the trust shield; change applies to Alpha Connect surfaces only.

---

## Errors

None.

---

## Recommendations

- Visual QA: toggle Secure ↔ Classic in settings, open chat header security button and «إعدادات المحادثة» menu — surfaces should match.

---

## Overall Status

**PASS**

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/alpha/AlphaTrustShield.tsx` | Row-matching Tailwind classes on button |
| `src/components/alpha/styles.css` | Dark + classic theme overrides for button and settings rows |
