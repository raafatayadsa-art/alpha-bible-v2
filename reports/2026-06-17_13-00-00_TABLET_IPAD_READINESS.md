# Alpha Bible — Tablet & iPad Readiness Report

**Date:** 2026-06-17  
**Scope:** Major screens audit (read-only — no code changes)  
**Reference viewports:** iPhone ~393px · iPad portrait ~768px · iPad landscape ~1024px  
**Method:** Route/component inspection, Tailwind breakpoint grep, `AlphaScreenFrame` shell analysis

---

## Executive Summary

Alpha Bible is **architecturally mobile-first**: a global phone column (`AlphaScreenFrame`, **440px max**) centers all primary content. On iPad/tablet the app **runs correctly** (viewport meta, safe areas, touch targets) but **does not expand layout** — users see a centered ~430–440px column with wide side margins.

| Classification | Screens |
|----------------|---------|
| **Mobile only** | Home, Bible, Katameros, Synaxarium, Profile, Alpha Connect, Reservations (Church-embedded) |
| **Responsive** (minor) | Church (modal positioning at `sm+`) |
| **Tablet optimized** | **None** among audited screens |

**Overall tablet readiness: NOT OPTIMIZED** — functional on tablet, not designed for tablet.

---

## Global Architecture (Affects All Screens)

| Layer | File | Tablet impact |
|-------|------|---------------|
| Viewport shell | `src/components/alpha/AlphaScreenFrame.tsx` | Hard cap **440px** via `ALPHA_SCREEN_FRAME.maxWidth` |
| Phone column CSS | `src/components/alpha/alpha-viewport.css` | `.alpha-viewport-phone { max-width: var(--alpha-frame-max-width, 440px) }` |
| Root mount | `src/routes/__root.tsx` | Most routes wrapped in `AlphaScreenFrame mode="flow"` |
| Header | `src/components/navigation/AlphaHeader.tsx` | `max-w-[440px]` |
| Bottom nav | `src/components/bible/BottomDock.tsx` | `max-w-[420px]` — stays phone-width on tablet |
| Viewport meta | `src/routes/__root.tsx` | `viewport-fit=cover` ✓ (notch/safe-area) |

**Routes outside shared frame** (own full-viewport layout, still phone-column inside):  
`/alpha-connect`, `/call`, `/personal-call`, `/messages`, `/intro`, `/platform/*`, `/dev/*`, `/diagnostics`

**Breakpoint inventory (production `src/`):**
- `tablet` / `iPad` strings: **0 matches**
- `@media (min-width: …)` in app CSS: **0 matches**
- Tailwind `sm:` in major routes: **Church modals only** (+ Agpeya, PostBuilder — out of scope)
- Tailwind `md:` / `lg:` in app routes: **dev previews + PresentationMode overlay only**

---

## Per-Screen Assessment

Legend:
- ✅ = present / good
- ⚠️ = partial / latent
- ❌ = absent

| Screen | Route(s) | Primary file(s) | Mobile only | Responsive | Tablet optimized | Verdict |
|--------|----------|-----------------|-------------|------------|------------------|---------|
| **Home** | `/home` | `src/routes/home.tsx` | ✅ | ❌ | ❌ | **Mobile only** |
| **Bible** | `/bible`, `/books`, `/$book/$chapter`, notes/saved | `BibleHomeScreen.tsx`, `$book.$chapter.tsx`, `books.tsx` | ✅ | ⚠️ | ❌ | **Mobile only** |
| **Katameros** | `/katameros` | `src/routes/katameros.index.tsx` | ✅ | ❌ | ❌ | **Mobile only** |
| **Synaxarium** | `/synaxarium`, `/synaxarium/$saintId` | `synaxarium.index.tsx`, `synaxarium.$saintId.tsx` | ✅ | ❌ | ❌ | **Mobile only** |
| **Church** | `/church`, directory, posts, chat, service | `src/routes/church.tsx` + sub-routes | ✅ | ⚠️ | ❌ | **Mobile only** (minor responsive modals) |
| **Profile** | `/profile`, messages, membership, service | `src/routes/profile.index.tsx` + sub-routes | ✅ | ❌ | ❌ | **Mobile only** |
| **Alpha Connect** | `/alpha-connect` | `src/routes/alpha-connect.tsx` | ✅ | ❌ | ❌ | **Mobile only** |
| **Reservations** | *(no standalone route)* | Church posts: `PostActions.tsx`, `post-store.ts` | ✅ | ❌ | ❌ | **Mobile only** (embedded in Church) |

---

### 1. Home — **Mobile only**

**Route:** `/home` · **File:** `src/routes/home.tsx`

| Check | Finding |
|-------|---------|
| Content width | `max-w-[440px] mx-auto px-4` throughout |
| Carousels | Explicit `min(100vw, 440px)` sizing — never expands on tablet |
| Grids | `grid-cols-6` emoji row, card stacks — fixed for phone |
| Navigation | `BottomDock` at `max-w-[420px]` |
| Breakpoints | None |
| iPad behavior | Centered phone column; hero/carousels unchanged |

**Status:** Mobile only · Responsive ❌ · Tablet optimized ❌

