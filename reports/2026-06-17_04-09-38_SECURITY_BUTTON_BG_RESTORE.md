# Alpha Connect — Security Button Background Restore

**Date:** 2026-06-17  
**Scope:** Trust shield / security button in Secure + Classic themes

---

## Executive Summary

Restored the security button background to the original **glass** styling in both dark (Secure) and light (Classic) modes by removing theme overrides that forced a solid sage fill.

---

## Findings

- `AlphaTrustShieldButton` uses `connect-trust-shield-btn glass` with neon border/glow (unchanged).
- Classic theme CSS had added `!important` rules setting `background: var(--classic-sage)` / `var(--set-sage)`, replacing the glass surface in settings and main Connect screens.

---

## Changes

**Removed from `styles.css`:**
- `.alpha-connect-theme--classic .connect-settings-screen .connect-trust-shield-btn`
- `.alpha-connect-theme--classic .connect-trust-shield-btn`
- `.alpha-connect-theme--classic .connect-trust-shield-btn:active`

Button now inherits:
- **Secure:** gradient glass + blur (`--gradient-glass`)
- **Classic:** elevated card glass (`--classic-card`) via `.glass`

---

## Warnings

None.

---

## Errors

None.

---

## Recommendations

Quick visual check on header security button in both themes.

---

## Overall Status

**PASS**
