# GLOBAL TOP CURVE REMOVAL — Complete Analysis (Read-Only)

**Date:** 2026-06-17  
**Mode:** ANALYSIS ONLY — no files modified  
**Scope:** Entire Alpha Bible codebase — top curved visual below Dynamic Island / safe area

---

## Executive Summary

The “top curve / screen inside screen” effect is **not one bug in one component**. It is the **sum of up to four stacked layers**:

1. **Global `AlphaBackground`** (fixed, all shell routes) — top radial bowl, Variant B default  
2. **Route-level `fixed inset-0` radial gradients** — copy-pasted on ~18 routes  
3. **PNG parchment backgrounds** — circular cross medallions at top of asset  
4. **Flat shell stacking** — `AlphaScreenFrame` + `html/body` + optional flat caps → “double frame” feel without curves

**No global CSS `border-radius` cap exists.** Curves are almost entirely from **radial gradients** and **PNG artwork**.

---

# PHASE 1 — DISCOVERY

## 1A. Global layout & viewport (always-on shell routes)

| ID | File | Path | Mechanism | Curve? | Glow? |
|----|------|------|-----------|--------|-------|
| G1 | `AlphaScreenFrame.tsx` | `src/components/alpha/` | Wraps app via `__root.tsx`; `.alpha-viewport-root` 100dvh | No | No |
| G2 | `alpha-viewport.css` | `src/components/alpha/` | `.alpha-viewport-root--shell { background: #f4ead8 }` | No | No |
| G3 | `alpha-viewport.ts` | `src/components/alpha/` | `AlphaViewportSync` → `html.alpha-viewport-bg-shell body` | No | No |
| G4 | **`AlphaBackground.tsx`** | `src/components/alpha/` | **`fixed inset-0 z-[0]`** radial 3-layer bowl | **Yes** | **Yes** |
| G5 | `alpha-background.ts` | `src/components/alpha/` | Variant A/B/C gradient definitions | A=no, B/C=yes | B/C yes |
| G6 | `AlphaBackgroundProvider.tsx` | `src/components/alpha/` | Default **Variant B**; `?alphaBg=a\|b\|c` | Controls G4 | Controls G4 |
| G7 | `AlphaHeaderShell` | `src/components/navigation/AlphaHeader.tsx` | `ALPHA_HEADER_FRAME` safe-area padding only | No | No |
| G8 | `styles.css` | `src/` | `.alpha-screen-frame { max-width: 440px }` | No | No |
| G9 | `styles.css` | `src/` | `.alpha-messaging-bg`, `.alpha-chat-bg` | No | Linear only |

**Shell routes using G1–G6:** All routes except `/intro`, `/platform/*`, `/dev/*`, `/diagnostics`, `/alpha-connect`, `/call`, `/personal-call`, `/messages`.

---

## 1B. PNG / ornamental full-screen backgrounds

| ID | Component | File | Asset | Top ornament curve? | Mount |
|----|-----------|------|-------|-------------------|-------|
| P1 | `KatamerosScreenBackground` | `src/features/katameros/components/` | `katameros-reading-bg.png` | **Yes** (circular medallion) | `/katameros` ×3 |
| P2 | Flat cap div inside P1 | same | `#f4ead8` height calc | No (mask) | katameros |
| P3 | `ControlCenterScreenBackground` | `src/features/settings/components/` | `control-center-bg.png` | **Yes** | `/settings` |
| P4 | `TrustSafetyScreenBackground` | `src/features/settings/components/` | same PNG as P3 | **Yes** | trust/safety settings |

---

## 1C. Route-level top radial bowl (`120% … at 50% 0%`) — **fixed viewport**

| File | Position | Top layer alpha (approx) |
|------|----------|--------------------------|
| `src/routes/church.tsx` | fixed inset-0 | 0.6 |
| `src/routes/church.post.$id.tsx` | fixed inset-0 | 0.6 |
| `src/routes/church.chat.$contactId.tsx` | fixed inset-0 | 0.6 |
| `src/routes/church.directory.tsx` | fixed inset-0 | full color ramp at 50% 0 |
| `src/routes/church.directory.$placeId.tsx` | inline style | full color ramp at 50% 0 |
| `src/routes/profile.index.tsx` | fixed inset-0 (×2 layers) | 0.35–0.55 + linear legacy |
| `src/routes/profile.messages.tsx` | fixed inset-0 | 0.35 |
| `src/routes/profile.membership.tsx` | fixed inset-0 | opaque ramp at 50% 0 |
| `src/routes/profile.service.tsx` | fixed inset-0 | 0.45 at 50% 0 |
| `src/routes/prayer-requests.tsx` | fixed inset-0 | 0.22 + **ellipse 55% 80% at 50% 0** |
| `src/features/church/PostBuilder.tsx` | fixed inset-0 | 0.55 |

