# Bible Dock Unified — No Logo · Same App Bar

**Date:** 2026-06-26

---

## Executive Summary

Removed the raised **Bible logo image** from the main bottom dock; the Bible tab now uses a standard **BookOpen** icon like other tabs. Replaced **BibleV2BottomNav** on all Bible V2 screens with the shared **BottomDock** so the menu bar no longer changes when entering the Bible module. Build **PASS**.

---

## Findings

| Change | Detail |
|--------|--------|
| Bottom dock Bible tab | `logo-bible.png` raised center tab → `BookOpen` Lucide icon, same row height |
| Bible area active state | Highlights on `/bible`, `/books`, and chapter reader `/{book}/{chapter}` |
| BibleV2Screen | `BottomDock` instead of `BibleV2BottomNav` |
| BooksV2Screen | `BottomDock` instead of `BibleV2BottomNav` |
| Journey / Notes / Saved | Always `BottomDock` (removed `fromBible2` nav split) |

### Files touched

- `src/components/bible/BottomDock.tsx`
- `src/features/bible-v2/components/BibleV2Screen.tsx`
- `src/features/books-v2/components/BooksV2Screen.tsx`
- `src/features/bible-journey/BibleJourneyScreen.tsx`
- `src/features/bible-journal/BibleJournalPremiumScreen.tsx`
- `src/features/bible-saved/SavedVersesPremiumScreen.tsx`

`BibleV2BottomNav.tsx` remains in repo but is unused (safe to delete in a follow-up).

---

## Warnings

- `fromBible2` prop still exists on some screens but only affects back navigation, not dock.

---

## Errors

None. `npm run build` exit 0.

---

## Recommendations

1. Delete unused `BibleV2BottomNav` + `BibleBottomNavigation` if no longer needed elsewhere.
2. Extend `isBibleArea` to single-segment book index routes if chapters grid should highlight Bible tab.

---

## Overall Status

**PASS**
