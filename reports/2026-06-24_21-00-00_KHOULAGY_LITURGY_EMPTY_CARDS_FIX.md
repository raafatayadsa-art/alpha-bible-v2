# Kholagy Liturgy Empty Reading Cards Fix

**Date:** 2026-06-24

---

## Executive Summary

Hidden empty liturgy reading cards that showed only role badges or dash placeholders with no actual text. Filtering applied at API parse time and per display mode in the reader.

---

## Findings

- Some parsed liturgy blocks had no Arabic, Coptic, or English content but still rendered as cards with `—` and minimum height.
- Empty blocks also appeared when switching display mode (e.g. Arabic-only mode hiding blocks that only had Coptic text).

---

## Changes

| File | Change |
|------|--------|
| `kholagy-liturgy-parser.ts` | `isLiturgyBlockNonEmpty`, `filterLiturgyBlocks` |
| `kholagy-liturgy-api.ts` | Filter blocks after parse/convert; accurate `blockCount` |
| `kholagy.liturgy_.$liturgyKey.$sectionId.tsx` | Filter sections by current display mode |
| `KholagyLiturgyBlockRow.tsx` | Return `null` if no visible column text |

---

## Warnings

None.

---

## Errors

None — build verified.

---

## Recommendations

If a whole liturgy section has zero blocks after filtering, consider showing a friendly empty state (not implemented — rare edge case).

---

## Overall Status

**PASS**

---

## COPYABLE REPORT

```
LITURGY EMPTY CARDS — 2026-06-24 | PASS
- filterLiturgyBlocks hides blocks with no text
- Reader respects display mode (ar/cop/en columns)
- KholagyLiturgyBlockRow returns null for empty visible columns
```