---

## 1D. Route-level top radial — **absolute inset-0** (scroll-contained)

| File | Notes |
|------|-------|
| `src/features/bible-home/BibleHomeScreen.tsx` | 3-layer bowl; used on `/bible` |
| `src/features/bible-home/BibleSubpagePlaceholder.tsx` | bible subpages |
| `src/routes/books.tsx` | |
| `src/routes/$book.index.tsx` | |
| `src/routes/bible.notes.tsx` | |
| `src/routes/bible.saved.tsx` | |

---

## 1E. Other top radial / ellipse patterns

| File | Pattern | Affects top? |
|------|---------|--------------|
| `src/routes/agpeya.$prayerId.tsx` | `radial 120% 60% at 50% -10%` full page bg | **Yes** (above viewport) |
| `src/features/agpeya/states.tsx` | same | agpeya states |
| `src/routes/profile.index.tsx` | card/hero radials at 50% 0, 50% 10% | partial |
| `src/routes/$book.$chapter.tsx` | fixed z-0 reading ambience (top radial minor) | reading mode |
| `src/routes/prayer-requests.tsx` | conic at 50% 0 | subtle |
| `src/styles.css` | `.splash-glow` radial at 50% 0 | splash/onboarding only |
| `src/features/platform-admin/mission-control-ui.tsx` | ellipse at 50% -15% | platform only |
| `src/features/katameros/components/KatamerosProgressUI.tsx` | ellipse at 0% 0% on icons | not DI zone |

---

## 1F. Overlay / header UI (conditional, can look like “white cap”)

| File | Class / element | When visible | Curve type |
|------|-----------------|--------------|------------|
| `src/components/overlays/SearchOverlay.tsx` | `rounded-b-3xl bg-white/95` | Search open | **CSS rounded bottom** |
| `src/components/navigation/AlphaNavHub.tsx` | `top-0 h-32 bg-gradient-to-b from-white/35` | Menu open | soft glow |
| `src/routes/katameros.index.tsx` | detail header `rounded-2xl bg-[#faf6ec]/80` | reading detail | card radius |
| `src/components/bible/DictionarySearchDialog.tsx` | `rounded-b-[28px]` | dictionary open | overlay |

---

## 1G. Decorative layers NOT causing top curve

| Component | File | Role |
|-----------|------|------|
| `CopticWatermark` | `src/components/coptic/CopticDecorations.tsx` | Center ⲀⲰ letters, fixed/absolute inset-0 |
| `GlobalBackButton` | `src/components/GlobalBackButton.tsx` | Usually null |
| `BottomDock` | `src/components/bible/BottomDock.tsx` | Bottom only |
| Connect theme | `src/components/alpha/styles.css` | Pulse `::before/::after` on mic/icons — not shell |

---

## 1H. Alpha Connect (separate stack — not shell curve)

| Item | File | Top curve? |
|------|------|------------|
| Own `AlphaScreenFrame` | routes: `alpha-connect`, `call`, `personal-call` | Linear dark gradient only |
| `.alpha-viewport-root--connect-secure` | `alpha-viewport.css` | No ellipse |
| **No `AlphaBackground`** on connect | `AlphaScreenFrame` backdrop ≠ shell | N/A |

---

# PHASE 2 — IMPACT REPORT (per match)

## GLOBAL LAYER

---

**FILE:** `src/components/alpha/AlphaBackground.tsx`  
**PATH:** `src/components/alpha/AlphaBackground.tsx`  
**TYPE:** Global fixed decorative background  
**PURPOSE:** Single shell top radial bowl (Variants B/C); flat fill (Variant A still renders `#f4ead8` fixed layer)  
**AFFECTS:** All `AlphaScreenFrame` shell + messaging routes (~90% of app)  
**GLOBAL OR LOCAL:** **GLOBAL**  
**SAFE TO REMOVE:** **Yes** (Variant A or remove mount); test overscroll  
**DEPENDENCIES:** `AlphaBackgroundProvider`, `AlphaScreenFrame`, `alpha-background.ts`

