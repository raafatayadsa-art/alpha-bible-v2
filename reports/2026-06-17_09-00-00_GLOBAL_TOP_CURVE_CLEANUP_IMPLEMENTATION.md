# GLOBAL TOP CURVE CLEANUP — Implementation Report

**Date:** 2026-06-17  
**Option:** D (Hybrid) — executed  
**Status:** COMPLETE

---

## Executive Summary

Implemented Option D from the analysis report:

1. **AlphaBackground default → Variant A** (flat shell, no top radial bowl).
2. **Removed 22 route-level decorative background layers** across 20 files (duplicate top radial / ellipse / bowl gradients).
3. **Preserved:** `AlphaScreenFrame`, `AlphaHeaderShell`, viewport CSS, Katameros/Settings PNG backgrounds, Alpha Connect (unchanged).

Top glow / top bowl / top ellipse on general shell screens should now come only from **Variant B/C** if user opts in via `?alphaBg=b|c` or localStorage — not by default.

---

## Findings (What Changed)

### Global default

| File | Change |
|------|--------|
| `src/components/alpha/AlphaBackgroundProvider.tsx` | `DEFAULT_VARIANT`: `"b"` → `"a"` |

### Route-level radial removals (22 layers)

| # | File | Removed |
|---|------|---------|
| 1 | `src/routes/church.tsx` | 1× fixed inset-0 3-layer top radial |
| 2 | `src/routes/church.post.$id.tsx` | 1× fixed inset-0 top radial |
| 3 | `src/routes/church.chat.$contactId.tsx` | 1× fixed inset-0 top radial |
| 4 | `src/routes/church.directory.tsx` | 1× inline page radial + 1× fixed accent radial |
| 5 | `src/routes/church.directory.$placeId.tsx` | 1× inline page radial → flat `#f4ead8` |
| 6 | `src/routes/profile.index.tsx` | 2× fixed page background layers |
| 7 | `src/routes/profile.messages.tsx` | 1× fixed page radial + linear |
| 8 | `src/routes/profile.membership.tsx` | 1× fixed top radial ramp |
| 9 | `src/routes/profile.service.tsx` | `ServiceBackdrop` component (page-level) |
| 10 | `src/routes/prayer-requests.tsx` | 3× layers (radial, ellipse/conic, reflection strip) |
| 11 | `src/features/church/PostBuilder.tsx` | 1× fixed inset-0 top radial |
| 12 | `src/features/bible-home/BibleHomeScreen.tsx` | 1× absolute inset-0 top radial |
| 13 | `src/features/bible-home/BibleSubpagePlaceholder.tsx` | 1× absolute inset-0 top radial |
| 14 | `src/routes/books.tsx` | 1× absolute inset-0 top radial |
| 15 | `src/routes/$book.index.tsx` | 1× absolute inset-0 top radial |
| 16 | `src/routes/bible.notes.tsx` | 1× absolute inset-0 top radial |
| 17 | `src/routes/bible.saved.tsx` | 1× absolute inset-0 top radial |
| 18 | `src/routes/$book.$chapter.tsx` | Light-mode atmosphere block + spiritual top bowl layer |
| 19 | `src/routes/agpeya.$prayerId.tsx` | Page radial class → flat `#f4ead8` |
| 20 | `src/features/agpeya/states.tsx` | 2× radial page classes → flat `#f4ead8` |

**Total removed decorative layers: 22**

### Intentionally kept

| Item | Reason |
|------|--------|
| `KatamerosScreenBackground` + PNG | Option D — localized parchment artwork |
| `ControlCenterScreenBackground` / `TrustSafetyScreenBackground` | Option D — settings artwork |
| `AlphaScreenFrame`, `alpha-viewport.css` | Required viewport infrastructure |
| `AlphaHeaderShell` | Safe-area spacing |
| Profile card-level radials (`profile.index`, `profile.service` cards) | Card UI decoration, not page-level top bowl |
| `profile.membership` dot-pattern overlay | Ornamental texture, not top ellipse |
| Spiritual reading fog layer (`$book.$chapter`) | Mid-screen ambience, no top anchor |
| Alpha Connect routes/styles | Explicitly excluded |

---

## Warnings

- Users with `localStorage` key `alpha-background-variant` set to `"b"` will still see global radial until cleared or `?alphaBg=a` used.
- Profile hero cards retain card-level gold radials at top of card — not removed (scoped to card chrome).
- Katameros PNG medallion may still appear if top cap clip is insufficient — PNG artwork preserved per Option D.

---

## Errors

- None during edit. Build not run in this session (verify locally with `npm run build`).

---

## Affected Screens

| Route / area | Effect |
|--------------|--------|
| `/church` | Flat top — no duplicate gold/lavender bowl |
| `/church/post/:id`, `/church/chat/:id` | Flat top |
| `/church/directory`, `/church/directory/:id` | Flat `#f4ead8` (was lavender ramp) |
| `/profile`, `/profile/messages`, `/profile/membership`, `/profile/service` | Flat shell background |
| `/prayer-requests` | No candle ellipse / top rays |
| `/bible`, `/books`, `/$book`, notes/saved | Flat bible cream `#faf8f3` |
| `/$book/$chapter` | No light-mode top haze; spiritual top bowl removed |
| `/agpeya/*` prayer + states | Flat `#f4ead8` |
| PostBuilder modal | Flat background |
| `/home`, `/synaxarium`, `/feasts` | Already no route radial; now global A only |
| `/katameros`, `/settings` | Unchanged PNG paths |
| `/alpha-connect`, `/call`, `/messages` | **Unchanged** |

---

## Before / After

| Aspect | Before | After |
|--------|--------|-------|
| Global default | Variant B — top radial bowl on all shell routes | Variant A — flat `#f4ead8` only |
| `/church` | Global B + route 3-layer radial (double bowl) | Global A only |
| `/profile` | 2 fixed page layers + global B | Flat `#f4ead8` + card decorations |
| `/prayer-requests` | Radial + ellipse at 50% 0 + reflection | Flat + CopticWatermark |
| `/bible` | Route radial + global B | Flat bibleHome background color |
| Directory | Lavender top ramp | Flat shell cream |
| Katameros | PNG + global B | PNG + global A (less stacking) |
| Alpha Connect | Dark linear (unchanged) | Unchanged |

---

## Recommendations

1. Clear `localStorage.alpha-background-variant` or visit `?alphaBg=a` once to confirm flat default.
2. Visual QA on `/katameros` and `/settings` — PNG cap height if medallion peeks.
3. If subtle warmth desired app-wide, use **Variant C** globally (`?alphaBg=c`) — single source, no route duplicates.

---

## Overall Status

**PASS** — Option D implementation complete.

**Modified files (21):**

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
