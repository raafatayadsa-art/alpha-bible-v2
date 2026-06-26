# Alpha Theme System V1 — Light/Dark Pilot

**Date:** 2026-06-26  
**Scope:** Global theme bootstrap, semantic tokens, Home + Dock + Bible Reader pilot

---

## Executive Summary

Implemented the first unified Alpha light/dark theme layer. `themeMode` from settings now applies `data-theme` and `.dark` on `<html>`. Semantic CSS variables (`--alpha-*`) drive shell background, home chrome, bottom dock, and Bible reader. Build: **PASS**.

---

## Findings

### 1. Theme Bootstrap
- New module: `src/lib/alpha-theme/`
  - `resolve-theme.ts` — resolves `light` | `dark` | `system`
  - `apply-theme.ts` — writes `data-theme` + `.dark` on `<html>`
  - `AlphaThemeBootstrap.tsx` — mounted in `__root.tsx`
  - `use-resolved-theme.ts` — hook for components
- Inline boot script in `RootShell` prevents FOUC on first paint
- `settings-store.write()` applies theme immediately on save

### 2. Semantic Tokens (`alpha-theme.css`)
- Light: ivory `#f4ead8`, burgundy headings, gold accents
- Dark: navy `#08131f`, parchment text, gold glow
- Utilities: `text-alpha`, `text-alpha-heading`, `bg-alpha-reader`, `alpha-chrome-btn`, etc.
- Dock CSS vars switch between ivory glass (light) and dark glass (dark)
- Shadcn `--background` / `--foreground` aligned with Alpha palette

### 3. Pilot Migrations
| Surface | Change |
|---------|--------|
| **Home** | Header button, section titles, media player bar → semantic classes |
| **AlphaBackground** | Uses `var(--alpha-bg-base)`; dark shell overlay via CSS |
| **Bottom dock** | `alpha-dock-system.css` reads `--alpha-dock-*` tokens |
| **Bible Reader** | Follows global theme; night toggle patches `themeMode` in settings |
| **Control Center** | Dark toggle reflects resolved theme (incl. system) |

### 4. Reader Integration
- Removed local `spiritualMode` state
- `spiritualMode = useResolvedTheme() === "dark"`
- Reading control bar moon toggle → `patch("themeMode", ...)`

---

## Warnings

- Many screens still use hardcoded hex (church, profile, kholagy, vaults, hero cards) — not migrated in V1
- `themeMode: "system"` is supported in resolver but Control Center toggle only sets `light`/`dark` (no system option in UI yet)
- Share sheet on home remains dark-by-design (intentional cinematic overlay)
- Hero cards remain dark glass regardless of theme (by design)

---

## Errors

None. `npm run build` exit code 0.

---

## Recommendations

1. **Phase 2:** Migrate `church.tsx`, `ProfilePremiumScreen`, Bible v2 hub to `--alpha-*` tokens
2. Add **System** option to Control Center appearance section (3-way: light / dark / system)
3. Map module accents (kholagy purple, church blue) as `--alpha-accent-*` without full palette forks
4. Optional: Tailwind `@theme` registration for `bg-alpha`, `text-alpha` as first-class utilities
5. Vault screens (saved/journal): add light variant using same token layer

---

## Overall Status

**PASS** — Core theme infrastructure live; pilot surfaces migrated; build green.

---

## Key Files

- `src/lib/alpha-theme/alpha-theme.css`
- `src/lib/alpha-theme/AlphaThemeBootstrap.tsx`
- `src/routes/__root.tsx`
- `src/features/settings/settings-store.ts`
- `src/routes/home.tsx`
- `src/components/alpha/alpha-dock-system.css`
- `src/routes/$book.$chapter.tsx`
