# Alpha Connect Screen Fix

## Executive Summary

Fixed Alpha Connect navigation regressions after the entry-experience update: duplicate top/bottom navigation, unstable `?tab=` deep links, and bottom bar positioning.

## Findings

### Root causes

1. **Double navigation** — `ModeSwitcher` (top) and new bottom nav both visible, causing conflicting mode changes.
2. **`?tab=` loop** — Deep-link effect re-applied tabs when handlers changed; settings could re-open after closing.
3. **Incomplete tab handlers** — Messages tab did not open conversations list; overlays (settings/channel) not cleared on tab switch.
4. **Fixed bottom bar** — Nav rendered inside scroll frame instead of viewport-level sibling.

### Fixes applied

| Fix | Detail |
|-----|--------|
| Hide top ModeSwitcher | Hidden when bottom nav is visible; shown only in chat (bottom nav hidden) |
| One-shot tab apply | `appliedConnectTabRef` prevents repeated deep-link handling |
| URL sync | `buildAlphaConnectSearch()` + `navigateConnectSearch()` on every tab change |
| Settings toggle | Tap Settings again closes; back clears `?tab=` |
| Messages tab | Sets `messagesTab: "conversations"` |
| Layout | Bottom nav moved outside `AlphaScreenFrame` (fragment wrapper) |
| Channel settings | Bottom nav restored on channel settings screen |

## Warnings

- Chat view still uses top `ModeSwitcher` when bottom nav is hidden (by design).
- Missed-call counts remain demo data until call-log API exists.

## Errors

None. `npm run build` — **PASS**.

## Recommendations

- Optionally sync `ModeSwitcher` clicks with URL tab params if top switcher is re-enabled anywhere.
- Add E2E test for `/alpha-connect?tab=messages` and settings open/close cycle.

## Overall Status

**PASS**