---

**FILE:** `src/components/alpha/alpha-background.ts`  
**PATH:** `src/components/alpha/alpha-background.ts`  
**TYPE:** Gradient CSS source  
**PURPOSE:** Defines 3-layer radial at `50% 0%`  
**AFFECTS:** Same as AlphaBackground  
**GLOBAL OR LOCAL:** GLOBAL  
**SAFE TO REMOVE:** Yes (if AlphaBackground removed or Variant A)  
**DEPENDENCIES:** AlphaBackground, dev preview route

---

**FILE:** `src/components/alpha/alpha-viewport.css`  
**PATH:** `src/components/alpha/alpha-viewport.css`  
**TYPE:** Viewport shell CSS  
**PURPOSE:** Flat `#f4ead8` on root + html/body — prevents overscroll bleed  
**AFFECTS:** All shell routes  
**GLOBAL OR LOCAL:** GLOBAL  
**SAFE TO REMOVE:** **No** — required for scroll lock / overscroll  
**DEPENDENCIES:** AlphaScreenFrame, AlphaViewportSync

---

**FILE:** `src/components/alpha/AlphaScreenFrame.tsx`  
**PATH:** `src/components/alpha/AlphaScreenFrame.tsx`  
**TYPE:** Shared page wrapper  
**PURPOSE:** 100dvh scroll owner; mounts AlphaBackground  
**AFFECTS:** All shell routes  
**GLOBAL OR LOCAL:** GLOBAL  
**SAFE TO REMOVE:** **No**  
**DEPENDENCIES:** `__root.tsx`, all shell pages

---

**FILE:** `src/components/navigation/AlphaHeader.tsx` (`AlphaHeaderShell`)  
**PATH:** `src/components/navigation/AlphaHeader.tsx`  
**TYPE:** Safe-area wrapper  
**PURPOSE:** `pt-[max(env(safe-area-inset-top),14px)]` — spacing only  
**AFFECTS:** katameros, synaxarium, feasts, profile.index, etc.  
**GLOBAL OR LOCAL:** Shared component, local mount per route  
**SAFE TO REMOVE:** **No** — breaks DI spacing  
**DEPENDENCIES:** AlphaHeader consumers

---

## PNG BACKGROUNDS

---

**FILE:** `KatamerosScreenBackground.tsx`  
**PATH:** `src/features/katameros/components/KatamerosScreenBackground.tsx`  
**TYPE:** PNG ornamental background + flat cap  
**PURPOSE:** Parchment texture; cap hides top medallion (partial)  
**AFFECTS:** `/katameros` only  
**GLOBAL OR LOCAL:** LOCAL  
**SAFE TO REMOVE:** Partial — texture yes; cap helps; PNG top art causes curve if clip insufficient  
**DEPENDENCIES:** `katameros.index.tsx`, asset `katameros-reading-bg.png`

---

**FILE:** `ControlCenterScreenBackground.tsx`  
**PATH:** `src/features/settings/components/ControlCenterScreenBackground.tsx`  
**TYPE:** PNG fixed background  
**PURPOSE:** Settings control center parchment  
**AFFECTS:** `/settings`  
**GLOBAL OR LOCAL:** LOCAL  
**SAFE TO REMOVE:** Replace with flat shell; loses parchment aesthetic  
**DEPENDENCIES:** `AlphaControlCenter.tsx`, `control-center-bg.png`

---

**FILE:** `TrustSafetyScreenBackground.tsx`  
**PATH:** `src/features/settings/components/TrustSafetyScreenBackground.tsx`  
**TYPE:** PNG fixed background (same asset)  
**PURPOSE:** Trust & safety settings parchment  
**AFFECTS:** Trust/safety settings route  
**GLOBAL OR LOCAL:** LOCAL  
**SAFE TO REMOVE:** Same as P3  
**DEPENDENCIES:** `TrustSafetyCenter.tsx`

---

## ROUTE RADIAL (representative — pattern repeated)

---

