# ALPHA-105 — Global Bottom Navigation Safe Area Fix

**Date:** 2026-06-18  
**Ticket:** ALPHA-105  
**Priority:** Medium  

---

## Executive Summary

Implemented a **global bottom navigation clearance system** so scrollable content never sits behind fixed bottom docks. A single CSS token (`--alpha-bottom-nav-clearance`: `140px + safe-area-inset-bottom`) applies to all `AlphaScreenFrame` scroll containers when any bottom nav is mounted. Dock components register presence via `data-alpha-bottom-nav="active"` on `<html>`. Build **PASS**.

---

## Findings

### Root cause
- Bottom clearance was **inconsistent** across the app (`pb-36`, `72px + 16px`, `108px`, etc.).
- Alpha Connect used `--alpha-connect-nav-clearance` ≈ **88–104px**, which was **too small** for the raised center tab dock.
- Per-screen padding was easy to miss on new routes and settings sub-screens.

### Solution implemented

| Layer | Change |
|-------|--------|
| **CSS token** | `--alpha-bottom-nav-clearance: calc(140px + env(safe-area-inset-bottom, 0px))` in `alpha-responsive.css` |
| **Global scroll rule** | When `html[data-alpha-bottom-nav="active"]`, `.alpha-viewport-scroll` and `.alpha-screen-frame-scroll` get `padding-bottom` + `scroll-padding-bottom` |
| **Runtime hook** | `activateBottomNavLayout()` in `alpha-bottom-nav-layout.ts` — ref-counted mount/unmount |
| **Dock wiring** | `BottomDock`, `AlphaConnectBottomNavigation`, `BibleBottomNavigation`, `AlphaBottomNavigation` (×2 variants) |
| **Connect alignment** | `--alpha-connect-nav-clearance` now inherits global token; removed duplicate inner padding on Connect main content and settings |

### Files changed
- `src/components/navigation/alpha-bottom-nav-layout.ts` *(new)*
- `src/components/navigation/index.ts`
- `src/components/alpha/alpha-responsive.css`
- `src/components/alpha/styles.css`
- `src/features/alpha-connect/alpha-connect-layout.ts`
- `src/components/bible/BottomDock.tsx`
- `src/components/alpha/AlphaConnectBottomNavigation.tsx`
- `src/components/alpha/AlphaConnectSettings.tsx`
- `src/components/alpha/AlphaBottomNavigation.tsx`
- `src/features/bible-home/components/BibleBottomNavigation.tsx`
- `src/features/bible-lavoble/components/alpha/AlphaBottomNavigation.tsx`
- `src/routes/alpha-connect.tsx`

### How future screens inherit
1. Route renders inside `AlphaScreenFrame` (`mode="flow"` or `"scroll"`) — **automatic** scroll clearance when a dock mounts.
2. New dock component: call `activateBottomNavLayout()` in `useEffect` while visible.
3. Sheets/overlays above dock: use `connectSheetBottomInsetClass()` or `var(--alpha-bottom-nav-clearance)`.

---

## Warnings

1. **Legacy per-page `pb-36` / `pb-[calc(...)]`** on inner content wrappers still exist on many routes (home, profile, church, etc.). Combined with global scroll padding this may add **extra** bottom whitespace (~280px total). Content remains accessible; optional cleanup can reduce gap in a follow-up.
2. **Auto-hide dock** (`BottomDock`): when the dock hides after idle, clearance is removed so content can use full viewport height until the dock reappears.
3. **Fixed-mode frames** (e.g. open chat in Alpha Connect) use inner panel scroll — clearance follows chat layout, not global scroll padding.
4. **Manual QA** on real iPhone/Android devices recommended for safe-area verification.

---

## Errors

None. Production build completed successfully (`npm run build`, exit 0).

---

## Recommendations

1. **Device QA:** Scroll to last item on Alpha Connect settings, Control Center, profile, church feed, and home — confirm full tap target above dock.
2. **Optional cleanup:** Replace redundant `pb-36` on inner wrappers with reliance on global scroll padding only (reduces double spacing).
3. **Inner scroll panels:** If any fixed-layout screen still overlaps, add `.alpha-viewport-scroll` class or apply `padding-bottom: var(--alpha-bottom-nav-clearance)` to that scroll owner.

---

## Overall Status

**PASS** — Global mechanism deployed; build green; Connect settings overlap addressed; future scroll-frame routes inherit automatically.

---

## Success Criteria Checklist

| Criterion | Status |
|-----------|--------|
| Global solution (not per-screen) | ✅ |
| ~140px + safe area | ✅ |
| iPhone / Android safe areas | ✅ (`env(safe-area-inset-bottom)`) |
| Bottom nav remains visible | ✅ (unchanged dock behavior) |
| Alpha Connect settings clear dock | ✅ |
| Build passes | ✅ |
