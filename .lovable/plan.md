# Agpeya UX Completion Plan

Scope: finish the Agpeya reader and supporting flows on top of the **already approved** home screen and design system. No Supabase, no backend, no redesign, no nav changes.

## 1. Placeholder Content (realistic, Coptic-faithful)

Replace the single `PLACEHOLDER` string in `src/features/agpeya/data.ts` with a structured per-prayer placeholder dataset:

- **text tab** — opening rite (Our Father, Thanksgiving, Psalm 50 incipit) as multi-paragraph Arabic prose, clearly marked as a draft excerpt.
- **psalms tab** — list of psalm objects `{ number, title, verses: string[] }` matching `psalmsCount`, with 4–6 sample verses each (labeled placeholder).
- **gospel tab** — `{ reference, intro, passage, conclusion }` shaped pericope(s) matching `gospelCount`.
- **fragments tab** ("قطع وذكصولوجيات") — 2–3 short Coptic-tradition fragments (Trisagion, Doxology snippet, intercession).
- **info tab** — structured metadata: meaning, commemoration, hour, recommended posture, sources note.

All content prefixed once at the top with a visible "محتوى تجريبي — قيد المراجعة" notice in the reader. No invented liturgical claims — generic, clearly-marked draft text.

## 2. Reader Screen (`src/routes/agpeya.$prayerId.tsx`)

Keep current shell (sticky header, tabs, floating control bar, progress bar). Wire the four content tabs to render the new structured placeholder data:

- **Psalms tab** — collapsible psalm cards (number + title header, verses list with verse numbers, Coptic cross divider).
- **Gospel tab** — pericope card with reference chip, intro line, passage body, conclusion line.
- **Passages / Fragments tab** — stacked fragment cards with title + body.
- **Information tab** — definition list (meaning, hour, commemoration, duration, psalms/gospel counts, sources).
- Empty-tab fallback: friendly Arabic empty state with small icon when a prayer omits a tab.

## 3. Search Inside Prayer

Add a search icon in the reader header that toggles an inline search bar:

- Filters visible content of the active tab (psalm verses, gospel passage, fragments, info entries).
- Highlights matches with `<mark>` styled via design tokens.
- Match counter + prev/next arrows; Esc clears.
- Pure client-side, scoped to current prayer + current tab.

## 4. Continue Reading Flow

Already partially wired via `ab.agpeya.last` and `readLastOpenedPrayer`. Finalize:

- Home "متابعة القراءة" tile shows last prayer title, tab label, and percentage.
- Tapping opens the reader at the saved tab and scroll position (already implemented — verify).
- Add a dismiss (×) affordance to clear last-read.

## 5. Saved Prayers Flow

- New route `src/routes/agpeya.saved.tsx` (Saved Prayers list screen) reachable from the bookmark icon already present in the Agpeya home header.
- Renders list of saved prayers using the existing card style; empty state with icon + CTA "تصفح الصلوات".
- Reader's save button already toggles — keep, add subtle "محفوظة" badge in header when saved.

## 6. Share Prayer Flow

Already uses `navigator.share` with clipboard fallback. Add:

- Share sheet fallback dialog (when `navigator.share` unavailable) with: copy link, copy text excerpt, share to WhatsApp/Telegram (URL schemes).
- Toast confirmation in Arabic.

## 7. Empty / Loading / Error States

Unified small components in `src/features/agpeya/states.tsx`:

- **AgpeyaSkeleton** — reader skeleton (header bar, 3 tab pills, 6 shimmer lines) used as `pendingComponent`.
- **AgpeyaEmpty** — icon + title + subtitle + optional CTA (used for empty saved list, empty tab).
- **AgpeyaError** — icon + message + "إعادة المحاولة" button (wired to `router.invalidate()` + `reset()`).
- **AgpeyaNotFound** — used as `notFoundComponent` with link back to Agpeya home.
- Home: skeleton row while last-read is hydrating from localStorage.

## 8. Coptic Visual Identity (light touch, no redesign)

Within existing tokens only:

- Reuse Alpha logo mark in reader header watermark (very low opacity) and on empty states.
- Coptic cross divider (SVG, existing gold accent token) between psalm cards and as section breaks.
- Keep all current colors, spacing, hero, and bottom nav untouched.

## Files Touched

- `src/features/agpeya/data.ts` — structured placeholder dataset.
- `src/features/agpeya/types.ts` — extend tab content types (psalms[], gospel object, fragments[], info entries).
- `src/features/agpeya/states.tsx` — new (skeleton/empty/error/notfound).
- `src/features/agpeya/search.ts` — new (in-prayer search hook + highlight helper).
- `src/routes/agpeya.$prayerId.tsx` — wire structured tabs, search bar, share dialog fallback, saved badge, use unified state components.
- `src/routes/agpeya.saved.tsx` — new route.
- `src/routes/agpeya.tsx` — wire bookmark icon to `/agpeya/saved`, add dismiss to continue tile, skeleton on hydrate.
- `src/assets/agpeya/` — small Coptic cross SVG (inline component, no asset upload needed).

## Out of Scope (explicitly)

- No Supabase, server functions, or migrations.
- No changes to Bottom Navigation, Alpha branding, Home screen, Bible/Dictionary/Church routes.
- No redesign of the approved Agpeya home cards, hero, colors, or spacing.
- No audio player UI (state shape already exists; deferred).

## Risks

- Placeholder liturgical text must stay clearly marked as draft to avoid being mistaken for verified Agpeya content (per `.cursor/rules/alpha-content.mdc`).
- Search highlighting must not break RTL layout — will use logical CSS only.

Ready to implement on approval.