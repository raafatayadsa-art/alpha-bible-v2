# Khoulagy — Move Glow/Spacing to Reading Screen

**Date:** 2026-06-24  
**Status:** Applied + Deployed

---

## Executive Summary

User requested reverting visual polish on the **outer Khoulagy index grid** and applying it to the **inner reading screen** (text rows). Index cards restored to clean premium default; reading verse cards now have Bible-style glow, tighter vertical spacing, and touch/desktop feedback.

---

## Findings

### Reverted — `src/routes/kholagy.index.tsx`

- Removed `kholagyCardGlow` animation and glow overlays on grid cards.
- Restored standard card shadow + `gap-2` grid.
- Simple `active:scale-[0.98]` only (no pulse).

### Applied — reading screen

| File | Change |
|------|--------|
| `src/features/kholagy/components/KholagyReadingCardStyles.tsx` | **New** — pulse glow CSS for `.kholagy-verse-card`, tight `.kholagy-reader-sections` gap |
| `src/features/kholagy/components/KholagyVerseRow.tsx` | Verse text blocks wrapped with glow ring, top gradient line, reduced inner padding |
| `src/routes/kholagy.$groupId.tsx` | Injects styles; sections use `gap-0.5` stack, smaller dividers |

### Build & deploy

- **Build:** PASS
- **Deploy:** PASS

---

## Warnings

- Glow animates on every verse row — intentional for visibility on mobile; may feel busy on long hymns (can tune later).
- Index screen no longer has experimental spacing/glow.

---

## Errors

None.

---

## Recommendations

1. Open any hymn → `/kholagy/{id}` to see glowing text cards.
2. Hard refresh once if an old bundle is cached.

---

## Overall Status

**PASS**