---

### 2. Bible — **Mobile only** *(latent width prefs blocked by shell)*

**Routes:** `/bible` → `BibleHomeScreen`, `/books`, `/$book/$chapter`, `/bible/notes`, `/bible/saved`  
**Files:** `src/features/bible-home/BibleHomeScreen.tsx`, `src/routes/$book.$chapter.tsx`, `src/routes/books.tsx`

| Check | Finding |
|-------|---------|
| Bible home | `max-w-[440px]` content column |
| Books grid | `max-w-[440px]`, `grid-cols-4` inside phone column |
| Chapter reader | Dynamic `style={{ maxWidth: readingWidth }}` — tiers **420 / 640 / 800px** (`alpha-control-cycles.ts`) |
| Shell constraint | `AlphaScreenFrame` caps outer column at **440px** → medium/wide tiers **cannot visually expand** on tablet |
| Sheets | Dictionary/meaning sheets `max-w-[480px]` — still modal-sized |
| Breakpoints | None on main Bible screens |

**Status:** Mobile only · Responsive ⚠️ (reading-width API exists but clipped) · Tablet optimized ❌

---

### 3. Katameros — **Mobile only**

**Route:** `/katameros` · **File:** `src/routes/katameros.index.tsx`

| Check | Finding |
|-------|---------|
| Content width | `max-w-[430px] mx-auto px-4` (header, main, sticky controls) |
| Background | `KatamerosScreenBackground` — absolute full route, PNG positioned for phone header |
| Grids | `grid-cols-2` action tiles within narrow column |
| Breakpoints | None (dev preview uses `lg:gap-10` only) |
| iPad behavior | 430px column inside 440px frame; top PNG/medallion layout unchanged |

**Status:** Mobile only · Responsive ❌ · Tablet optimized ❌

---

### 4. Synaxarium — **Mobile only**

**Routes:** `/synaxarium`, `/synaxarium/$saintId`  
**Files:** `src/routes/synaxarium.index.tsx`, `src/routes/synaxarium.$saintId.tsx`

| Check | Finding |
|-------|---------|
| Content width | `max-w-[430px] mx-auto px-4` |
| List layout | `grid-cols-2` feasts; saint cards `grid-cols-[64px_minmax(0,1fr)_44%]` |
| Detail view | Single column scroll — no master/detail split on tablet |
| Breakpoints | `[@media(hover:hover)]` card hover polish only |
| iPad behavior | Same 430px column; no sidebar or widened reading area |

**Status:** Mobile only · Responsive ❌ · Tablet optimized ❌

---

### 5. Church — **Mobile only** *(minor responsive modals)*

**Routes:** `/church`, `/church/directory`, `/church/post/$id`, `/church/chat/$contactId`, `/church/service`  
**File:** `src/routes/church.tsx` (+ sub-routes)

| Check | Finding |
|-------|---------|
| Feed / main | `max-w-[440px] mx-auto px-4` |
| Post detail | `max-w-[420px]` |
| In-column grids | `grid-cols-2`, `grid-cols-3` within phone width |
| Modals / sheets | `sm:items-center` — bottom sheet on phone, vertically centered at ≥640px; content still `max-w-[380px]`–`max-w-[420px]` |
| Carousel cards | `w-[88vw] max-w-[420px]` |
| Breakpoints | **`sm:` only** on overlay positioning — not layout expansion |

**Status:** Mobile only · Responsive ⚠️ (modal centering) · Tablet optimized ❌

---

### 6. Profile — **Mobile only**

**Routes:** `/profile`, `/profile/messages`, `/profile/membership`, `/profile/service`  
**Files:** `src/routes/profile.index.tsx`, `src/components/profile/Shell.tsx`

| Check | Finding |
|-------|---------|
| Content width | `max-w-[440px] mx-auto px-4` |
| Stats / tiles | `grid-cols-2`, `grid-cols-3` inside narrow column |
| Sheets | Profile messages sheet `max-w-[440px]` |
| Breakpoints | None |
| iPad behavior | Centered 440px profile stack |

**Status:** Mobile only · Responsive ❌ · Tablet optimized ❌

---

### 7. Alpha Connect — **Mobile only**

**Route:** `/alpha-connect` · **File:** `src/routes/alpha-connect.tsx`

| Check | Finding |
|-------|---------|
| Frame | **Own** `AlphaScreenFrame` — excluded from root wrapper; full-viewport themed backdrop |
| Content | `max-w-[430px] mx-auto px-5` |
| Sub-screens | `AlphaChatScreen`, `ConnectChannelsUI`, settings sheets — all `max-w-[430px]` |
| Breakpoints | None |
| iPad behavior | Full-screen dark/classic backdrop with centered 430px “phone app” column |

**Status:** Mobile only · Responsive ❌ · Tablet optimized ❌

---

### 8. Reservations — **Mobile only** *(no dedicated screen)*

**Finding:** There is **no `/reservations` route**. Reservation functionality is:

| Location | Role |
|----------|------|
| `src/features/church/post-store.ts` | Local reservation counts (`useReservations`) |
| `src/features/church/PostActions.tsx` | “احجز الآن” / trip booking UI in church posts |
| `src/features/church/post-registrations.ts` | `RegistrationKind = "reservation"` (future QR flows) |
| `src/features/platform-admin/platform-store.ts` | Module `reservations` — **`enabled: false`** |

**Closest standalone route:** `/prayer-requests` (prayer requests, not seat reservations) — also `max-w-[440px]`, mobile only.

| Check | Finding |
|-------|---------|
| Standalone Reservations screen | ❌ Does not exist |
| Church post booking UI | `max-w-[420px]` modals, phone-column feed |
| Breakpoints | None |
| iPad behavior | Same as Church — embedded reservation flows in 440px column |

**Status:** Mobile only · Responsive ❌ · Tablet optimized ❌

---

## What iPad Users Experience Today

```
┌──────────────────────────────────────────────────────────────┐
│  shell background (#f4ead8) — full viewport width            │
│  ┌────────────────┐                                          │
│  │  440px column  │  ← all content, header, cards             │
│  │  (centered)    │                                          │
│  │                │     empty side bands on iPad             │
│  │  [BottomDock   │                                          │
│  │   420px wide]  │                                          │
│  └────────────────┘                                          │
└──────────────────────────────────────────────────────────────┘
```

**Works on iPad:**
- App loads and scrolls
- `viewport-fit=cover` + `env(safe-area-inset-*)` on headers/docks
- Touch targets (~44px buttons in `AlphaHeader`)
- `100dvh` height handling

**Does not adapt on iPad:**
- No breakpoint at 768px / 1024px
- No two-pane master/detail (e.g. Synaxarium list + saint)
- No expanded Bible reading column
- No sidebar navigation
- Bottom dock remains phone-width floating bar

---

## Closest Existing “Wider Screen” Hooks (Not Tablet-Ready)

| Hook | Location | Why it’s not tablet-ready |
|------|----------|---------------------------|
| Reading width 640/800px | `$book.$chapter.tsx` + `reading-state.ts` | Clipped by 440px `AlphaScreenFrame` |
| Agpeya `max-w-[640px]` + `sm:px-5` | `agpeya.$prayerId.tsx` | Still inside 440px shell |
| Church `sm:items-center` | `church.tsx` modals | Dialog placement only |
| PresentationMode `max-w-[1100px]` | `PresentationMode.tsx` | Casting overlay — not main app |

---

## Findings Summary Table

| Screen | Mobile only | Responsive | Tablet optimized | Primary width |
|--------|:-----------:|:----------:|:----------------:|---------------|
| Home | ✅ | ❌ | ❌ | 440px |
| Bible | ✅ | ⚠️ | ❌ | 440px (reader prefs up to 800px clipped) |
| Katameros | ✅ | ❌ | ❌ | 430px |
| Synaxarium | ✅ | ❌ | ❌ | 430px |
| Church | ✅ | ⚠️ | ❌ | 440px |
| Profile | ✅ | ⚠️ | ❌ | 440px |
| Alpha Connect | ✅ | ❌ | ❌ | 430px |
| Reservations | ✅ | ❌ | ❌ | 440px (Church-embedded; no standalone route) |

---

## Warnings

1. **Reservations** is not a first-class screen — audit covers Church-embedded booking flows only.
2. Bible “wide reading” preference gives a **false sense of responsiveness** — shell blocks expansion.
3. Katameros PNG/header artwork is **phone-composed** — will look unchanged (not broken) on tablet, not optimized.
4. Platform module `reservations` is disabled — no admin/reservations UI to audit.

---

## Errors

None — analysis completed without code execution blockers.

---

## Recommendations (Informational — No Code Changes Made)

1. **If tablet support is a goal:** start at `AlphaScreenFrame` / `--alpha-frame-max-width` with breakpoint-aware max-width (e.g. 440px phone · 680px tablet · fluid landscape).
2. **High-value tablet wins:** Bible reader (unlock 640/800px), Synaxarium/Katameros master-detail, Church feed + post side-by-side.
3. **Low-effort improvement:** propagate Church’s `sm:items-center` pattern consistently for modals app-wide (UX polish, not layout).
4. **Reservations:** define whether `/reservations` becomes a route or stays Church-embedded before tablet work.

---

## Overall Status

**PARTIAL** — App is **functional on iPad** as a centered phone app; **zero screens are tablet-optimized**. One screen (Church) has minor responsive modal behavior. No code was modified during this audit.

---

## Key File Index

```
src/components/alpha/AlphaScreenFrame.tsx
src/components/alpha/alpha-viewport.css
src/routes/__root.tsx
src/routes/home.tsx
src/features/bible-home/BibleHomeScreen.tsx
src/routes/$book.$chapter.tsx
src/routes/katameros.index.tsx
src/routes/synaxarium.index.tsx
src/routes/church.tsx
src/routes/profile.index.tsx
src/routes/alpha-connect.tsx
src/features/church/PostActions.tsx
src/routes/prayer-requests.tsx
src/components/bible/BottomDock.tsx
src/components/navigation/AlphaHeader.tsx
src/components/controls/alpha-control-cycles.ts
```
