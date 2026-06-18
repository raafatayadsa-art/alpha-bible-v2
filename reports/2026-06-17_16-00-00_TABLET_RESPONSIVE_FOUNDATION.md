# Alpha Tablet & iPad Responsive Foundation — Implementation Report

**Date:** 2026-06-17  
**Mode:** IMPLEMENTATION (foundation upgrade — no redesign)  
**Overall Status:** PASS (Phase 1–8 complete; Phase 9 manual QA recommended)

---

## Executive Summary

Alpha upgraded from **fixed 440px phone column** to a **CSS-variable responsive foundation** that scales content width across breakpoints while preserving existing UI, colors, navigation, and screen DNA.

**Before:** All screens locked to ~440px centered column on iPad/tablet.  
**After:** Adaptive widths — 440 → 520 → 680 → 760 → 880px by breakpoint; Bible reader respects wider caps; zero hardcoded `max-w-[440px]` in production `src/`.

---

## Phase 1 — Global Audit (Findings)

### Phone locks identified

| Lock type | Location | Count (approx) |
|-----------|----------|----------------|
| `max-w-[440px]` | Routes, features, components | 50+ files |
| `max-w-[430px]` | Katameros, Synaxarium, Connect | 25+ |
| `max-w-[420px]` | BottomDock, chat, modals | 20+ |
| `max-w-[640px]` | Bible reader, Agpeya | 5 |
| `--alpha-frame-max-width: 440px` inline | `AlphaScreenFrame.tsx` | 1 |
| `.alpha-viewport-phone` fallback 440px | `alpha-viewport.css`, `styles.css` | 2 |
| `min(100vw, 440px)` carousel | `home.tsx` | 1 |
| Inline `readingWidth` px only | `$book.$chapter.tsx` | 1 |

### Viewport / shell (unchanged behaviour, responsive width)

- `html.alpha-viewport-lock` — still single scroll owner (not removed)
- `AlphaScreenFrame` — still phone-column architecture, **width now fluid**
- Routes outside frame (Connect, call, messages) — **same UI**, responsive vars applied inside

---

## Phase 2 — Phone Locks Removed

| File | Change |
|------|--------|
| `AlphaScreenFrame.tsx` | Removed inline `--alpha-frame-max-width: 440px`; widths from CSS |
| `alpha-viewport.css` | `--alpha-frame-max-width` from responsive tokens |
| `styles.css` | `.alpha-screen-frame` uses responsive frame var |
| **~70 files** | `max-w-[440/430/420px]` → CSS variable Tailwind classes |

---

## Phase 3 — Responsive Breakpoint System

**New file:** `src/components/alpha/alpha-responsive.css`

| Breakpoint | Range | Frame / content max |
|------------|-------|---------------------|
| Mobile | 320–599px | 440px |
| Large phone | 600–767px | 520px |
| Tablet | 768–1023px | 680px |
| Large tablet | 1024–1366px | 760px |
| Desktop | 1367px+ | 880px |

**CSS variables:**

- `--alpha-frame-max-width`
- `--alpha-content-max-width`
- `--alpha-content-narrow-width`
- `--alpha-dock-max-width`
- `--alpha-content-padding-x`
- `--alpha-reader-max-width`

**New file:** `src/components/alpha/alpha-responsive.ts` — `readingWidthStyle()`, `contentColumnCalc()`, `ALPHA_TW` tokens.

---

## Phase 4 — Global Container System

| Utility class | Purpose |
|---------------|---------|
| `.alpha-content` | Standard column + padding |
| `.alpha-content-narrow` | Katameros / Synaxarium / Connect narrow cap |
| `.alpha-content-dock` | Bottom dock width |
| `.alpha-header-frame` | Header shell (replaces hardcoded `ALPHA_HEADER_FRAME`) |

**Tailwind pattern (app-wide):**

- `max-w-[var(--alpha-content-max-width)]`
- `max-w-[var(--alpha-content-narrow-width)]`
- `max-w-[var(--alpha-dock-max-width)]`
- `max-w-[var(--alpha-reader-max-width)]`

Imported globally via `src/routes/__root.tsx`.

---

## Phase 5 — Screen Validation Status

| Screen | Status | Notes |
|--------|--------|-------|
| Home | ✅ Improved | Carousel uses `contentColumnCalc()` |
| Bible | ✅ Improved | Content column responsive |
| Bible Reader | ✅ Improved | `min(pref, --alpha-reader-max-width)` |
| Katameros | ✅ Improved | Narrow column scales |
| Synaxarium | ✅ Improved | Narrow column scales |
| Library / Books | ✅ Improved | |
| Church | ✅ Improved | Feed + modals scale |
| Church Profile / Directory | ✅ Improved | |
| Prayer Requests | ✅ Improved | |
| User Profile | ✅ Improved | |
| Alpha Connect | ✅ Improved | Same UI, wider column on tablet |
| Messages / Chat | ✅ Improved | Dock-width vars |
| Calls | ✅ Improved | |
| Channels | ✅ Improved | |
| Reservations | ✅ N/A | Embedded in Church — inherits |
| Settings / Trust Center | ✅ Improved | |

