# Bible 2 Tab Sync + Continue Reading DB Analysis

**Date:** 2026-06-17  
**Overall Status:** PASS (UI) / PARTIAL (DB sync not implemented)

---

## Executive Summary

Copied **Bible 1 bottom navigation tabs** into **Bible 2** without duplicating nav code — `BibleV2BottomNav` now wraps shared `BibleBottomNavigation`. Unified **Continue Reading / آخر قراءة** button runtime logic via `continue-reading-nav.ts`. Analysis shows reader text comes from Supabase `bible_verses`; progress/saved/notes are **localStorage only** — several user-facing tables are **missing**.

---

## Findings

### 1. Bottom tabs (Bible 1 → Bible 2)

| Tab | Route | Bible 1 | Bible 2 (after) |
|-----|-------|---------|-----------------|
| الرئيسية | `/home` | ✓ | ✓ |
| القطمارس | `/katameros` | ✓ | ✓ (was missing) |
| الكتاب المقدس (raised) | `/bible` / `/bible-2` | `/bible` | `/bible-2` |
| الأجبية | `/agpeya` | ✓ | ✓ |
| المزيد | `/settings` | ✓ | ✓ (replaces الإعدادات/المكتبة/الصلوات mix) |

**Removed from Bible 2 nav (not in Bible 1):** المكتبة `/books`, الصلوات duplicate, الإعدادات as separate tab.

**Implementation:**
- `BibleBottomNavigation({ biblePath, booksPrefix })` — shared component
- `BibleV2BottomNav` → `biblePath="/bible-2"` `booksPrefix="/books-v2"`

### 2. Continue Reading button logic (runtime)

**Source of truth today:** `localStorage` keys in `reading-state.ts`:
- `ab:reading:current` — last chapter/verse + progress %
- `ab:reading:recent` — recent sessions
- `ab:saved:verses` — bookmarks (not DB)

**Shared helper:** `src/lib/continue-reading-nav.ts`
- `resolveContinueReadingView(session)` — builds card data from session or defaults
- `continueReadingDestination(view, { booksRoute })` — CTA target:
  - If `bookParam + chapter` → `/$book/$chapter` (reader)
  - Else fallback → `/books?testament=all` (Bible 1) or `/books-v2?testament=new` (Bible 2)

**Wired in:**
- `ContinueReadingCard` (Bible 1)
- `BibleV2ContinueReading` (Bible 2 CTA button)
- `BibleV2QuickTools` → «آخر قراءة» tile

**DB connection:** None for progress. Reader chapter content loads from `bible_verses` when navigating to `/$book/$chapter`.

### 3. Database tables audit

#### Existing (Supabase) — used by Bible screens

| Table | Purpose | Used by |
|-------|---------|---------|
| `bible_verses` | Arabic Van Dyck text (book, chapter, verse) | `lib/bible.ts`, chapter reader |

#### Missing — needed for full Bible 1/2 parity + cloud sync

| Proposed table | Feature | Current fallback |
|----------------|---------|------------------|
| `bible_reading_sessions` | Continue reading, progress %, scroll position | `localStorage` `ab:reading:current` |
| `bible_reading_recent` | Recent chapters list | `localStorage` `ab:reading:recent` |
| `bible_saved_verses` | الآيات المحفوظة / المفضلة | `localStorage` `ab:saved:verses` |
| `bible_user_notes` | ملاحظات وتأملات | Placeholder `/bible/notes` |
| `bible_characters` | الشخصيات | Placeholder `/bible/characters` |
| `bible_timeline_events` | الخط الزمني | Placeholder `/bible/timeline` |
| `bible_places` | خريطة الأماكن | Placeholder `/bible/places` |
| `bible_qa` | أسئلة وأجوبة | Placeholder `/bible/questions` |
| `bible_daily_verse` | آية اليوم (card) | Static `todayCardData` |
| `bible_psalms_index` | المزامير shortcut | Route exists; verify content source |

#### Related (exist, other modules)

| Table | Module |
|-------|--------|
| `katamaros_readings` | القطمارس (not Bible reader progress) |

### 4. Button → DB flow (current vs target)

```
[متابعة القراءة] click
  → read localStorage session (NOT DB)
  → navigate to /$book/$chapter
  → fetchVerses() → SELECT * FROM bible_verses WHERE book_name, chapter_number
  → on scroll: updateSession() → write localStorage (NOT DB)
```

**Target (when tables added):**
```
  → upsert/read bible_reading_sessions WHERE user_id
  → same reader fetch from bible_verses
  → on scroll: upsert progress to bible_reading_sessions
```

---

## Warnings

1. Progress is **device-local** — switching devices loses continue-reading state.
2. Bible 2 quick tool «آخر قراءة» previously linked to `/books` when no session; now correctly uses `/books-v2`.
3. `bible_verses` must exist and be populated on Supabase for reader to work.

---

## Errors

None — `npm run build` passed.

---

## Recommendations

1. **Phase 1 migration:** `bible_reading_sessions`, `bible_saved_verses` with RLS `user_id = auth.uid()`.
2. **Phase 2:** `bible_user_notes`, daily verse table or view.
3. **Phase 3:** Content tables for characters/timeline/places/QA.
4. Add sync layer in `reading-state.ts` to read/write Supabase when authenticated, fallback to localStorage offline.

---

## Files changed

- `src/features/bible-home/components/BibleBottomNavigation.tsx` — parameterized bible tab
- `src/features/bible-v2/components/BibleV2BottomNav.tsx` — thin wrapper
- `src/lib/continue-reading-nav.ts` — shared CTA logic
- `src/features/bible-v2/components/BibleV2ContinueReading.tsx`
- `src/features/bible-v2/components/BibleV2QuickTools.tsx`
- `src/features/bible-home/components/ContinueReadingCard.tsx`
- `src/features/bible-home/BibleHomeScreen.tsx`

---

## COPYABLE REPORT

```
BIBLE 2 TAB + CONTINUE READING SYNC — PASS (UI) / PARTIAL (DB)
Tabs: Bible 1 nav copied to Bible 2 (center = /bible-2)
CTA: shared continue-reading-nav.ts (localStorage session → reader or books catalog)
DB exists: bible_verses
DB missing: bible_reading_sessions, bible_saved_verses, bible_user_notes, bible_characters, bible_timeline_events, bible_places, bible_qa, bible_daily_verse
Build: OK
```
