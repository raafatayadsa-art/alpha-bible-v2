# Plan: Synaxarium Saint Details Screen

Rebuild `src/routes/synaxarium.$saintId.tsx` into a complete premium saint biography page. UI-only, reuses the existing Alpha DNA (warm beige `#f4ead8`, ivory glass cards, gold `#b8893a`, purple `#6a4ab5`, RTL Arabic, ≤430px, iPhone safe areas). No backend, no new colors, no changes to navigation / bottom dock / other screens.

## Scope

- Replace the current `src/routes/synaxarium.$saintId.tsx` body with the new full layout.
- Extend `src/features/synaxarium/types.ts` and `data.ts` with extra optional fields used only by this screen: `era`, `type`, `servicePlace`, `occasion`, `virtues[]`, `timelineSections[]` (birth / service / key events / repose), `relatedPrayers[]`, `relatedMeditations[]`, `relatedEvents[]`, `similarSaints[]`. Backfill the 3 existing saints with sensible mock content. No breaking changes — the saint-details route is the only consumer of the new fields.
- Reuse existing primitives: `GlassSurface`, `BackButton`, `IconBadge`, `Pressable`, `CopticCross`, `CopticWatermark`, `CopticSeparator`, `Timeline` / `TimelineItem`. No new shared components unless trivially local to the route file.

## Screen structure (top → bottom)

```text
┌─ Header (sticky-feel, safe-area top) ─────────────┐
│ [Back]              السنكسار              [Share][Save]│
├───────────────────────────────────────────────────┤
│ Hero card                                          │
│  • Large saint portrait (16:11), gradient fade     │
│  • Coptic Ⲁ/Ⲱ watermark in corner                  │
│  • Saint name (display serif, purple)              │
│  • Saint title (gold, smaller)                     │
│  • Coptic feast date chip + Gregorian              │
├───────────────────────────────────────────────────┤
│ Quick info 4-tile grid                             │
│  النوع | العصر | مكان الخدمة | المناسبة            │
├───────────────────────────────────────────────────┤
│ Quote card (gold quote marks, centered)            │
├───────────────────────────────────────────────────┤
│ Biography section "السيرة"                          │
│  • Long-form reading layout, GlassSurface,         │
│    paragraph rhythm, drop-cap on first letter      │
├───────────────────────────────────────────────────┤
│ Coptic separator                                   │
├───────────────────────────────────────────────────┤
│ Timeline "محطات من حياته"                          │
│  • Vertical Timeline w/ 4 phases:                  │
│    الميلاد · الخدمة · أحداث مهمة · النياحة         │
│  • Each item: small icon + phase label + body      │
├───────────────────────────────────────────────────┤
│ Virtues "فضائله"                                   │
│  • Horizontal scroll of small premium chips/cards: │
│    الإيمان · الصلاة · المحبة · الاتضاع · الصبر     │
├───────────────────────────────────────────────────┤
│ Related content "محتوى مرتبط"                       │
│  • 2×2 grid of GlassSurface tiles:                 │
│    صلوات · تأملات · مناسبات · قديسون مشابهون       │
├───────────────────────────────────────────────────┤
│ Bottom actions                                     │
│  [مشاركة السيرة]  [حفظ]                            │
│  [قراءة سنكسار اليوم] (primary, full-width)         │
└───────────────────────────────────────────────────┘
                (BottomDock — untouched, global)
```

## Interaction & motion

Same iPhone-style motion already established in Feasts/Synaxarium home:
- All tap targets ≥44px, `active:scale-[0.97]`.
- Cards: `transition duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)]`, soft hover shadow, no aggressive movement.
- Save button toggles local React state (visual only); share button is a visual stub (no Web Share API wiring in this task).

## Coptic identity

- Single `CopticWatermark` behind hero (already used).
- `CopticCross` icon in the section dividers and timeline dots.
- Ⲁ / Ⲱ markers used sparingly: one pair on the hero corners, one as ornament above the quote.

## Files touched

- `src/routes/synaxarium.$saintId.tsx` — full rewrite of the component body, keeping `Route` export + `head()` shape.
- `src/features/synaxarium/types.ts` — add optional fields listed above.
- `src/features/synaxarium/data.ts` — backfill mock content (era, virtues, related lists, timeline phases) for the 3 existing saints.

## Out of scope

- No edits to Home, Bible, Agpeya, Feasts, BottomDock, branding, or color tokens.
- No new routes; related-content tiles are visual only (no navigation targets yet).
- No new image assets — reuse existing `saint-shenouda.jpg` / `saint-antony.jpg`.
- No Supabase, API, share sheet, or persistence.
