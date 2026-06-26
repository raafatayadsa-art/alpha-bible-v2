# Publisher Continue Listening Player — Professional Polish

**Date:** 2026-06-24  
**Scope:** بطاقة «أكمل الاستماع» في صفحة الناشر

---

## Executive Summary

Fixed raw decimal timestamps in the continue-listening card and rebuilt the mini player with play/pause, ±15s skip, seekable progress bar, and resume-from-saved position.

---

## Findings

- `formatDurationSeconds` used `total % 60` on floats → displayed values like `1:10.765687999999997`.
- Continue card was a single tap target with no transport controls and a cramped time label.
- Resume did not seek to saved `positionSec` on play.

---

## Changes

| File | Change |
|------|--------|
| `publisher-content-payload.ts` | Floor seconds in `formatDurationSeconds` |
| `PublisherPublicPageView.tsx` | Mini player UI, audio state (`activeTrackId`, `playheadSec`), resume + seek + skip |

---

## Warnings

- Existing localStorage continue entries may still hold float positions until next playback save (display now floors correctly).

---

## Errors

None.

---

## Recommendations

1. Play content, leave mid-track, reopen page — verify `MM:SS` times and controls.
2. Optional: migrate stored continue entries to floored seconds on read.

---

## Overall Status

**PASS**
