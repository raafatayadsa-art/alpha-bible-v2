# Home Avatar Menu, Shield Card & Home Text Colors

**Date:** 2026-06-27  
**Scope:** Avatar dropdown styling, VerificationCard color restore, home screen text palette

---

## Executive Summary

Applied three targeted UI polish changes per user request: golden luminous avatar menu labels/icons on a dark glass panel, restored pre-burgundy VerificationCard (shield) text colors, and replaced home-screen burgundy heading tokens with warm brown/gold tones.

---

## Findings

### 1. Avatar menu (`ProfileSettingsMenu.tsx`)
- Menu labels now use gold `#f0d78c` with subtle shadow for readability.
- Icons use bright accent colors with glow drop-shadows:
  - الملف الشخصي — gold `#ffe9a8`
  - تعديل الملف — blue `#9fd0ff`
  - الإعدادات — green `#8ef0b8`
- Dropdown background switched to dark glass (`#2a1f12` / `#1a1208` mix) so gold text contrasts on ivory home header.

### 2. Shield card (`AlphaShield.tsx` — `VerificationCard`)
- Restored legacy hex colors from backup commit `b2a75cf`:
  - Titles: `#1F2937`
  - Muted/labels: `#6B7280`
  - Values: `#374151`
  - Close button: `#6B7280`
  - Trust block unchanged green `#14532D`
- Role label kept as gold `#b8893a` (was `text-alpha-gold-deep`).

### 3. Home screen text (`alpha-polish-tokens.css`)
- Scoped CSS variable override on `.alpha-home-screen`:
  - Light: heading `#3a2a18`, muted `#7a6548` (replaces burgundy `#5a1f2a` / `#7a3944`)
  - Dark: unchanged warm cream tokens
- Affects greeting, section titles, journey discover, mini-player, and all `text-alpha-heading*` within home.

---

## Warnings

- Avatar menu uses dark panel in both light and dark themes for gold contrast; settings trigger (gear icon elsewhere) unchanged.
- Home color override is scoped to `.alpha-home-screen` only; other screens still use global burgundy heading tokens.

---

## Errors

None. Build: **PASS** (`npm run build`).

---

## Recommendations

1. User QA on home in light mode — confirm brown/gold headings feel right against ivory background.
2. If burgundy is disliked globally, consider promoting home palette to `--alpha-text-heading` in light theme (broader change).
3. Test avatar menu on profile/settings screens where `tone="dark"` may apply.

---

## Overall Status

**PASS**
