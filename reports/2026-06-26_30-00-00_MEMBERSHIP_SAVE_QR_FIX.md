# Membership Save QR Button Fix

**Date:** 2026-06-26

---

## Executive Summary

Replaced `window.print()` on membership screen with PNG download/share of the QR code only.

---

## Changes

- New: `src/features/identity/save-alpha-qr-image.ts`
  - Generates 512px PNG via `qrcode.toDataURL`
  - iOS/mobile: `navigator.share({ files })` when supported
  - Desktop fallback: `<a download>`
- Updated: `profile.membership.tsx`
  - Button label: **حفظ QR** / **تم الحفظ**
  - Removed full-page print behavior

---

## Overall Status

**PASS**
