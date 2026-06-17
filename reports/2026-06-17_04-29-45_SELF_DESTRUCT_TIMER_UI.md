# Alpha Connect — Self-Destruct Timer UI Alignment

**Date:** 2026-06-17  
**Scope:** Embedded messages chat — timer button + full-width picker sheet

---

## Executive Summary

Applied the conversation settings menu row DNA to the self-destruct (disappearing messages) timer button in embedded Alpha Connect chat, and expanded the timer picker to full screen width. Build passes.

---

## Findings

1. **Timer button (embedded mode)** — Replaced the red pill style with the same rounded rectangle pattern used in chat settings rows:
   - `rounded-[14px]`, `border-white/12`, `bg-white/6`
   - Gold `Clock3` icon inside `ALPHA_SETTINGS_ICON_BOX`
   - Class: `connect-chat-timer-btn`

2. **Timer picker sheet (embedded mode)** — When opened from messages:
   - Full-width bottom sheet: `inset-x-0`, `w-full`, `max-w-[430px]`
   - `glass-strong`, `rounded-t-3xl`, dark overlay backdrop
   - Neon-green title «مؤقت الاختفاء» and «تم» confirm action
   - Picker wheel uses embedded dark-theme gradients and highlight colors

3. **Classic theme CSS** — Added overrides in `styles.css` for timer button and sheet card background/border.

4. **Build** — `npm run build` completed successfully (exit 0).

---

## Warnings

- Standalone (non-embedded) chat still uses the legacy red pill timer button; only embedded Alpha Connect messages were updated per request.
- Chat settings menu modal remains narrow (`max-w-[300px]`); only the timer sheet was made full width.

---

## Errors

None.

---

## Recommendations

1. Manually verify on device: tap timer in embedded chat → sheet spans full width and matches settings row styling.
2. If desired, apply the same full-width pattern to «إعدادات المحادثة» menu in a follow-up.

---

## Overall Status

**PASS**

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/alpha/AlphaChatScreen.tsx` | Timer button + `TimerGlassPicker` embedded variant |
| `src/components/alpha/styles.css` | Classic theme for `.connect-chat-timer-btn` / sheet |
