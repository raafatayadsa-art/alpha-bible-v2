# Alpha Connect — Call Log Shield Order + Security Button Solid BG

**Date:** 2026-06-17  
**Scope:** Call log row layout + trust shield button background only

---

## Executive Summary

Two targeted fixes: (1) call log rows now show **name on the left, shield immediately after the name**, with call/message buttons unchanged on the right; (2) security button uses **solid background** (no glass transparency) in Secure and Classic themes.

---

## Changes

### 1. Call log — shield after name
- `alpha-identity-layout.css`: `.connect-call-log-row .alpha-identity-name { direction: ltr; }`
- Row layout unchanged: identity left, trailing actions right.

### 2. Security button — solid background
- `AlphaTrustShield.tsx`: removed `glass` class from button.
- `styles.css`:
  - Secure: `background: oklch(0.22 0.032 260)`, `backdrop-filter: none`
  - Classic: restored `--classic-sage` / `--set-sage` solid fills

---

## Warnings

None.

---

## Errors

None.

---

## Overall Status

**PASS**
