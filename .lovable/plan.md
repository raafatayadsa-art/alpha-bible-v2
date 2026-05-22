# Alpha Bible — Plan

External Supabase only. Lovable Cloud stays disabled. App uses the existing `bible_verses` table read-only.

## Connection

- Project URL: `https://usfibjlyadihyitnvzya.supabase.co`
- Publishable key: `sb_publishable_kePRSRtR4ocvFoYy5PqTYg_UITT5IXf`
- Install `@supabase/supabase-js`
- Create `src/integrations/supabase/client.ts` with a browser client built from the publishable key (no auth persistence needed, public read).
- Values stored as `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` constants in the client file (publishable key is safe in code).

## Data model (existing, read-only)

`bible_verses`: `id, book, chapter, verse, text, translation, testament, book_order, chapter_order, verse_order, language, created_at`

Queries used:
- Distinct books for a language+translation, ordered by `book_order`.
- Distinct chapters for a book, ordered by `chapter_order`.
- Verses for a book+chapter, ordered by `verse_order`.
- Available languages/translations (for the selector).

Defaults: `language = 'Arabic'`, `translation = 'SVD'`. UI is RTL when language is Arabic.

## Routes (TanStack Start, file-based)

- `src/routes/index.tsx` — Books grid (Old/New Testament sections), language + translation selector in header.
- `src/routes/$book.tsx` — Chapter grid for the selected book.
- `src/routes/$book.$chapter.tsx` — Verses reader with prev/next chapter nav.

All three use TanStack Query (`ensureQueryData` in loader + `useSuspenseQuery` in component) per project conventions. QueryClientProvider already wired in `__root.tsx` — verify and add if missing.

## UI

- Arabic-first, RTL by default, elegant serif/Naskh-friendly typography for verse text.
- Header: app title "Alpha Bible / الكتاب المقدس", language + translation selectors.
- Books page: sectioned by testament, cards labeled with book name + chapter count.
- Chapter page: simple numbered grid.
- Verse page: verse number + text, large readable line-height, prev/next chapter buttons, breadcrumb back to book.
- Theme tokens added to `src/styles.css` (warm parchment light + deep night dark).

## Files to create/modify

- `src/integrations/supabase/client.ts` (new)
- `src/lib/bible.ts` (query helpers + queryOptions)
- `src/routes/index.tsx` (replace placeholder)
- `src/routes/$book.tsx` (new)
- `src/routes/$book.$chapter.tsx` (new)
- `src/routes/__root.tsx` (add QueryClientProvider if missing, set lang/dir, meta)
- `src/styles.css` (Bible theme tokens, Arabic font stack)
- `package.json` — add `@supabase/supabase-js`

## Out of scope

No auth, no writes, no Lovable Cloud, no edge functions, no schema changes. Search, bookmarks, audio, and cross-references can come later.
