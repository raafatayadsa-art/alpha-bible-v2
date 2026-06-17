# Alpha Connect — Classic Mic Unified With Secure Format

**Date:** 2026-06-17  
**Scope:** Light (Classic) mic button matches Secure layout and neon pulse; inner circle uses light face only.

---

## Executive Summary

Classic mic buttons now share the **same structure** as Secure: decorative oklch rings, `neon-ring`, neon green icon, and identical pulse animation colors. The **only difference** is the inner circle background in Classic — a light white-to-sage gradient (`--gradient-mic-face`) instead of the dark radial gradient.

---

## Findings

1. **VoiceControl (channel PTT):** Removed theme branch; single Secure-style markup with `connect-mic-face` class on inner button.
2. **VoiceMessageRecorder:** Uses unified `ConnectCircleButton` without `iconAccent`.
3. **ConnectCircleButton:** Removed `iconAccent` prop; green tone uses `connect-mic-face` + nested pulse structure matching channel PTT.
4. **styles.css:**
   - Removed old `connect-ptt-icon-accent` Classic block (dark green icon / forest pulse).
   - Added `--gradient-mic-face` and `.connect-mic-face` Classic rules (light inner bg, neon ring shadow).
   - Classic mic pulse scoped with `:has(.connect-mic-face)` — same oklch neon as Secure.
   - Removed Classic override that muted `connect-mic-transmitting` to sage; press state matches Secure glow.
   - Non-mic `.neon-ring` in Classic still uses forest sage shadow.

---

## Warnings

- `:has(.connect-mic-face)` requires modern browsers (already used elsewhere in project).
- Inline `background: var(--gradient-mic)` on mic face is overridden in Classic via `!important` on `--gradient-mic-face`.

---

## Errors

None. `npm run build` — PASS.

---

## Recommendations

1. Visual check: Classic channel PTT + voice recorder — neon pulse, light inner circle, dark radial on press.
2. Visual check: Secure unchanged — dark inner gradient, same pulse.

---

## Overall Status

**PASS**

---

## Files Changed

| File | Change |
|------|--------|
| `src/routes/alpha-connect.tsx` | Unified mic markup |
| `src/components/alpha/ConnectCircleButton.tsx` | `connect-mic-face`, removed iconAccent |
| `src/components/alpha/styles.css` | Classic mic face + neon pulse |
