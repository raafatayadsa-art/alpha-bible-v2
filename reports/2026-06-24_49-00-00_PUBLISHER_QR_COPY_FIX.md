# Publisher QR Sheet Copy Fix

**Date:** 2026-06-24  
**Scope:** Fix non-working copy code / copy link buttons in publisher barcode sheet

---

## Executive Summary

Copy buttons in `PublisherQrSheet` failed silently when `navigator.clipboard` was unavailable (common in WebView / restricted contexts). Added robust clipboard helper with textarea fallback and visible success/error feedback.

---

## Findings

- Previous implementation swallowed all errors with empty `catch`
- No user feedback on success or failure
- Clipboard API alone is insufficient on some mobile / dev HTTP contexts

---

## Fixes

| File | Change |
|------|--------|
| `src/lib/copy-to-clipboard.ts` | New helper: Clipboard API + `execCommand` fallback |
| `PublisherQrSheet.tsx` | Uses helper; shows «تم نسخ الكود/الرابط» or error message; displays URL under QR |

---

## Overall Status

**PASS**
