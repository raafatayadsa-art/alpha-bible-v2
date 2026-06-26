# Bible Saved & Notes Routes Open Fix

**Date:** 2026-06-19  
**Scope:** `/bible/saved`, `/bible/notes` not rendering

---

## Executive Summary

Child routes `/bible/saved` and `/bible/notes` were registered under `/bible` but the parent route rendered `BibleHomeScreen` directly without `<Outlet />`, so navigation to child paths never displayed the premium screens.

---

## Findings

### Root cause
- `src/routes/bible.tsx` mounted `BibleHomeScreen` as the `/bible` component.
- TanStack Router nests `bible.saved.tsx` and `bible.notes.tsx` as **children** of `/bible`.
- Without `<Outlet />` on the parent, child route components never mount — pages appear blank or unchanged.

### Fix applied
1. **`bible.tsx`** — layout only: `component: () => <Outlet />`
2. **`bible.index.tsx`** — new index route `/bible/` with `BibleHomeScreen` + meta tags

Pattern matches existing layouts (`$book.tsx`, `settings.tsx`, `church.tsx`).

---

## Warnings

- After deploy, hard-refresh if cached route tree is stale in dev.
- `/bible` and `/bible/` both resolve to home via index route.

---

## Errors

- None. `npm run build` **PASS**.

---

## Recommendations

- QA: Bible 2 quick tools → المحفوظات / الملاحظات with `?from=bible-2`.
- QA: Bible 1 dock links to same routes without `from` param.

---

## Overall Status

**PASS**

---

## Files Changed

| File | Change |
|------|--------|
| `src/routes/bible.tsx` | Layout with `<Outlet />` |
| `src/routes/bible.index.tsx` | Bible home index route |
