# Profile Hero & People Row Layout Fix

## Executive Summary

Repositioned people orbit cards (circle right, ledger left in RTL), added dark name plate for legibility, and fixed settings menu navigation by removing hero overflow clipping.

## Findings

### People cards (`CollapsiblePeopleOrbit`)
- Horizontal row: **avatar circle on the right**, **ledger title bar on the left** (RTL flex order).
- Expanded list remains full-width scroll below.

### Hero name
- Name + church line inside **dark glass frame** (`rgba(14,8,26)` gradient + blur) for contrast on church photo.

### Settings menu (`ProfileSettingsMenu`)
- Hero background `overflow-hidden` moved to image layer only — dropdown no longer clipped.
- Menu items use **`useNavigate`** → `/profile/personal` and `/settings`.
- Raised z-index (`z-30` / `z-50`).

## Warnings

None.

## Errors

None. `npm run build` — PASS.

## Recommendations

None.

## Overall Status

**PASS**
