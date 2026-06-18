# Bible 2 Search Logic Fix

**Date:** 2026-06-17  
**Scope:** `/bible-2` contextual search, shared bible book search helpers, global `/search` bible results

---

## Executive Summary

Fixed broken Bible search navigation and improved search matching on **Bible 2** (`/bible-2`). The inline search row now opens the contextual overlay on focus (matching Bible 1 UX). Book results navigate with correct `/$book` params using canonical Supabase `book_name` values instead of short broken paths like `/يوحنا`.

---

## Findings

1. **`BibleV2SearchRow` only reacted on Enter** — tapping the field did not open the search overlay; users saw no results while typing.
2. **`BIBLE_HINTS` used invalid routes** — e.g. `/يوحنا`, `/رومية`, `/أعمال` do not match DB names (`إنجيل يوحنا`, `رسالة بولس الرسول إلى أهل رومية`, `سفر أعمال الرسل`).
3. **Book matching was too narrow** — searching "يوحنا" or "رومية" often missed full canonical book names.
4. **Global `/search` hub** duplicated the same broken hints and did not query the full books catalog from Supabase.

---

## Changes

| File | Change |
|------|--------|
| `src/features/search/bible-book-search.ts` | **New** — shared normalization, haystack matching, hint catalog, dedupe helpers |
| `src/features/search/contextual-search.ts` | Bible scope uses catalog books + resolved hints with `/$book` params |
| `src/features/bible-v2/components/BibleV2SearchRow.tsx` | Open overlay on focus; clear inline field when overlay closes |
| `src/components/alpha/ConnectExpandableSearchBar.tsx` | `ConnectSearchBarField` accepts optional `onFocus` |
| `src/routes/search.tsx` | Bible results from full books list + fixed hint navigation |

---

## Behavior After Fix

- Tap search on Bible 2 → overlay opens immediately with live results.
- Enter in inline field → opens overlay with query, clears inline field.
- Search "يوحنا", "رومية", "مزامير" → matches canonical books from DB.
- Selecting a result → navigates to `/$book` with correct `book` param.

---

## Warnings

- Search still matches **book names only**, not verse text (same as Bible 1 contextual search).
- Verse-level search remains a separate future enhancement.

---

## Errors

None during `npm run build` (PASS).

---

## Recommendations

1. Add verse/full-text search against `bible_verses` when product scope allows.
2. Wire Bible 2 quick tools saved/notes links to Bible 2 routes when those pages exist.

---

## Overall Status

**PASS**
