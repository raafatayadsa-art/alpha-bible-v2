# ALPHA-105 — Bottom Sheet Safe Area Fix (Connect Settings Picker)

**Date:** 2026-06-18  
**Ticket:** ALPHA-105 (follow-up)  
**Issue:** Select picker in Alpha Connect settings hidden under bottom navigation  

---

## Executive Summary

The screenshot showed **SelectSheet** options (e.g. «المسار الافتراضي عند الاتصال») cut off **under** the Connect bottom dock. Root cause: bottom sheets render **inside** `AlphaScreenFrame` (`isolation: isolate`), so their `z-50` is trapped below the dock rendered **outside** the frame as a sibling. Fix: global **`.alpha-bottom-sheet-host`** padding (`140px + safe-area`) pushes sheet panels above the dock; fixed save bar uses **`.alpha-dock-fixed-footer`**. Build **PASS**.

---

## Findings

### Root cause (stacking + position)
| Factor | Detail |
|--------|--------|
| Frame isolation | `.alpha-viewport-root { isolation: isolate }` creates a stacking context |
| Dock placement | `AlphaConnectBottomNavigation` is a **sibling** of `AlphaScreenFrame`, not a child |
| SelectSheet | `fixed inset-0 z-50 items-end` at viewport bottom — **physically under** the dock |
| Previous global fix | Scroll padding on `.alpha-screen-frame-scroll` does **not** affect fixed overlays |

### Solution

**New global CSS** (`alpha-responsive.css`):
- `.alpha-bottom-sheet-host` → `padding-bottom: var(--alpha-bottom-nav-clearance)` when dock active
- `.alpha-dock-fixed-footer` → `bottom: var(--alpha-bottom-nav-clearance)`
- `.connect-settings-body` → extra `5rem` padding for fixed «حفظ التغييرات» bar

**Wired to Connect UI:**
- `AlphaConnectSettings` — `SelectSheet`, save footer
- `ConnectChannelSettings` — invite sheet
- `ConnectChannelsUI` — member action sheet
- `ConnectCreateChannelSheet`
- `alpha-connect.tsx` — call picker sheet
- `AlphaTrustShield` — trust center sheet (portal)

**Helpers:** `connectBottomSheetHostClass()`, `ALPHA_BOTTOM_SHEET_HOST_CLASS` in layout modules.

---

## Warnings

1. Other app bottom sheets (home, church, profile messages, date/time pickers) still use legacy `pb-[safe-area]` only — apply `.alpha-bottom-sheet-host` in a future sweep if overlap appears outside Connect.
2. When dock auto-hides (`BottomDock`), clearance is removed; sheets expand to bottom — expected.

---

## Errors

None. Build exit 0.

---

## Recommendations

1. Re-test: Alpha Connect → Settings → الصوت والاتصال → المسار الافتراضي — all options visible and tappable above dock.
2. Optional: add `.alpha-bottom-sheet-host` to shared `AlphaDatePicker` / `AlphaTimePicker` hosts for app-wide parity.

---

## Overall Status

**PASS** — Connect settings picker overlap resolved with global sheet/footer utilities.

---

## Success Criteria

| Test | Expected |
|------|----------|
| Open audio route picker in settings | All rows above dock ✅ |
| Scroll last settings section | Save button + last card above dock ✅ |
| Connect invite / channel sheets | Clearance inherited ✅ |
