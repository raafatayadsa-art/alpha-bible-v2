# Journal & Bible Home UI Update

## Executive Summary

Implemented the requested UX updates: light theme for notes/meditations screen, save button moved to bottom of compose sheet, scroll-to-top on open, back navigation to the previous Bible chapter when coming from the reader, removed verse card from Bible home, and promoted the continue-reading card with progress bar to the top hero slot.

## Findings

1. **Light theme (journal)** — Updated `JOURNAL_VAULT` tokens to ivory/gold palette aligned with Bible v2. Refreshed backdrop, header, tabs, cards, compose sheet, reference picker, and menu chips for light surfaces.
2. **Save button position** — `JournalComposeSheet` now places the save CTA in a sticky footer below the form fields (was at top).
3. **Scroll to top** — `BibleJournalPremiumScreen` calls `window.scrollTo({ top: 0 })` on mount.
4. **Back navigation** — Chapter reader passes `from: "reader"` when opening notes; `bible.notes` routes back to `/$book/$chapter` when applicable, otherwise `/bible`. `BackButton` prefers explicit `onBack` when provided.
5. **Bible home** — Removed `BibleV2VerseCard`; `BibleV2ContinueReading` with progress bar is now the hero card directly under the header (`placement="hero"`).

## Warnings

- Journal spotlight cards still use background images with a light overlay; contrast is acceptable but may need tuning on very bright photos.
- Direct URL entry to `/bible/notes?from=reader&book=…&chapter=…` without prior session still navigates back correctly via explicit route (not browser history).

## Errors

None. `npm run build` completed successfully.

## Recommendations

1. Manually verify on device: chapter → تأمل/ملاحظة → back returns to same chapter.
2. Confirm continue-reading hero looks correct when no reading session exists (fallback copy/CTA).
3. Optional: pass `from=reader` when opening notes from verse action sheet for "حفظ" if that flow should also return to chapter.

## Overall Status

**PASS**
