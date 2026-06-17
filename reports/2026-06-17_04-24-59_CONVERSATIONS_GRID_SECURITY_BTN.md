# Alpha Connect — Conversations Grid + Security Button Light BG

**Date:** 2026-06-17  
**Scope:** Messages conversations list + trust shield button

---

## Executive Summary

Applied **participant-list grid layout** (avatar · name · shield column · trailing) to the Messages conversations tab. Security button now uses **solid light backgrounds** in Secure and Classic themes (no glass transparency).

---

## Changes

### Conversations list
- `AlphaIdentityRow` new `variant="participant-grid"` — mirrors channel subscribers grid
- `TimelineConversationRow` uses participant grid; passes `conversation.role`
- CSS: `.connect-identity-grid-row` with 4th column `auto` for time/unread

### Security button
- **Secure:** solid `oklch(0.36 0.035 265)` + light inset highlight
- **Classic:** solid `var(--classic-sage)` / `var(--set-sage)` in settings

---

## Overall Status

**PASS**
