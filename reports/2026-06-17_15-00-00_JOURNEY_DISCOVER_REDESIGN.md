# Journey Discover Section Redesign

**Date:** 2026-06-17  
**Scope:** Home "اكتشف رحلتك اليوم" premium redesign

---

## Executive Summary

Redesigned the primary journey discovery row to match the premium DNA of the verse hero card: gold-accent borders, inset glow, badge pills, Coptic glyphs, and liturgical footer cues. Extracted into `HomeJourneyDiscover` component.

---

## Findings

### New component (`HomeJourneyDiscover.tsx`)
- Section header: "بوابات ألفا الروحية" + door count badge
- Cards: 176px height, 84vw peek scroll, snap alignment
- Per card: accent border, hero-style gradient, inset rim, Ⲁ/Ⲱ gold glyph, Sparkles badge (كتاب/أجبية/…)
- Footer row: gradient rule + "ادخل الرحلة" pill + Coptic cross
- Scroll hint track + "اسحب لاستكشاف كل الأبواب"

### Home integration
- Replaced inline `PrimaryArtCardCompact` section
- Removed dead `PrimaryArtCardCompact` / `PrimaryArtCardFull` from `home.tsx`
- Same 9 journey items and routes preserved

---

## Warnings

None.

---

## Errors

None. Build passes.

---

## Recommendations

1. Device QA: horizontal scroll peek and tap targets on small phones
2. Consider highlighting "last visited" door with subtle gold ring

---

## Overall Status

**PASS**
