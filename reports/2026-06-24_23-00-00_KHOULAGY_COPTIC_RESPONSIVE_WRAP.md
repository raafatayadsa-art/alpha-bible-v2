# Kholagy Coptic Text Responsive Wrap Fix

**Date:** 2026-06-24

---

## Executive Summary

Fixed Coptic text clipping on narrow screens in Khoulagy reading cards. Coptic now wraps and uses full width like Arabic — no horizontal cut-off.

---

## Root Cause

1. Grid forced `minWidth: 720px` — squeezed columns on mobile; parent `overflow-hidden` clipped overflow.
2. Grid cells lacked `min-width: 0` — Coptic lines without spaces could not shrink.
3. Coptic lacked `overflow-wrap: anywhere` — Arabic wraps at word spaces; long Coptic strings did not.

---

## Changes

| File | Change |
|------|--------|
| `kholagy-reading-layout.ts` | Shared responsive grid + column text classes |
| `KholagyReadingCardStyles.tsx` | `.kholagy-text-cop` wrap rules |
| `KholagyVerseRow.tsx` | Responsive stack on mobile, remove fixed minWidth |
| `KholagyLiturgyBlockRow.tsx` | Same |

---

## Behavior

- **Mobile:** languages stack vertically (full width each).
- **sm+:** side-by-side columns with `minmax(0, 1fr)`.
- **Coptic:** breaks long lines within column width.

---

## Warnings

None.

---

## Errors

None — build verified.

---

## Overall Status

**PASS**

---

## COPYABLE REPORT

```
KHOULAGY COPTIC WRAP — 2026-06-24 | PASS
- Removed 720px minWidth clip
- min-w-0 + overflow-wrap:anywhere on Coptic
- Mobile: stacked columns; sm+: multi-column grid
```
