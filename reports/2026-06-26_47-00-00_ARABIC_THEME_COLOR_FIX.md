# Arabic Encoding + Theme Color Migration

**Date:** 2026-06-26  
**Scope:** `home.tsx`, `church.tsx`, `katameros.index.tsx`, `HomeJourneyDiscover.tsx`

---

## Executive Summary

Completed the interrupted "نفذ" task: restored correct Arabic text on the home screen, removed orphaned inline share-sheet code, wired global `openAlphaShareSheet`, and migrated hardcoded brown/muted text and parchment surfaces on church and katameros screens to semantic Alpha theme tokens. Production build passes.

---

## Findings

### Home (`src/routes/home.tsx`)
- **Arabic mojibake fixed** — UTF-8 restored via git checkout + selective merge; titles like `الكتاب المقدس` render correctly.
- **Removed dead code** — `ShareSheetHost`, `DockItem`, and orphaned `getShareBlob`/`shareText` fragments deleted (~160 lines).
- **Share unified** — `HeroCardView` now calls `openAlphaShareSheet` (global host in `__root.tsx`).
- **Modern home preserved** — `ProfileSettingsMenu`, `KholagyHomeCard`, `ChurchDirectoryHomeCard`, `SmartContextCard`, `usePlatformModules` filtering, `BottomDock`.
- **Unused import removed** — `supabase` (no longer referenced).

### HomeJourneyDiscover (`src/components/home/HomeJourneyDiscover.tsx`)
- Already migrated: `text-alpha-heading`, `text-alpha-heading-muted`, `text-alpha-gold-bright`, `border-alpha`, `bg-alpha-surface`.

### Church (`src/routes/church.tsx`)
- Root already had `bg-alpha-base text-alpha`.
- **11×** `text-[#3a2a18]` → `text-alpha-heading`
- **6×** `text-[#6a543a]` → `text-alpha-muted`
- Hero cards, priest overlays, and accent gradients intentionally keep decorative hardcoded colors.

### Katameros (`src/routes/katameros.index.tsx`)
- **3 root shells** → `bg-alpha-base text-alpha`
- **8×** `text-[#3a2a18]` → `text-alpha-heading`
- **7×** `text-[#6a543a]` → `text-alpha-muted`
- **10×** `bg-[#faf6ec]` → `bg-alpha-surface` (with opacity modifiers preserved)
- **10×** `border-[#d4c4a8]` → `border-alpha`
- **1×** `text-[#9a6b2e]` → `text-alpha-gold`

### Build
- `npm run build` — **PASS** (exit 0)

---

## Warnings

1. **~70% of routes** still use legacy hardcoded parchment/brown Tailwind classes; `alpha-theme.css` dark remaps help Tailwind classes but not inline `style={{ color }}` tokens (e.g. Bible V2).
2. **Church decorative surfaces** (`bg-[#fbf3e1]`, hero gold overlays) not fully tokenized — acceptable for card art parity.
3. **Agpeya / synaxarium / feasts** not migrated in this pass.

---

## Errors

None.

---

## Recommendations

1. Continue phased migration: `synaxarium.*`, `feasts.*`, `agpeya.index` card accents.
2. Migrate `bibleV2Tokens` and `hero-card-chrome.tsx` active-tab color to CSS variables.
3. Add a lint rule or codemod to flag new `text-[#3a2a18]` / `bg-[#faf6ec]` usage.

---

## Overall Status

**PASS**
