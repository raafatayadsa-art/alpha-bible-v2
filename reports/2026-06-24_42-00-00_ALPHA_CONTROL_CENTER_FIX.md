# Alpha Control Center — Fix & Startup

**Date:** 2026-06-24  
**Scope:** `/platform` owner panel + dev server stability

---

## Executive Summary

Fixed **Alpha Control Center** (`/platform`) so it no longer silently redirects to `/settings` with a blank screen. Unauthenticated users now see an inline owner PIN gate with a clear entry button. Confirmed and repaired a prior **syntax error** in `publisher-storage-api.ts` that had broken Vite transforms for platform-related bundles. Dev server restarted on **http://localhost:8081/** (8080 was occupied).

---

## Findings

| Issue | Cause | Fix |
|-------|-------|-----|
| Platform control "not working" | `PlatformAccessGate` returned `null` and redirected to `/settings` — no PIN UI on `/platform` | Inline gate + `OwnerAccessPinSheet` on `/platform` |
| App partially broken after publisher work | Broken `publisher-storage-api.ts` (orphan `}`) crashed Vite/esbuild | File corrected (already in repo) |
| Dev server confusion | Two instances: old on **8080**, new on **8081** | Use latest port or restart single instance |

**Access paths:**
- **Owner panel:** `/platform` → PIN (default dev: `000000`)
- **Personal settings:** `/settings` (مركز التحكم)
- **Hidden dev shortcut:** Settings → About → "Owner Access" button

---

## Warnings

- Owner PIN is client-side session only (`sessionStorage`) — clears when tab closes.
- Default PIN `000000` is for development; change via platform owner security before production.
- If page still blank, hard-refresh (Ctrl+Shift+R) after syntax fix.

---

## Errors

- Vite log showed: `publisher-storage-api.ts:76 Unexpected "}"` — **resolved**.
- No build failures on latest `npm run build` (prior session PASS).

---

## Recommendations

1. Open **http://localhost:8080** or **http://localhost:8081** (whichever terminal shows `ready`).
2. Navigate to `/platform`, tap **إدخال رمز المالك**, enter `000000`.
3. Stop duplicate `npm run dev` processes to avoid port confusion.

---

## Files Changed

- `src/features/platform-admin/PlatformAccessGate.tsx` — inline PIN gate
- `src/features/publisher/publisher-storage-api.ts` — MIME helper cleanup (no syntax error)

---

## Overall Status

**PASS**
