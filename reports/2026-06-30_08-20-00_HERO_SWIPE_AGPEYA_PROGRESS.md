# Hero Swipe & Agpeya Progress Fix

## Executive Summary

Improved home hero card swipe (smoother, easier, GPU-accelerated) and fixed Agpeya reading progress bar resetting on each section change. **Build: PASS.**

## Findings

### Hero stack swipe
- Thresholds lowered (36px / velocity 0.38) for easier card change.
- Horizontal vs vertical gesture lock — vertical scroll no longer fights swipe.
- Rubber-band damping on drag; peek cards parallax; front card subtle scale/rotate.
- `translate3d` + perspective for smoother animation.

### Agpeya progress bar
- **Root cause:** `ReaderArticleProgress` reset when `positionLabel` changed (`القسم 1 من 5` → `القسم 2 من 5`).
- **Fix:** New `resetKey` prop — progress only resets on prayer/chapter change, not section label updates.
- Progress now runs 0→100% across full prayer scroll to last section.

## Warnings

None.

## Errors

None.

## Recommendations

Test: home hero swipe left/right; Agpeya prayer scroll through all sections — bar should not jump to 0% mid-prayer.

## Overall Status

**PASS**
