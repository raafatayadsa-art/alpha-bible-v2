# Chapter Screen Search — Expandable Bar (Alpha Connect Parity)

**Date:** 2026-06-17  
**Scope:** Bible 2 chapter reader (`/$book/$chapter`)  
**Overall Status:** PASS

---

## Executive Summary

Removed the full-screen dictionary search dialog from the chapter reader header and replaced it with the same expandable inline search bar used in Alpha Connect. Tapping the search icon expands a glass bar in the header; Enter submits a dictionary lookup and opens the appropriate sheet (single result, multi-choice picker, or toast).

---

## Findings

1. **`DictionarySearchDialog` removed from chapter route** — No overlay/modal search on the chapter screen anymore.
2. **`ConnectExpandableSearchBar` integrated** — Uses `classicTheme` for Alpha Connect Classic palette on non-Connect surfaces.
3. **Header behavior matches Connect/BibleHeader** — When search expands, back/home links and chapter title fade/hide; the bar takes full header width.
4. **Submit flow preserved** — `lookupDictionary` + `rankAndDedupe` → `DictionaryLookupSheet` / `DictionaryResultsSheet` / toast.
5. **Shared component** — Same `ConnectExpandableSearchBar` as Alpha Connect messages and Bible home header.

### Key file

- `src/routes/$book.$chapter.tsx`

### Behavior

| Action | Result |
|--------|--------|
| Tap search circle | Bar expands with focus |
| Tap X / collapse | Clears query, restores header |
| Enter with query | Dictionary lookup; opens sheet or toast |
| Empty Enter | No-op |

---

## Warnings

1. **Back/home links** still navigate to `/bible`, not `/bible-2` — Bible 2 users return to classic Bible home unless changed separately.
2. **`DictionarySearchDialog.tsx`** remains in the codebase (exported) but is unused; safe to delete in a future cleanup.
3. **Spiritual/dark mode** — Classic light glass bar on dark reader background may need visual QA.
4. **Pre-existing TypeScript errors** elsewhere in the repo (Alpha Connect security, etc.) — unrelated to this change.

---

## Errors

None introduced by this change. ESLint clean on `$book.$chapter.tsx`.

---

## Recommendations

1. Optionally point chapter back/home to `/bible-2` when entered from Bible 2 flow.
2. Remove or repurpose `DictionarySearchDialog` if no other route needs it.
3. Manual QA: expand/collapse animation, Enter lookup, multi-result picker, spiritual mode contrast.

---

## Overall Status

**PASS** — Chapter search uses inline expandable bar; full search dialog removed from chapter screen.
