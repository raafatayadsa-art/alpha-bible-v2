# Alpha Connect — UI Alignment, Mic & Toggles Fix

**Date:** 2026-06-17  
**Scope:** Alpha Connect Classic theme

---

## Executive Summary

Applied screenshot-driven fixes across messages list, call history, profile card, participants drawer, bottom dock, channel mic, and toggle switches. Build **PASS**.

---

## Findings

| Screen | Fix |
|--------|-----|
| Messages list (img 1) | Names aligned right, RTL row with avatar right |
| Call history (img 2) | Names aligned left (LTR) |
| Profile card (img 3) | RTL layout, name block right |
| Participants drawer (img 4) | Names + shield aligned right (`items-end`) |
| Bottom dock (img 5) | All icons uniform dark green (no neon active) |
| Channel mic (img 6) | Dark green icon + pulse; pressed = full dark green fill, white icon |
| Toggles (img 7) | Unified `connect-settings-switch` styling in channel settings + global classic rules; message settings GlassSwitch alpha colors updated |

---

## Warnings

- Call history intentionally uses **left** alignment (LTR) per user request — differs from messages list.
- Mic pressed state uses `ptt.isHolding` in addition to recording for immediate visual feedback.

---

## Errors

None.

---

## Recommendations

- Visual QA on device for all 7 screens in Classic theme.
- Confirm call history LTR layout matches user expectation on wide screens.

---

## Overall Status

**PASS**
