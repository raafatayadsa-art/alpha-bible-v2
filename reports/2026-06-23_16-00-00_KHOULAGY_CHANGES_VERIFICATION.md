# Verification — Khoulagy & Related UI Changes

**Date:** 2026-06-23  
**Task:** Confirm whether recent modifications exist on disk vs what user sees in browser

---

## Executive Summary

**All described code changes ARE present in the local workspace.** They are **not committed to git** and **not deployed to production**. If the user tests a deployed URL or an old browser tab without hard refresh, they will not see the updates. Hover glow on Khoulagy cards only runs on devices with `hover` (desktop mouse), not on touch-only phones.

---

## Findings — File Audit (PASS: changes exist)

| Feature | File | Status | Evidence |
|---------|------|--------|----------|
| Khoulagy card spacing + hover glow | `src/routes/kholagy.index.tsx` | ✅ Applied | `gap-2`, `min-h-[156px]`, glow overlay lines 53–58 |
| Khoulagy home card | `src/components/home/KholagyHomeCard.tsx` | ✅ New file | Imported in `home.tsx` L14, rendered L287–290 |
| Platform module gate fix | `src/lib/platform-modules/PlatformModuleGate.tsx` | ✅ Applied | No `return null` while loading |
| Module cache merge | `src/lib/platform-modules/platform-modules-client.ts` | ✅ Applied | `mergePlatformModulesWithDefaults` |
| Church directory verified link | `src/features/church/churches-table.ts`, `church-directory/api.ts` | ✅ Applied | `isChurchDirectoryVerified` |
| DB migration | `supabase/migrations/20250623150000_church_directory_verified_link.sql` | ✅ Applied on Supabase | 19 verified churches synced |

### Git status (local only)

These paths are **modified or untracked** — not on remote/main:

- `?? src/routes/kholagy.index.tsx`
- `?? src/components/home/KholagyHomeCard.tsx`
- `?? src/lib/platform-modules/` (entire folder)
- `M src/routes/home.tsx`

`git ls-files` returns empty for the new files → **never committed**.

### Dev server

`npm run dev` is running; Vite HMR reloaded `kholagy.index.tsx` at 3:56–3:57 AM (terminal 3.txt).

---

## Why User May Not See Changes

1. **Production vs local** — Deployed site does not include uncommitted files.
2. **Mobile / touch** — Hover glow uses `[@media(hover:hover)]`; no glow on phone unless pressed (no `group-active` on overlay yet).
3. **Subtle spacing** — `gap-3` (12px) → `gap-2` (8px) is a 4px change; easy to miss.
4. **Home Khoulagy card** — Hidden when `isModuleEnabled("kholagy")` is false; clear `localStorage` key `ab:platform-modules-public` if stale.
5. **Stale tab** — Hard refresh: Ctrl+Shift+R on `/kholagy` and `/home`.

---

## Warnings

- Do not assume production has any of this work until commit + deploy.
- Church directory “الموثقة” filter shows **19** churches only (those verified in Alpha Control).

---

## Errors

None in source audit. Build previously PASS.

---

## Recommendations

1. Test on **localhost dev** (`npm run dev`), routes `/home` and `/kholagy`.
2. Hard refresh browser; clear `ab:platform-modules-public` if Khoulagy card missing.
3. Test hover on **desktop** with mouse for glow effect.
4. **Commit + deploy** when ready for production visibility.
5. Optional: add `group-active:opacity-100` on glow overlay for touch feedback.

---

## Overall Status

**PASS (local code)** / **PARTIAL (user visibility)** — code exists; visibility depends on environment and device.