**FILE:** `src/routes/church.tsx`  
**TYPE:** Route-level `fixed inset-0` radial gradient (3 layers, top at 50% 0)  
**PURPOSE:** Warm top glow + corner accents  
**AFFECTS:** `/church` only  
**GLOBAL OR LOCAL:** LOCAL  
**SAFE TO REMOVE:** **Yes** — if global flat shell retained  
**DEPENDENCIES:** Stacks with AlphaBackground on Variant B

---

**FILE:** `src/routes/profile.index.tsx`  
**TYPE:** **Two** fixed inset-0 layers + linear legacy gradient  
**PURPOSE:** Profile hero depth + top glow  
**AFFECTS:** `/profile`  
**GLOBAL OR LOCAL:** LOCAL  
**SAFE TO REMOVE:** Top radial yes; review hero cards  
**DEPENDENCIES:** CopticWatermark, AlphaHeaderShell, membership cards

---

*(Same classification applies to all files listed in Phase 1C–1D: **SAFE TO REMOVE: Yes** for top radial layers, with visual QA per screen.)*

---

# PHASE 3 — GLOBAL INVENTORY TABLE

| Component | File | Screens Using It | Creates Curve? | Creates Glow? | Required? |
|-----------|------|------------------|----------------|---------------|-----------|
| **AlphaBackground** | `AlphaBackground.tsx` | All shell + messaging | Yes (B/C) | Yes (B/C) | **No** — new, comparison layer |
| **AlphaScreenFrame** | `AlphaScreenFrame.tsx` | All shell routes | No | No | **Yes** |
| **alpha-viewport-root--shell** | `alpha-viewport.css` | All shell routes | No | No | **Yes** |
| **AlphaViewportSync** | `alpha-viewport.ts` | All shell routes | No | No | **Yes** |
| **AlphaHeaderShell** | `AlphaHeader.tsx` | ~15 header routes | No | No | **Yes** (spacing) |
| **KatamerosScreenBackground** | `KatamerosScreenBackground.tsx` | `/katameros` | Yes (PNG) | Soft | Optional aesthetic |
| **ControlCenterScreenBackground** | `ControlCenterScreenBackground.tsx` | `/settings` | Yes (PNG) | Soft | Optional aesthetic |
| **TrustSafetyScreenBackground** | `TrustSafetyScreenBackground.tsx` | Trust settings | Yes (PNG) | Soft | Optional aesthetic |
| **Route radial div** | 18+ route files | See Phase 1C–D | Yes | Yes | **No** — duplicate of AlphaBackground |
| **CopticWatermark** | `CopticDecorations.tsx` | home, church, profile, synaxarium… | No | No | Optional brand |
| **SearchOverlay** | `SearchOverlay.tsx` | When search open | Yes (rounded) | No | Feature UI |
| **Alpha Connect frame** | `alpha-viewport.css` connect classes | connect/call/messages | No | No | **Yes** for connect |

---

# PHASE 4 — VISUAL RESPONSIBILITY MAP

Estimated contribution to **“top curved / screen-in-screen” perception** on a **typical shell screen with route gradients** (e.g. `/church`, `/profile`):

| Visual symptom | Primary cause | % contribution |
|----------------|---------------|----------------|
| **1. White / beige curved cap** | PNG top medallion (katameros/settings) OR SearchOverlay `rounded-b-3xl` when open | **25%** (route-dependent; 0% on church) |
| **2. Top glow / elliptical bowl** | Route `radial-gradient(120% 50% at 50% 0%)` **+** global `AlphaBackground` Variant B | **55%** |
| **3. Screen-inside-screen feeling** | `AlphaScreenFrame` 100dvh + fixed backgrounds + flat `#f4ead8` double planes | **15%** |
| **4. Background ornamentation** | PNG parchment + CopticWatermark + corner radials | **20%** |
| **5. Header separation effect** | `AlphaHeaderShell` safe-area gap (empty band, not curved) + glow behind header | **10%** |

### By route type

| Route type | Dominant curve source | Approx % |
|------------|----------------------|----------|
| `/church`, `/books`, `/profile`, bible subpages | Route radial + AlphaBackground B | 90% radial |
| `/katameros` | PNG medallion + AlphaBackground B | 60% PNG / 30% radial |
| `/home`, `/synaxarium`, `/agpeya` | **AlphaBackground B only** (no route radial) | 70% global AlphaBackground |
| `/settings` | PNG + AlphaBackground B | 50/50 |
| `/alpha-connect` | None (dark linear shell) | 0% shell curve |

