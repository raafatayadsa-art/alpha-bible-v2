# Global Dark Mode Fix

**Date:** 2026-06-26  
**Scope:** App-wide dark theme — viewport shell, legacy parchment remap, pilot route migrations

---

## Executive Summary

Dark mode was only visible on the home screen because the viewport system (`alpha-viewport.css`) hardcoded ivory `#f4ead8` on `<html>`, `body`, and `.alpha-viewport-root--shell`, overriding `data-theme="dark"`. This fix wires the shell to semantic tokens, adds global legacy remaps for common parchment/brown Tailwind classes, updates `AlphaBackground` for dark gradients, and migrates high-traffic route roots to `bg-alpha-base` / `text-alpha`.

**Overall Status: PASS** (build verified)

---

## Findings

1. **Root cause confirmed:** `AlphaViewportSync` applies `alpha-viewport-bg-shell` on almost all routes; CSS used fixed `#f4ead8`, ignoring `--alpha-bg-base`.
2. **AlphaBackground** applied light radial gradients via inline `backgroundImage`, washing out dark navy shell.
3. **Hundreds of screens** still use hardcoded `bg-[#f4ead8]`, `text-[#3a2a18]`, etc. — invisible or low-contrast in dark mode.
4. **Theme bootstrap** (`AlphaThemeBootstrap` in `__root.tsx`) was already global; the issue was CSS overrides, not missing bootstrap.

---

## Changes Applied

### Viewport & shell (global)
- `src/components/alpha/alpha-viewport.css` — shell/messaging backgrounds → `var(--alpha-bg-base)` + `color: var(--alpha-text)`
- `src/components/alpha/alpha-responsive.css` — tablet shell override → theme var
- `src/styles.css` — `.alpha-messaging-bg`, `.alpha-chat-bg` → theme vars

### Theme layer
- `src/lib/alpha-theme/alpha-theme.css`:
  - Global `html`/`body` background + text from tokens
  - Dark mode legacy remap for parchment backgrounds (`#f4ead8`, `#faf8f3`, `#fbf3e1`, etc.)
  - Dark mode legacy remap for brown text → `--alpha-text-heading` (gold/parchment)
  - Border remaps for ivory borders
  - Katameros glass surfaces (`#faf6ec/*`)
  - Dark shell overlay on `[data-alpha-background]` with `!important`

### Components
- `src/components/alpha/AlphaBackground.tsx` — skip light gradients when `isDark`; CSS overlay applies
- `src/features/katameros/components/KatamerosScreenBackground.tsx` — variant A uses `var(--alpha-bg-base)`
- `src/features/bible-v2/components/BibleV2Screen.tsx` — `bg-alpha-base text-alpha`, theme-aware watermark fade

### Route roots migrated
- `church.tsx`, `agpeya.index.tsx`, `search.tsx`, `prayer-requests.tsx`, `profile.contributions.tsx`, `$book.index.tsx`

---

## Warnings

1. **Inline styles** (e.g. Bible V2 header `style={{ color: bibleV2Tokens.navy }}`) are not remapped — navy text may stay dark on dark cards until those components migrate to tokens or `useResolvedTheme()`.
2. **Legacy CSS remap** uses `!important` on Tailwind arbitrary classes — safe for dark mode but should be retired as screens migrate to semantic utilities (`bg-alpha-base`, `text-alpha`, etc.).
3. **Agpeya prayer cards** keep per-prayer light gradients in dark mode (intentional accent DNA) — only shell/base text is theme-aware.
4. **Control Center / Katameros PNG backgrounds** still show parchment art in dark mode with light tint — acceptable for now; optional future: dark overlay or alternate asset.

---

## Errors

None. `npm run build` — **PASS**.

---

## Recommendations

1. Continue migrating route roots: `church.archive`, `church.service`, `onboarding`, publisher routes — replace `bg-[#f4ead8]` with `bg-alpha-base`.
2. Add `useBibleV2ThemeTokens()` hook for inline-style Bible V2 components.
3. Audit `features/agpeya/states.tsx` and `agpeya.$prayerId.tsx` local `dark` prop vs global `themeMode` for consistency.
4. Remove legacy remap block once grep for `#f4ead8` / `#3a2a18` in `src/` is near zero.

---

## Verification Checklist

- [ ] Settings → Dark mode → Home: navy shell, gold headings
- [ ] Church, Bible hub, Agpeya hub, Search, Profile: navy shell (not ivory)
- [ ] Profile: stats bar, membership card, glyphs readable in dark
- [ ] Katameros hub + reading: shell dark; text gold/parchment
- [ ] Bible reader chapter screen: existing pilot tokens still work
- [ ] Light mode: no regression on ivory DNA