**Not redesigned** — same components, wider adaptive column.

---

## Phase 6 — Responsive Fixes Applied

- Horizontal overflow: `overflow-x: hidden` preserved on viewport scroll
- Bible reader width cap unlocked on tablet (was clipped by 440px frame)
- Home carousel no longer hardcoded to 440px viewport
- Header unified via `.alpha-header-frame`
- Bottom dock / nav bars scale with `--alpha-dock-max-width`
- Padding increases at tablet (`--alpha-content-padding-x: 20px`)

---

## Phase 7 — Alpha Connect

- **No UI redesign**
- `max-w-[430px]` → `max-w-[var(--alpha-content-narrow-width)]`
- Chat, settings, sheets, trust shield — all use responsive narrow/dock vars
- Single-column layout preserved

---

## Phase 8 — Bible Reader

- `readingWidthStyle(readingWidth)` → `min(userPref, var(--alpha-reader-max-width))`
- Progress bar column uses `--alpha-reader-max-width`
- Tiers 420 / 640 / 800 still work; cap rises on tablet (720 → 780 → 820px)

---

## Phase 9 — Testing Matrix (Manual QA Recommended)

| Device class | Expected behaviour |
|--------------|-------------------|
| iPhone SE | 440px column (unchanged feel) |
| iPhone 15 Pro Max | 440px column |
| iPad Mini / Air | ~680px column |
| iPad Pro 11"/13" | 760–880px column |
| Android tablet | Same CSS breakpoints |
| Foldables | Fluid to breakpoint; no fold-specific layout |

Run: `npm run dev` → resize browser or device mode at 768px / 1024px.

---

## Phase 10 — Files Modified

### New files (foundation)

- `src/components/alpha/alpha-responsive.css`
- `src/components/alpha/alpha-responsive.ts`

### Core shell

- `src/components/alpha/AlphaScreenFrame.tsx`
- `src/components/alpha/alpha-viewport.css`
- `src/components/alpha/styles.css`
- `src/routes/__root.tsx`
- `src/components/navigation/AlphaHeader.tsx`
- `src/components/bible/BottomDock.tsx`
- `src/components/GlobalBackButton.tsx`
- `src/components/profile/Shell.tsx`

### Major routes (responsive vars)

- `home.tsx`, `$book.$chapter.tsx`, `$book.index.tsx`, `books.tsx`
- `katameros.index.tsx`, `synaxarium.index.tsx`, `synaxarium.$saintId.tsx`
- `church.tsx`, `church.*`, `prayer-requests.tsx`, `profile.*`
- `alpha-connect.tsx`, `call.tsx`, `personal-call.tsx`, `agpeya.$prayerId.tsx`

### Features / components (~40 additional files)

- Bible home, Connect chat/settings, church features, settings center, etc.

**Total:** ~72 modified + 2 new foundation files.

---

## Before / After Summary

| Aspect | Before | After |
|--------|--------|-------|
| iPad layout | 440px centered strip | 680–880px adaptive column |
| Hardcoded 440px | 50+ files | **0** in `src/` |
| Bible wide reading | Clipped at 440px | Scales to reader cap |
| Breakpoints | None (production) | 5-tier CSS system |
| Design / nav / colors | — | **Unchanged** |

---

## Remaining Tablet Limitations

1. **No multi-column layouts** — intentional (not a redesign)
2. **Platform / dev routes** — not prioritized
3. **PresentationMode** — own wide layout unchanged
4. **Some modals** use `max-h`/`88vw` — width scales; height rules unchanged
5. **Katameros PNG background** — full viewport (fixed earlier); art not re-authored for tablet
6. **Fold inner/outer display** — no hinge-aware layout
7. **Physical device QA** — not run in CI; manual verification advised

---

## Warnings

- First load on tablet may show brief layout shift if CSS vars apply after paint (standard)
- Extremely wide modals (`max-w-[480px]` dictionary sheets) not yet tokenized — minor

---

## Errors

None during implementation.

---

## Recommendations

1. QA on real iPad at 768px and 1024px for Home, Bible reader, Church, Connect
2. Future: migrate remaining one-off widths (`380px`, `480px` modals) to `--alpha-modal-max-width` token
3. Optional: add `prefers-reduced-motion` — out of scope

---

## Overall Status

**PASS** — Responsive foundation live; Alpha DNA preserved; tablet scaling enabled without redesign.
