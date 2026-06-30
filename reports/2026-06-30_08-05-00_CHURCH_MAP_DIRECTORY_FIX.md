# Church Setup Map & Directory Fix

## Executive Summary

Fixed three church-setup/directory issues: map modal close button, incomplete church directory loading in pick sheet, and search by name/city/governorate. **Build: PASS.**

## Findings

### 1. Map modal close button
- `MapModal` rendered inside scrollable profile shell (not portaled).
- Low z-index (`z-[200]`) could sit under bottom nav / overlays.
- **Fix:** `createPortal` to `document.body`, `z-[10080]`, Escape key, explicit `stopPropagation` on close.

### 2. Directory not loading all churches
- `ChurchDirectoryPickSheet` fetched only **one page (20 rows)**.
- **Fix:** `fetchChurchDirectoryAll()` paginates server-side (100/page) until full catalog loaded.

### 3. Search not working (name / city / governorate)
- Pick sheet re-fetched limited server page on each keystroke.
- Map directory used simple `includes` on one string.
- **Fix:** Shared `matchesChurchDirectoryQuery` + client-side filter on full loaded catalog; improved main directory map/list filtering.

## Warnings

- Churches without lat/lng are excluded from setup pick sheet (location required).
- Main directory list still paginates; search uses RPC + client filter on loaded pages.

## Errors

None in build.

## Recommendations

Test: open church setup → map → close (X, backdrop, Escape); open directory → verify count; search «القاهرة», church name, governorate.

## Overall Status

**PASS**
