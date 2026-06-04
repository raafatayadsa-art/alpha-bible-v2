
# Agpeya Reader — Prayer Journey Update

Scope: edit ONE file — `src/routes/agpeya.$prayerId.tsx`. No route changes, no data-shape changes, no edits to Home, Bottom Nav, Bible Reader, Dictionary, or Highlights.

## What changes

### 1. Replace top tabs with a fixed Section Progress Nav
- Today: 5 tabs (`نص الصلاة / المزامير / الإنجيل / القطع / معلومات`) split the prayer into 5 separate scroll views.
- New: tabs row is removed. The prayer renders as ONE continuous scroll containing all sections in this order:
  1. مقدمة الساعة (from `tabs.text.body`, first paragraph)
  2. صلاة الشكر (from `tabs.text.body`, remaining paragraphs)
  3. المزمور ٥٠ (only if present — fallback skip)
  4. المزامير (from `tabs.psalms`)
  5. الإنجيل (from `tabs.gospel`)
  6. القطع (from `tabs.fragments`)
  7. قانون الإيمان (static fragment if `creed` is in fragments, else skipped)
  8. التحليل / الختام (from `tabs.info` rendered as closing meta card)
- A **sticky chip rail** below the header replaces the tab pill row. Each chip is a section anchor:
  - Tap → smooth-scrolls to that section.
  - Active chip auto-highlights based on IntersectionObserver of section headers.
  - Horizontally scrollable, RTL, with the active chip auto-centered into view.
- The existing thin top progress bar stays (overall scroll %).

### 2. Reading cards (Bible-Reader philosophy)
- Each section becomes its own card with soft elevation, glass border, generous spacing — matches the existing `GlassSurface` look from `src/components/bible/primitives.tsx`.
- Psalms: one card per psalm (already structured — extract from existing `PsalmsTab`).
- Gospel: one card per pericope (already structured).
- Fragments: one card per fragment (already structured).
- Text body: split paragraphs into 1–2 cards (intro / صلاة الشكر).
- Info: single closing "معلومات الصلاة" card.
- Each card keeps existing typography (`font-arabic-serif`, `fontSize`, `lineHeight` from reader settings).

### 3. Remove in-reader search
- Delete the search icon button, the expandable search bar, `searchOpen`, `query`, `matchCount`, `navigateToScrollNextMatch`, and `<Highlighted>` highlight wrapping. Render plain text instead.
- Imports of `Search`, `ChevronUp`, `ChevronDown`, `splitForHighlight` removed.

### 4. Keep & polish bottom reading controls
- Existing floating control pill (font size, theme, line height, speed, play/pause) is preserved.
- Visual polish only: stronger glass blur, slightly larger touch targets (min 40px), refined shadow, safe-area aware (already uses `env(safe-area-inset-bottom)`).

### 5. Swipe navigation
- Add touch handlers on the scroll container:
  - Swipe Left (RTL: dx < −60, |dy| < 40) → navigate to `next` prayer.
  - Swipe Right (dx > 60) → navigate to `prev` prayer.
- Existing prev/next bottom buttons remain as backup.

### 6. iPhone-first layout & safe areas
- Container width capped at `max-w-[560px]` (was 640px), `px-4` reading gutters.
- Header padding uses `pt-[max(env(safe-area-inset-top),0.5rem)]` to clear notch / Dynamic Island.
- Floating controls already use `env(safe-area-inset-bottom)`; bump min spacing.
- Section padding bottom increases (`pb-44`) so last card clears controls + bottom nav.

### 7. Coptic identity (subtle)
- Keep the existing faint `CopticCross` watermark.
- Add small Ⲁ / Ⲱ glyphs as decorative chip dividers in the section nav (very low opacity).
- Section card headers get a tiny Coptic cross icon (already used in PsalmsTab pattern).
- No new clutter.

### 8. Preserved — DO NOT touch
- Routes (`/agpeya/$prayerId`).
- Share menu + Telegram/WhatsApp/copy-link flow.
- Save (bookmark) flow.
- Bottom nav, Home, Bible Reader, Dictionary, Highlights.
- Prayer data structure (`AgpeyaPrayer` / `tabs` map) — only the rendering changes; tabs are flattened in the component, not in data.
- Continue-reading storage (`savePrayerPosition`) — keep saving scroll %, drop the `tab` field by always writing `tab: availableTabs[0]` for backward compat.

## Technical sketch

```text
PrayerReader()
├── header (sticky, safe-area top)
│   ├── back / title / [share, save]   ← no search button
│   ├── SectionNav (chip rail, sticky, IntersectionObserver-driven active)
│   └── thin progress bar (scroll %)
├── main (scroller, onTouchStart/End for swipe)
│   ├── Coptic watermark
│   ├── Draft notice
│   ├── <SectionCard id="intro">         intro paragraph
│   ├── <SectionCard id="thanksgiving">  remaining text paragraphs
│   ├── <SectionCard id="psalm-50">      if present
│   ├── <SectionCard id="psalms">        map → one card per psalm
│   ├── <SectionCard id="gospel">        map → one card per pericope
│   ├── <SectionCard id="fragments">     map → one card per fragment
│   ├── <SectionCard id="creed">         if available
│   └── <SectionCard id="info">          closing meta
│   └── Prev / Next prayer buttons (kept)
└── floating reading controls (kept, polished)
└── Share dialog (kept)
```

### Section list derivation
```ts
const sections = useMemo(() => buildSections(prayer), [prayer]);
// returns [{ id, label, render: () => JSX }] filtered to non-empty
```
`SectionNav` and the article map over the same `sections` array — single source of truth.

### Active section tracking
`IntersectionObserver` on each `<section id={id}>` with `rootMargin: "-30% 0px -60% 0px"` → sets `activeId` → chip rail scrolls active chip into view via `scrollIntoView({ inline: "center" })`.

### Swipe
```ts
const start = useRef<{x:number;y:number}|null>(null);
onTouchStart = e => start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
onTouchEnd = e => {
  if (!start.current) return;
  const dx = e.changedTouches[0].clientX - start.current.x;
  const dy = e.changedTouches[0].clientY - start.current.y;
  if (Math.abs(dy) < 40 && Math.abs(dx) > 60) {
    if (dx < 0 && next) navigate({ to: "/agpeya/$prayerId", params: { prayerId: next.id }});
    if (dx > 0 && prev) navigate({ to: "/agpeya/$prayerId", params: { prayerId: prev.id }});
  }
  start.current = null;
};
```

## Risks
- Section nav IntersectionObserver must be cleaned up on prayer change.
- Swipe must not trigger on small horizontal text drags (60px threshold + vertical guard mitigates).
- Removing search state requires removing all dependent code (highlight, match nav) — straightforward but file is large; surgical line edits.

## Out of scope
Bottom nav, Home, Bible Reader, Dictionary, Highlight system, data shape, routes, Supabase, audio playback.
