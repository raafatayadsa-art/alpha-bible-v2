# Alpha Connect Screen Open Fix

**Date:** 2026-06-18  
**Issue:** شاشة Alpha Connect مش بتفتح  
**Overall Status:** PASS

---

## Executive Summary

Alpha Connect failed to open due to a **compile-time error** in `alpha-connect.tsx` (duplicate `showConnectBottomNav` declaration) that broke Vite SSR/module loading with HTTP 500. Additional **URL tab sync** bugs could close settings immediately or treat `?tab=alpha` as a deep link that redirects back to `/home`.

---

## Findings

### 1. Module parse error (primary blocker)

| Item | Detail |
|------|--------|
| Error | `Identifier 'showConnectBottomNav' has already been declared` |
| Location | `src/routes/alpha-connect.tsx` ~line 881 (during nav refactor) |
| Symptom | Route module fails to load → SSR 500 → screen appears blank / never opens |
| Status | Duplicate removed; single declaration at line ~783 |

### 2. Settings tab URL loop

When user opened settings, URL updated to `?tab=settings`, then the deep-link effect re-ran `handleConnectNavTab("settings")` while settings were already open → **toggle closed settings immediately**.

**Fix:** Deep-link apply uses `source: "url"`; toggle-close only on user bottom-nav press (`source: "user"`). Skip URL apply when active tab already matches.

### 3. `?tab=alpha` redirect

`alpha` is the exit-to-home action, not a screen tab. If present in URL, effect called `exitToAlphaHome()` → instant redirect to `/home` (felt like Connect never opens).

**Fix:** `parseAlphaConnectNavTab` only accepts `channels | calls | messages | settings` for URL search params.

---

## Warnings

- Dev server may need a hard refresh after the parse error was fixed (stale HMR cache).
- Security lock gate still shows when enabled — user must unlock; this is expected, not a crash.

---

## Errors

- **Before fix:** Vite/babel redeclaration error on `alpha-connect.tsx` (dev SSR 500).
- **After fix:** None. `npm run build` — **PASS**.

---

## Recommendations

1. Hard refresh browser or restart `npm run dev` if screen still blank locally.
2. Avoid adding `?tab=alpha` to bookmarks; use bottom nav Alpha button to exit.
3. Add Playwright smoke test: home card → `/alpha-connect` renders header + bottom nav.

---

## Files Modified

| File | Change |
|------|--------|
| `src/routes/alpha-connect.tsx` | URL tab effect guard; settings toggle source split |
| `src/features/alpha-connect/alpha-connect-nav.ts` | URL tabs exclude `alpha` |

---

## Verification

- `npm run build` — PASS
- `GET http://localhost:8081/alpha-connect` — HTTP 200
