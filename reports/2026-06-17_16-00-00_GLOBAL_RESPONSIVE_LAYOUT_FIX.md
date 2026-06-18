# Global Responsive Layout Fix

**Date:** 2026-06-17  
**Scope:** Alpha Bible — app-wide fluid viewport behavior (layout only, no redesign)

---

## Executive Summary

Removed the fixed mobile-column width cap (440px–880px) that caused every screen to appear as a centered narrow phone layout inside larger viewports with beige side margins. The Alpha responsive foundation now uses **100% viewport width** with fluid horizontal padding. Chapter reader header negative-margin hacks were removed in favor of aligned full-width containers.

**Overall Status: PASS**

---

## Findings

### Root cause
- `alpha-responsive.css` defined `--alpha-frame-cap` tiers (440px → 880px) applied via `--alpha-frame-max-width`, limiting all framed screens.
- `.alpha-viewport-phone` in `alpha-viewport.css` enforced `max-width: var(--alpha-frame-max-width)` with `margin-inline: auto`, producing side gutters on tablet/desktop.
- Chapter reader (`$book.$chapter.tsx`) used `-mx-3 w-[calc(100%+1.5rem)]` to bleed the header outside a narrow column — a symptom of the capped layout.

### Changes applied

| File | Change |
|------|--------|
| `src/components/alpha/alpha-responsive.css` | Removed frame caps; set `--alpha-frame-max-width`, `--alpha-content-max-width`, `--alpha-content-narrow-width` to `100%`; reader/dock use `calc(100vw - 2 * padding)`; added `.chapter-reader-header__title-slot` with clamp-based insets |
| `src/components/alpha/alpha-viewport.css` | `.alpha-viewport-phone` → `max-width: 100%` |
| `src/components/alpha/alpha-responsive.ts` | Updated `ALPHA_FRAME_MAX_WIDTH_MOBILE`, `contentColumnCalc()` for fluid widths |
| `src/components/alpha/AlphaScreenFrame.tsx` | Documented fluid `maxWidth: "100%"` |
| `src/routes/$book.$chapter.tsx` | Full-width header/content via `--alpha-content-padding-x`; removed negative margins; toolbar uses `alpha-toolbar-row` + responsive title slot |

### Behavior after fix
- **Mobile portrait/landscape:** Content fills width minus safe padding.
- **Tablet:** Verse reading area and cards expand horizontally; fewer forced line wraps.
- **Header:** Width matches content column; title slot uses `clamp()` insets to avoid button overlap.
- **Scroll:** Remains on `.alpha-viewport-scroll` — no hardcoded scrollbar position.
- **All framed routes:** Inherit fluid behavior through `AlphaScreenFrame` + CSS variables.

---

## Warnings

- User reading-width preference (`readingWidthStyle` / `reading-state.ts` default 640px) still caps verse text when user selects a narrow reading width — intentional typography control, not a layout frame cap.
- Some component-local max-widths remain (e.g. modals `max-w-[380px]`, dev preview panels) — these are overlay/dialog constraints, not app shell columns.
- `ALPHA_SCREEN_FRAME.maxWidth` changed from numeric `440` to `"100%"` — only used as documentation constant; no runtime breakage found.

---

## Errors

None. `npm run build` completed successfully.

---

## Recommendations

1. **Visual QA:** Spot-check home, katameros, agpeya, church, and profile on iPad portrait/landscape in dev tools.
2. **Future screens:** Use `.alpha-content`, `.alpha-header-frame`, `.alpha-toolbar-row`, and `--alpha-content-padding-x` — avoid hardcoded `max-w-[440px]` or negative margin bleed patterns.
3. **Optional follow-up:** If verse lines feel too wide on large desktop monitors, consider a user-controlled reading width (already in prefs) rather than reintroducing a global frame cap.

---

## Overall Status

**PASS** — Global responsive foundation updated; chapter reader aligned; build green.