---

# PHASE 5 — REMOVAL SIMULATION (no code changes)

**Scenario:** Remove ALL top curved elements:
- AlphaBackground → Variant A or unmount
- All route `radial-gradient … 50% 0%` fixed/absolute layers
- PNG top ornaments (crop assets or extend flat cap)
- SearchOverlay unchanged (only when open)

### Screens that **improve**

| Screen | Why |
|--------|-----|
| `/church`, `/books`, `/profile`, bible subpages | Double/triple glow eliminated |
| `/katameros` | Top medallion arc gone with PNG fix |
| `/home`, `/synaxarium` | Cleaner flat top under DI |
| `/prayer-requests` | Ellipse + conic top effects removed |

### Screens that **may break visually**

| Screen | Risk |
|--------|------|
| `/profile` | Hero cards designed for golden top glow — may look flat |
| `/profile.membership` | Full-page radial ramp is structural color — needs flat replacement |
| `/church.directory` | Lavender top ramp — needs solid bg |
| `/agpeya` prayer pages | Full-page warm radial — needs flat cream |
| `/settings` | Loses parchment richness without PNG |

### Screens **depending** on effects

- Profile hub hero atmosphere (profile.index)
- Church warm “sanctuary glow”
- Bible home depth (BibleHomeScreen)
- Katameros / settings parchment identity

### Backgrounds becoming empty

- Flat `#f4ead8` from viewport shell **remains** — not empty
- Only **decorative depth** removed

### Katameros after removal

- **Still correct functionally**
- Visual: flat cream + parchment body (if PNG kept below clip) OR fully flat if PNG removed
- **Recommend:** keep PNG with top clip, remove radial stacks

### Settings after removal

- Control center loses parchment unless PNG kept with top crop
- UI cards still readable on flat shell

### Alpha Connect

- **Not affected** — uses `connect-secure` / `connect-classic` linear backdrops
- No AlphaBackground on connect routes

---

# PHASE 6 — FINAL RECOMMENDATION

## **OPTION D — Hybrid solution** (recommended)

### Justification

| Option | Verdict | Why |
|--------|---------|-----|
| **A — Remove everything globally** | Too aggressive | Breaks profile/church/agpeya atmosphere; PNG identity lost |
| **B — Route-specific artwork only** | Incomplete | Does not fix new global `AlphaBackground` duplicate; 18 files to maintain |
| **C — AlphaBackground only** | Incomplete | PNG katameros/settings curves remain; route duplicates remain on B |
| **D — Hybrid** | **Best** | One global source of truth + flat default + localized PNG handling |

### Hybrid plan (future — not applied now)

1. **Set global default to AlphaBackground Variant A** (no radial).
2. **Remove route-level duplicate radial bowls** (18 files) after QA — single global source if glow ever wanted again (Variant C).
3. **Keep PNG backgrounds** for katameros/settings with **mandatory top flat cap** (extend clip if needed).
4. **Keep `AlphaScreenFrame` + flat `.alpha-viewport-root--shell`** — required infrastructure.
5. **Do not touch Alpha Connect** dark shell.
6. **Optional:** Variant C globally if subtle warmth needed post-cleanup.

---

## Removal priority (when implementing)

| Priority | Target | Impact |
|----------|--------|--------|
| P0 | Route `fixed inset-0` top radials | Highest — eliminates double bowl with AlphaBackground |
| P1 | AlphaBackground default → A | Stops global curve on home/synaxarium |
| P2 | PNG top clip extension (katameros, control-center) | Fixes medallion arc |
| P3 | Profile/church directory opaque ramps | Special-case color replacement |
| P4 | SearchOverlay | Only if users report white cap when search closed (currently unmounts when closed) |

---

## Screenshots / references

- Katameros curve: user screenshot `browser-screenshot-d035570d…`
- A/B/C preview: `/dev/background-preview`
- Prior reports: `2026-06-17_06-40-00_GLOBAL_TOP_CURVED_ELEMENT_ANALYSIS.md`, `2026-06-17_07-00-00_ALPHA_BACKGROUND_ABC_PREVIEW.md`

---

## Overall Status

**ANALYSIS COMPLETE — READ ONLY — NO CHANGES APPLIED**
