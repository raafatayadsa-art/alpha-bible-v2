# Alpha Connect Classic Theme — Full Scope Rollout

**Date:** 2026-06-17  
**Scope:** All Alpha Connect screens/buttons (Classic theme only)  
**Build:** PASS

---

## Executive Summary

Extended the sage-mist palette from settings-only to the entire Alpha Connect Classic theme. All changes are scoped under `.alpha-connect-theme--classic` / `.alpha-connect-theme.alpha-connect-theme--classic` — no other app routes or screens were modified.

---

## Findings

1. **Root tokens** — Replaced beige/gold Classic variables (`#f7f4ec`, `#c9a227`) with sage-mist gradient, forest green accents (`#2d6a4f`), white elevated cards, and sage borders.
2. **Global Connect surfaces** — Header, tabs, glass cards, drawers, popups, mic pulse, channels, QR badges, chat bubbles/composer, new-chat sheet updated.
3. **Dark utility remapping** — Classic-only CSS overrides for hardcoded Secure-era classes (`bg-[#060d1f]`, `border-white/10`, etc.) used inside Connect components.
4. **Embedded message settings** — Added `connect-embedded-panel` wrapper + Classic card overrides for dark glass constants.
5. **Press feedback** — Glass buttons, mode tabs, popup actions, trust shield retain active-state micro-interactions.
6. **Unchanged** — Secure (dark) theme, `/messages` standalone route (no `alpha-connect-theme` frame), Bible/Church/Home and all other screens.

---

## Warnings

- Some Connect TSX still embed dark Tailwind classes; Classic relies on CSS `!important` overrides — prefer semantic `connect-*` classes in future refactors.
- Logo glow remains original neon green (independent of `--neon-green` token).

---

## Errors

None.

---

## Recommendations

1. Device QA: swipe cards, channel dropdowns, call screens in Classic.
2. Optional: migrate hardcoded dark utilities in `alpha-connect.tsx` to theme-aware classes to reduce override surface.

---

## Overall Status

**PASS**

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/alpha/styles.css` | Full Classic token rollout + utility overrides |
| `src/components/alpha/AlphaMessageSettings.tsx` | `connect-embedded-panel` class when embedded |
