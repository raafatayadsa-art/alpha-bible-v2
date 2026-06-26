# Kholagy Side-by-Side Columns on Mobile

**Date:** 2026-06-24

---

## Executive Summary

Coptic text now stays **beside** Arabic (and English when shown) at all screen sizes. Removed mobile vertical stacking; columns shrink equally with text wrap preserved.

---

## Changes

- Grid always uses `repeat(n, minmax(0, 1fr))` — ar + cop never stack.
- Slightly smaller font/padding on narrow screens for fit.
- Kept `overflow-wrap: anywhere` on Coptic for in-column wrapping.

---

## Overall Status

**PASS**

---

## COPYABLE REPORT

```
KHOULAGY COPTIC SIDE-BY-SIDE — 2026-06-24 | PASS
- Arabic + Coptic always adjacent on all widths
- minmax(0,1fr) + wrap adapts to narrow space
```
