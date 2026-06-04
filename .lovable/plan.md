# Plan: Synaxarium + Feasts & Events modules

Add two new feature areas to Alpha Bible. UI-only. No changes to Home, Bible Reader, Agpeya, Bottom Navigation, or branding. Reuses the existing Alpha DNA: warm beige bg (`#f4ead8`), ivory cards, gold (`#b8893a` / `#e7c97a`), purple (`#6a4ab5` / `#a78bd9`), glass surfaces, RTL Arabic, iPhone-first widths (≤430px), safe-area aware.

## New routes (TanStack file-based)

```
src/routes/
  synaxarium.index.tsx        -> /synaxarium      (home)
  synaxarium.$saintId.tsx     -> /synaxarium/:id  (saint details)
  feasts.index.tsx            -> /feasts          (home)
  feasts.$eventId.tsx         -> /feasts/:id      (event details)
```

Each route file uses `createFileRoute` with `head()` metadata (Arabic title + description). RTL via `dir="rtl"`. Outer container: `min-h-dvh bg-[#f4ead8]` + safe-area top padding. Content wrapper capped at `max-w-[430px] mx-auto`. Bottom padding leaves room for existing `BottomDock` (rendered globally — not touched).

## New feature folder

```
src/features/synaxarium/
  data.ts        -> typed mock saints + events (static arrays, in-memory)
  types.ts       -> Saint, FeastEvent, TimelineNode types
  index.ts
src/features/feasts/
  data.ts
  types.ts
  index.ts
```

Mock data: ~8 saints, ~8 feasts with Arabic names, Coptic-calendar dates, short bio, quote + reference, life events array, color tag. No fetch, no Supabase.

## New shared components

```
src/components/coptic/
  CopticDecorations.tsx   -> Ⲁ / Ⲱ watermarks, cross SVG, ornamental separator
  Timeline.tsx            -> vertical timeline: dot + connecting line + slot
  HorizontalTimeline.tsx  -> horizontal node strip (mirrors saint-details ref)
  HeroCard.tsx            -> large glass hero with image + title + CTA
  EventListItem.tsx       -> date chip + image + title + arrow (feasts ref)
  SaintListItem.tsx       -> portrait + name + feast + summary + arrow
  index.ts
```

All built on existing primitives from `src/components/bible/primitives.tsx` (`GlassSurface`, `Pressable`, `IconBadge`, `BackButton`, `palette`). No new color tokens — reuse Alpha palette. Color-coded dots map to: purple `#6a4ab5`, gold `#b8893a`, green `#3e7a55`, blue `#3a6a9b` (already in spirit of reference, adapted).

## Screen breakdown

### 1. Synaxarium Home (`/synaxarium`)
- Header: `BackButton` + centered title `السنكسار` + small cross icon. Subtitle `قراءات اليوم`.
- Hero card (today's saint): large portrait (right side, gradient mask), green book IconBadge, Gregorian + Coptic date, feast chip, الفون الطقسي line.
- Horizontal timeline strip (6 colored nodes: القديس / الأحداث / التأمل / القراءات / العظة / الصلاة) — visual only, scrolls to sections on tap.
- CTA button: `اقرأ السيرة كاملة` → links to `/synaxarium/{todayId}`.
- Below: vertical `Timeline` of upcoming days, each row uses `SaintListItem` → `/synaxarium/{id}`.
- Subtle Ⲁ/Ⲱ watermark behind hero.

### 2. Saint Details (`/synaxarium/$saintId`)
- Same hero + horizontal timeline pattern as reference screen 2.
- Quote card with gold-quotes mark + verse reference.
- 4-up info grid (date / place / service / commemoration) using `IconBadge`s.
- `نبذة عن حياته` paragraph.
- `أهم الأحداث في حياته` → vertical `Timeline` of life events (dot + year + text).
- Coptic cross separator between sections.
- Bookmark + share icons in hero corners.

### 3. Feasts & Events Home (`/feasts`)
- Header: bell icon + centered title `الأعياد والمناسبات` + subtitle + search icon (visual).
- Filter chip row: الكل (active purple) / الأعياد / أصوام / قديسين / مناسبات. Horizontal scroll.
- Today hero card: large landscape image, `اليوم` pill, feast title + subtitle, scripture line, verse ref, white CTA `تعرف على المناسبة`.
- Vertical event list using `EventListItem` (date chip on right per RTL, image, title, subtitle, arrow). Color-coded left dot per category.
- "Add event" CTA card at bottom matching reference style.
- Quick-actions strip (4 mini cards: قراءات اليوم / الصوم الحالي / التقويم الكامل / التنبيهات) — visual only, no nav targets.

### 4. Event Details (`/feasts/$eventId`)
- Hero image (16:9), category chip, gradient overlay with title + date.
- Sections: `عن المناسبة` / `الطقس والصلوات` / `قراءات اليوم` / `أيقونة المناسبة` — each a `GlassSurface` block.
- Quote card. Related events horizontal strip at bottom.
- Bookmark + share in hero. `BackButton` top-right.

## Navigation entry points

No changes to BottomDock or Home. The new routes are reachable by direct URL and by `<Link>`s from each other (saint hero CTA, related events, etc.). User can later wire entry from Home — not in scope.

## Mobile-first details

- `max-w-[430px]` container on every screen.
- `paddingTop: max(env(safe-area-inset-top), 12px)` on top bars.
- `paddingBottom: calc(env(safe-area-inset-bottom) + 96px)` to clear BottomDock.
- All tap targets ≥44px. `active:scale-[0.97]` micro-interaction via existing `Pressable`.
- Images: use existing premium church-style assets in `src/assets/home/` where suitable; otherwise generate 4–6 new images via `imagegen` (realistic church/icon style, not generic AI icons) saved to `src/assets/synaxarium/` and `src/assets/feasts/`.

## Out of scope

- No edits to: routes Home, Bible, Agpeya, Bottom Navigation, or branding assets.
- No backend, Supabase, or API work.
- No new e2e tests (existing Agpeya tests untouched).
- No changes to `styles.css` color tokens — only reuse.
