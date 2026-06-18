# Hero Swipe + Share Brand Implementation

**Date:** 2026-06-17  
**Scope:** Home hero verse card — swipe stack, compact ledger, branded share pipeline

---

## Executive Summary

Implemented swipe navigation for the home hero card stack while preserving the default index-0 visual layout unchanged. Shrunk the meditation/broadcast ledger cells to reduce image obstruction. Centralized share branding in `alpha-share-brand.ts` with `www.alphacoptic.com`, App Store, and Google Play links in both share text and generated share images. Verse share images now use dynamic font sizing and vertical centering within the image zone. Production build passes.

---

## Findings

### Swipe stack (`HomeVerseHeroStack.tsx`)
- Four cards: verse (0), readings (1), saint (2), feast (3)
- `PEEK_LAYOUT` preserves original static peek arrangement when index = 0
- Touch/mouse drag with velocity threshold; parallax on peek cards; dot indicators
- Front card at index 0 uses identical 92% width / 268px verse card as before

### Compact ledger (`PremiumVerseHeroCard.tsx`)
- `SpiritLedgerCell`: glyph 13px, count 11px, labels 8px/7px
- Container: `rounded-xl`, minimal padding (`px-0.5 py-0.5`, `mt-1.5`)
- Top share/save buttons remain 36px (h-9 w-9) — unchanged from approved design

### Share branding (`alpha-share-brand.ts`)
- **Website:** `www.alphacoptic.com` / `https://www.alphacoptic.com`
- **iOS:** `https://apps.apple.com/app/alpha-coptic`
- **Android:** `https://play.google.com/store/apps/details?id=app.alpha.coptic`
- `alphaShareText()`: verse-first text for "آية اليوم"; footer with site + store URLs
- `buildAlphaShareImage()`: verse-specific layout with `fitFontSize` (64→38px), centered RTL text, reference below, footer band with website + store pills + full URLs
- Generic cards use `buildGenericShareImage()` with same footer

### Home wiring (`home.tsx`)
- Removed duplicate inline `buildShareImage`, `loadImage`, `wrapText`
- Share sheet now uses `buildAlphaShareImage` + `alphaShareText`
- External share URLs (Telegram, Facebook) use `ALPHA_WEBSITE_URL` instead of legacy lovable.app URL

---

## Warnings

- Swipe on non-verse front cards shows daily card UI; visual QA on indices 1–3 recommended on device
- Share image store URLs render at small font in footer — readable on download, may be dense in thumbnail
- Mouse drag on desktop works but primary target is touch; no explicit swipe hint for first-time users

---

## Errors

None. `npm run build` completed successfully (exit 0).

---

## Recommendations

1. Manual device QA: swipe left/right on hero, verify index-0 matches pre-change screenshot
2. Test native share on iOS/Android with generated JPEG attachment
3. Consider removing unused `HeroStack` / `HeroCardView` dead code in `home.tsx` in a separate cleanup pass (out of scope)

---

## Overall Status

**PASS**

---

## Files Touched

| File | Change |
|------|--------|
| `src/components/home/HomeVerseHeroStack.tsx` | Swipe stack logic |
| `src/components/home/PremiumVerseHeroCard.tsx` | Compact ledger, share payload |
| `src/lib/alpha-share-brand.ts` | Share text + canvas image builder |
| `src/routes/home.tsx` | Wired to shared brand module |
