# Search Button Unification — Alpha Bible

**Date:** 2026-06-17  
**Scope:** App-wide header search button shape and expand/collapse UX (home standard)

---

## Executive Summary

Unified the home-screen search control across Alpha Bible by introducing shared components (`AlphaExpandableSearchBar`, `AlphaSearchButton`) and wiring them into `AlphaHeader` and other custom headers. Collapsed state now consistently uses `ALPHA_HEADER_BTN` (h-11 glass circle, Search icon strokeWidth 2.2). Expandable bar UX matches the home screen on all `AlphaHeader` routes plus Bible and Audio hubs.

---

## Findings

### New shared components

| Component | Path | Role |
|-----------|------|------|
| `AlphaExpandableSearchBar` | `src/components/navigation/AlphaExpandableSearchBar.tsx` | Collapsed circle + expandable cream glass bar; `tone="light" \| "dark"` |
| `AlphaSearchButton` | same file | Collapsed-only trigger for overlay/open handlers |
| `HomeExpandableSearchBar` | re-export alias | Backward compatibility |

### AlphaHeader integration

- All screens using `AlphaHeader` now get expandable search automatically.
- Submit behavior:
  - `searchScope` → contextual overlay via `openSearchWithQuery(q)`
  - `onSearchClick` → parent callback (Synaxarium, etc.)
  - default → navigate to `/search` with optional `?q=`
- When expanded: title/center and notifications hide (same as home).

### Updated custom headers

| Screen | Change |
|--------|--------|
| Home (`home.tsx`) | Uses `AlphaExpandableSearchBar` |
| Bible hub (`BibleHeader.tsx`) | Full expandable; submit opens bible contextual search |
| Audio (`AudioHeader.tsx`) | Full expandable; submit navigates to `/search` |
| Feasts | `AlphaSearchButton` (opens existing overlay) |
| Profile messages | `AlphaSearchButton` |
| Books list / Books V2 | `AlphaSearchButton` (opens bible search) |

### Hook enhancement

- `useContextualSearch` exports `openSearchWithQuery(initial)` for header submit with pre-filled query.

### Intentionally unchanged

- **Alpha Connect** messaging search (`ConnectMessagesSearchBar`) — dark neon theme, separate product surface.
- **Inline search fields** (directory, control center, overlay inputs) — not header buttons.
- **Dev preview headers** — debug-only routes.

---

## Warnings

- Screens with `onSearchClick` only (e.g. Synaxarium) still open their overlay on submit without passing header query into the overlay; behavior matches prior click-to-open flow.
- Feasts / profile messages use collapsed button only; expandable bar can be added later if desired.

---

## Errors

None during implementation.

---

## Recommendations

1. Optionally pass header query into Synaxarium/feasts overlays on submit for smoother UX.
2. Consider `AlphaSearchButton` for notification buttons on feasts header (h-10 → h-11) for full header icon parity.
3. Run visual QA on Katameros, Synaxarium, Profile, Church, and Audio after deploy.

---

## Overall Status

**PASS** — Shared search DNA applied across primary Alpha Bible headers without redesigning approved layouts.
