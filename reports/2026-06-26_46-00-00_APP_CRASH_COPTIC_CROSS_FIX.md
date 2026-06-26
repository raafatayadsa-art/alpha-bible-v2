# App Crash Fix — CopticCross Import

**Date:** 2026-06-26  
**Scope:** Home screen runtime crash after share refactor

---

## Executive Summary

The app appeared completely broken because the home screen (`/home`) crashed at runtime: `CopticCross` was still used in JSX but its import was accidentally removed during the share-sheet refactor. React threw `ReferenceError: CopticCross is not defined`, producing a white/error screen on the default route.

**Overall Status: PASS** (build verified after fix)

---

## Findings

1. **Root cause:** `src/routes/home.tsx` lines 241 & 269 reference `<CopticCross />` without import.
2. Build (`vite build`) still passed — Vite does not typecheck by default; `tsc` surfaced the error.
3. Secondary: `alpha-theme.css` border remap missing `[data-theme="dark"] .border-[#efe2c4]` selector (cosmetic only, fixed).
4. `home.tsx` UTF-8 mojibake from PowerShell truncate (display only, not crash).

---

## Fixes Applied

- Restored `import { CopticWatermark, CopticCross } from "@/components/coptic"` in `home.tsx`
- Repaired dark-mode border CSS selector in `alpha-theme.css`
- Removed unused `alphaShareText` import from `AlphaShareSheetHost.tsx`

---

## Warnings

- Run `npx tsc --noEmit` or enable typecheck in CI to catch missing imports before deploy.
- Consider restoring Arabic strings in `home.tsx` MiniPlayer section if mojibake is visible (encoding artifact from truncate).

---

## Errors

None after fix. `npm run build` — **PASS**.

---

## Recommendations

1. Add pre-build `tsc --noEmit` to catch runtime ReferenceErrors from missing imports.
2. Avoid PowerShell `Set-Content` for TSX files — use editor/str replace to preserve UTF-8.
