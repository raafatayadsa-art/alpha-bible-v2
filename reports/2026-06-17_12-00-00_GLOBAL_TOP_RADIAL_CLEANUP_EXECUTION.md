# GLOBAL TOP RADIAL CLEANUP — Execution Report

**Date:** 2026-06-17  
**Task:** Remove all route-level Top Radial Bowl / Top Glow duplicates (18-file scope)  
**Status:** **COMPLETE** (already applied in working tree)

---

## Executive Summary

All **route-level** `fixed/absolute inset-0` top radial backgrounds from the GLOBAL_TOP_CURVE_REMOVAL_ANALYSIS scope have been removed. Production shell fill comes from `AlphaScreenFrame` + `AlphaBackground` Variant A default.

**Not modified (per request):** Katameros PNG, Settings PNG, Alpha Connect, AlphaHeader, AlphaScreenFrame.

---

## Findings

### Route-level layers removed (22 total)

| # | File | Removed |
|---|------|---------|
| 1 | `src/routes/church.tsx` | 1× fixed 3-layer top radial |
| 2 | `src/routes/church.post.$id.tsx` | 1× fixed top radial |
| 3 | `src/routes/church.chat.$contactId.tsx` | 1× fixed top radial |
| 4 | `src/routes/church.directory.tsx` | inline page radial + fixed accent layer |
| 5 | `src/routes/church.directory.$placeId.tsx` | inline lavender top ramp → flat `#f4ead8` |
| 6 | `src/routes/profile.index.tsx` | 2× fixed page background layers |
| 7 | `src/routes/profile.messages.tsx` | 1× fixed page radial |
| 8 | `src/routes/profile.membership.tsx` | 1× fixed top radial ramp |
| 9 | `src/routes/profile.service.tsx` | `ServiceBackdrop` page-level component |
| 10 | `src/routes/prayer-requests.tsx` | 3× layers (radial, ellipse/conic, reflection) |
| 11 | `src/features/church/PostBuilder.tsx` | 1× fixed top radial |
| 12 | `src/features/bible-home/BibleHomeScreen.tsx` | 1× absolute top radial |
| 13 | `src/features/bible-home/BibleSubpagePlaceholder.tsx` | 1× absolute top radial |
| 14 | `src/routes/books.tsx` | 1× absolute top radial |
| 15 | `src/routes/$book.index.tsx` | 1× absolute top radial |
| 16 | `src/routes/bible.notes.tsx` | 1× absolute top radial |
| 17 | `src/routes/bible.saved.tsx` | 1× absolute top radial |
| 18 | `src/routes/$book.$chapter.tsx` | light-mode top haze + spiritual top bowl layer |
| 19 | `src/routes/agpeya.$prayerId.tsx` | full-page radial class → flat `#f4ead8` |
| 20 | `src/features/agpeya/states.tsx` | 2× radial page classes → flat |

### Global default

| File | Change |
|------|--------|
| `src/components/alpha/AlphaBackgroundProvider.tsx` | Default Variant `"a"` (no top radial) |

---

## Verification (post-cleanup grep)

**Canonical page-level pattern `120% 50% at 50% 0%` remains only in:**

- `src/components/alpha/alpha-background.ts` — Variant B/C source (global, opt-in via `?alphaBg=`)
- Card-scoped UI in `profile.index.tsx`, `profile.service.tsx` — **not** full-page bowls

**No `fixed inset-0` top radial divs** remain on the 18 route files.

---

## Intentionally kept

| Item | Reason |
|------|--------|
| Katameros PNG + `KatamerosScreenBackground` | User exclusion |
| Settings PNG backgrounds | User exclusion |
| Alpha Connect routes/styles | User exclusion |
| `AlphaHeaderShell` / `AlphaHeader` | User exclusion |
| `AlphaScreenFrame` / viewport CSS | User exclusion |
| Profile hero **card** radials | Card chrome, not page-level |
| `profile.membership` dot-pattern overlay | Texture dots, not top ellipse |
| `$book.$chapter` spiritual fog (mid-screen) | Not top bowl; reading ambience |
| `control-center-ui.tsx` card glows | Settings UI cards, not route PNG |

---

## Modified files (21 — cleanup scope)

1. `src/components/alpha/AlphaBackgroundProvider.tsx`
2. `src/routes/church.tsx`
3. `src/routes/church.post.$id.tsx`
4. `src/routes/church.chat.$contactId.tsx`
5. `src/routes/church.directory.tsx`
6. `src/routes/church.directory.$placeId.tsx`
7. `src/routes/profile.index.tsx`
8. `src/routes/profile.messages.tsx`
9. `src/routes/profile.membership.tsx`
10. `src/routes/profile.service.tsx`
11. `src/routes/prayer-requests.tsx`
12. `src/features/church/PostBuilder.tsx`
13. `src/features/bible-home/BibleHomeScreen.tsx`
14. `src/features/bible-home/BibleSubpagePlaceholder.tsx`
15. `src/routes/books.tsx`
16. `src/routes/$book.index.tsx`
17. `src/routes/bible.notes.tsx`
18. `src/routes/bible.saved.tsx`
19. `src/routes/$book.$chapter.tsx`
20. `src/routes/agpeya.$prayerId.tsx`
21. `src/features/agpeya/states.tsx`

---

## Warnings

- Katameros top curve may still appear from PNG medallion — separate from this cleanup.
- Card-level gold radials on Profile remain by design.
- Changes are in working tree; **not committed** per user protocol.

---

## Errors

None.

---

## Overall Status

**PASS** — Global route-level top radial cleanup complete.
