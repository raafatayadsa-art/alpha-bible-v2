# Alpha Connect — Classic Mic Dark Green Accent

**Date:** 2026-06-17  
**Scope:** Change Classic (light) mic green from neon to dark forest green.

---

## Executive Summary

Mic button accent in **Classic** theme now uses **dark forest green** (`#1b4332` / `#2d6a4f`) for icon, label, pulse rings, decorative rings, and ring shadow. Light inner face unchanged. Press state uses dark green fill with white icon.

---

## Findings

1. Replaced oklch neon green on `.connect-mic-face`, pulse `:has(.connect-mic-face)`, and `.connect-mic-label` with `--classic-forest-deep` / rgba forest tones.
2. Added `--mic-ring-*` CSS variables on `.connect-mic-stage` — Classic uses forest rgba; Secure keeps neon oklch.
3. VoiceControl + ConnectCircleButton decorative rings use `connect-mic-deco-*` classes for theme-aware colors.
4. Classic `connect-mic-transmitting`: dark green gradient fill, white icon text.

---

## Warnings

Secure (dark) mic unchanged — still neon green.

---

## Errors

None. Build PASS.

---

## Overall Status

**PASS**
