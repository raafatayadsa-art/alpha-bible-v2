# Chapter Search Expand Anchor — Bible 2 Reader

**Date:** 2026-06-17  
**Scope:** `src/routes/$book.$chapter.tsx` header search  
**Overall Status:** PASS

---

## Executive Summary

Fixed the chapter reader search bar so it **expands from the search icon** (same anchor pattern as Alpha Connect and `BibleHeader`), instead of appearing to grow from the opposite side of the header.

---

## Findings

### Root cause

The chapter header used a single flex wrapper for search. On expand, the bar took `flex-1` beside the back buttons, so the `max-width` animation looked like it originated from the menu side—not the icon.

### Fix applied

1. Added `dir="rtl"` to the header (Arabic layout parity with Bible home / Connect).
2. Nested trailing search slot matching `BibleHeader` / `home.tsx`:
   - Outer: `flex-1 justify-end` when expanded
   - Inner: `w-full flex-1 justify-end` when expanded
3. Title hides in place (`max-w-0 opacity-0`) while search stays in the same trailing slot.
4. Back/home group fades as a unit when search expands (same as title collapse UX).

---

## Warnings

- Chapter route is shared with classic `/bible`; back links remain `/bible` (not `/bible-2`).
- Visual QA recommended on device for spiritual/dark mode contrast.

---

## Errors

None. ESLint clean on modified file.

---

## Recommendations

- Optional: route-aware back link (`/bible` vs `/bible-2`) via search param or session flag.
- Apply same nested wrapper to `BooksV2Screen` header if expand anchor feels off there too.

---

## Overall Status

**PASS**
