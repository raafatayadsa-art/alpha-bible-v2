# Dark-Mode Premium Saved/Journal Restore

**Date:** 2026-06-19  
**Source transcript:** `8330bc8b-16b4-49c6-9fa3-e9f85dd232c8` (cutoff before line 1804 — light mode request)

---

## Executive Summary

Recovered **14 target files** from transcript Write operations (plus StrReplace replay where needed) before the "الوضع الفاتح" conversion. All vault token files use **dark `SAVED_VAULT` / `JOURNAL_VAULT`** palettes — **no `bibleV2Tokens` imports** in saved/journal premium features. Production **build: PASS**.

Also added barrel exports: `src/features/bible-saved/index.ts`, `src/features/bible-journal/index.ts`.

---

## Findings

### Files restored (dark premium)

| File | Source | Token / theme |
|------|--------|----------------|
| `src/features/bible-saved/saved-vault-tokens.ts` | Write L1700 | **Dark** `SAVED_VAULT` (`#050814`, `#030208`) |
| `src/features/bible-saved/SavedVersesPremiumScreen.tsx` | Write L1700 + patches | **Dark** `SAVED_VAULT`, `control-center-bg.png` |
| `src/routes/bible.saved.tsx` | Write + patch L1703 | Premium route wrapper → `SavedVersesPremiumScreen` |
| `src/features/bible-journal/journal-vault-tokens.ts` | Write L1730 | **Dark** `JOURNAL_VAULT` (`#030208`) |
| `src/features/bible-journal/journal-prompts.ts` | Write L1730 bundle | Prompts only (no theme tokens) |
| `src/lib/bible-journal-state.ts` | Write L1730 | Storage + hooks |
| `src/features/bible-journal/JournalComposeSheet.tsx` | Write L1799 | **Dark** `JOURNAL_VAULT` |
| `src/features/bible-journal/BibleJournalPremiumScreen.tsx` | Write L1732 + patches | **Dark** `JOURNAL_VAULT` |
| `src/routes/bible.notes.tsx` | Write L1732 | Premium route wrapper |
| `src/lib/bible-journal-prefill.ts` | Write L1739 | Session prefill |
| `src/lib/chapter-verse-highlight.ts` | Write L1755 | Verse pulse helper |
| `src/features/bible-journal/JournalReferencePicker.tsx` | Write L1771 | **Dark** `JOURNAL_VAULT` |
| `src/features/bible-journal/JournalBibleSearchRow.tsx` | Write L1784 | **Dark** `JOURNAL_VAULT` |
| `src/routes/$book.$chapter.tsx` | Patches L1742–1760 (+ manual) | VerseCard: **FilePen notes above · Bookmark save below**; journal prefill nav; verse pulse |

### Dark vs light token confirmation

- **`saved-vault-tokens.ts`**: `SAVED_VAULT` with `#050814` / `#030208` — **dark** ✓  
- **`journal-vault-tokens.ts`**: `JOURNAL_VAULT` with `bgDeep: "#030208"` — **dark** ✓  
- **Skipped**: No light-mode vault token Writes (`bibleV2Tokens`) were applied.  
- **Screens**: Use `SAVED_VAULT` / `JOURNAL_VAULT` for chrome — not `bibleV2Tokens` for backgrounds.  
- **`BibleV2BottomNav`**: Still used when `fromBible2` — navigation only, not light vault theme.

### `$book.$chapter.tsx` VerseCard

Restored from transcript patches (pre–line 1804):

- Left column: **notes (FilePen) on top**, **save (Bookmark) below**
- `onAddJournalNote` → `stashJournalVersePrefill` + navigate to `/bible/notes`
- Verse highlight pulse via `?verse=` search param + `VERSE_PULSE_DURATION_MS`

---

## Warnings

- Some transcript StrReplace chains were replayed programmatically; a few failed patches were applied manually to match the last pre–light-mode intent.
- Temporary restore scripts remain under `scripts/` for audit traceability.

---

## Errors

None — `npm run build` completes successfully after restore.

---

## Recommendations

1. Manually QA `/bible/saved`, `/bible/notes`, and chapter reader verse buttons in the app.
2. Confirm verse pulse animation CSS (`verse-saved-pulse--*`) if visual pulse is desired (classes referenced in chapter route).

---

## Overall Status

**PASS**
