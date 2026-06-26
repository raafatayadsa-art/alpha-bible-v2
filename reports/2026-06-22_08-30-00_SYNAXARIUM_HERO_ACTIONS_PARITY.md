# Synaxarium Hero Actions — Verse Card Parity

## Executive Summary

Extracted the approved Alpha verse-card hero action controls into reusable primitives and applied them to Synaxarium like/share (home hero card) and share/save (saint detail hero). Build passes.

## Findings

- **Source of truth:** `HeroCardTopBar` in `src/components/home/hero-card-chrome.tsx` — circular glass share + toggle buttons (36px), dark overlay, gold accent `#e7c97a`.
- **New exports:**
  - `ALPHA_HERO_ACCENT`
  - `AlphaHeroShareButton`
  - `AlphaHeroToggleButton`
  - `AlphaHeroActionBar` (share · badge · toggle layout)
- **`HeroCardTopBar`** now delegates to `AlphaHeroActionBar` — verse card behavior unchanged.
- **`SaintDynamicHeroCard`:** Pill like/share removed; `AlphaHeroActionBar` overlaid on hero with Heart toggle + Share; badge «قديس اليوم».
- **`synaxarium.$saintId.tsx`:** Header share/save removed; hero uses `AlphaHeroActionBar` (Bookmark save); duplicate bottom share/save row removed; native share wired on hero share tap.

## Warnings

- Like state on home hero card remains session-local (not persisted) — same as before.
- Coptic date chip removed from detail hero image (still shown in page body below hero).

## Errors

None. `npm run build` — PASS.

## Recommendations

- Reuse `AlphaHeroActionBar` on other hero surfaces (Books, Journey) for consistent Alpha DNA.
- Optionally persist saint «like» to favorites store if product wants parity with save.

## Overall Status

**PASS**
