# Alpha Control Center Fix V2

**Date:** 2026-06-24  
**Scope:** `/platform` owner panel (Alpha Control Center)

## Executive Summary

Alpha Control Center was failing after PIN/dev login with a blank error page (`تعذّر تحميل الصفحة`). Root cause was a broken barrel import chain plus duplicate access gates on every child route. Fixes applied: single layout gate, hooks-safe PIN sheet, export of `publisherContentMediaSpec`, and direct import of `AlphaMissionControl`. Verified in browser on `http://localhost:8081/platform`; production build passes.

## Findings

1. **Runtime crash after access granted**
   - `platform.index.tsx` imported `AlphaMissionControl` from `@/features/platform-admin` barrel.
   - Barrel re-exports `ContentReviewCenterScreen` → `ContentReviewPreviewSheet` → imports `publisherContentMediaSpec` from `@/features/publisher`.
   - `publisherContentMediaSpec` was **not exported** from `publisher/index.ts`, causing module evaluation failure and TanStack error boundary.

2. **Double PIN gate**
   - `PlatformAccessGate` was wrapped on **20 child routes** in addition to the new parent layout `src/routes/platform.tsx`.
   - Caused confusing UX (gate screen reopening, backdrop closing to home).

3. **React hooks violation in PIN sheet**
   - `OwnerAccessPinSheet` had a `useEffect` after `if (!open) return null`, violating Rules of Hooks when toggling open state.

4. **Access gate UX (prior fix retained)**
   - `pinOpen` starts `false`; user sees landing screen first.
   - Dev quick-login button and default PIN hint `000000` present in DEV.

## Fixes Applied

| File | Change |
|------|--------|
| `src/features/publisher/index.ts` | Export `publisherContentMediaSpec` from `./types` |
| `src/routes/platform.tsx` | Parent layout with single `PlatformAccessGate` + `<Outlet />` |
| `src/routes/platform.*.tsx` (20 files) | Removed duplicate `PlatformAccessGate` wrappers |
| `src/routes/platform.index.tsx` | Direct import from `AlphaMissionControl.tsx` (avoids heavy barrel side effects) |
| `src/features/platform-admin/OwnerAccessPinSheet.tsx` | Moved auto-submit hook before early return; `useCallback` for submit |
| `src/features/platform-admin/PlatformAccessGate.tsx` | Landing gate UI (unchanged this round) |
| `src/features/settings/AlphaControlCenter.tsx` | Safe `sectionVisible()` for non-array keywords (prior round) |

## Verification

- **Browser:** `http://localhost:8081/platform`
  - Gate screen renders with «إدخال رمز المالك» and «دخول سريع (تطوير)».
  - After session grant → `AlphaMissionControl` dashboard loads (Users, Churches, Core Operations cards).
  - `/platform/content-review` preview sheet loads (confirms publisher export fix).
- **Build:** `npm run build` — **PASS** (exit 0).

## Warnings

- Dev server may still bind to **8081** if **8080** is occupied by a stale Vite process. Use the port shown in terminal output.
- Owner session is stored in `sessionStorage` (`ab:owner-session`); clearing site data resets access.
- Default dev PIN is `000000`; change via Owner Security in production.

## Errors

- None remaining in verified flows.

## Recommendations

1. Prefer **direct imports** for platform route components instead of `@/features/platform-admin` barrel to reduce accidental side-effect loading.
2. Restart stale dev server on 8080 or kill the old process to avoid port confusion.
3. Consider lazy-loading heavy platform sub-screens (content review, publisher center) from the barrel export list.

## Overall Status

**PASS**
