# Alpha Connect — Chat Notices, QR, Typography, Buttons

**Date:** 2026-06-17  
**Scope:** Alpha Connect only  
**Build:** PASS

---

## Executive Summary

Updated chat warning banners, composer button colors, flat QR on profile/channel cards, create-channel sheet sizing, and global +2px typography across Alpha Connect.

---

## Findings

1. **Privacy notice (top)** — Compact `fit-content` pill; white/dark-green (Classic) or neon (Secure); text fits on one line.
2. **Timer notice (bottom)** — Amber warning tone (Classic) / gold tint (Secure) for auto-delete message.
3. **Composer buttons** — Send & attach use dark green gradient `#1B4332 → #2D6A4F` with white icon.
4. **QR badge** — New `flat` variant: forest QR on transparent/white, no black box or frame; larger on profile card (56px) and channel header (52px).
5. **Create channel sheet** — Fonts +2px, icons 48px rings / 24px glyphs, dark green submit button.
6. **Global typography** — `.alpha-connect-theme` bumps common `text-[Npx]` sizes by +2px.

---

## Warnings

- Global font bump uses `!important` on pixel text classes inside Connect frame only.

---

## Errors

None.

---

## Overall Status

**PASS**
