# Global Top Curved Element — Full App Analysis (Read-Only)

**Date:** 2026-06-17  
**Scope:** Entire Alpha Bible shell (all routes using `AlphaScreenFrame`)  
**Mode:** Analysis only — **no code changes**

---

## Executive Summary

There is **no single global React component with `border-radius` or SVG** that draws the curved cap below the Dynamic Island on every screen. The effect is **layered**:

1. **Universal outer shell** — `AlphaScreenFrame` (flat `#f4ead8`, **no curves in CSS**).
2. **App-wide curved illusion (majority of content screens)** — duplicated **inline decorative background `<div>`** layers using **`radial-gradient(120% 50% at 50% 0%, …)`** on **`fixed inset-0`** or **`absolute inset-0`** (17 route/feature files). This ellipse at the top is the **primary CSS curved shape** below the Dynamic Island.
3. **Parchment routes** — `KatamerosScreenBackground` / `ControlCenterScreenBackground` / `TrustSafetyScreenBackground` render **PNG assets** with **circular top ornaments** (curves baked into image, not CSS).

Screens like **`/home`**, **`/synaxarium`**, **`/agpeya`** use only the flat shell + flat page bg — **no top radial bowl** in route code. If a curve still appears there, it is from the **global shell stack**, not a curved global component.

---

## Requested Answers

### 1. Component name

| Role | Name |
|------|------|
| **Only true global layout wrapper (all shell routes)** | `AlphaScreenFrame` |
| **Primary curved-shape mechanism (most screens)** | *Unnamed inline div* — recurring **“top radial bowl” background pattern** (not extracted to a shared component) |
| **Parchment curved ornament (subset of routes)** | `KatamerosScreenBackground`, `ControlCenterScreenBackground`, `TrustSafetyScreenBackground` |
| **Shared header wrapper (not curved)** | `AlphaHeaderShell` |

### 2. File path

| Component / layer | Path |
|-------------------|------|
| Global viewport shell | `src/components/alpha/AlphaScreenFrame.tsx` |
| Shell CSS | `src/components/alpha/alpha-viewport.css` |
| Document bg sync | `src/components/alpha/alpha-viewport.ts` (`AlphaViewportSync`) |
| Root mount | `src/routes/__root.tsx` |
| Shared header frame | `src/components/navigation/AlphaHeader.tsx` (`AlphaHeaderShell`, `ALPHA_HEADER_FRAME`) |
| Katameros PNG bg | `src/features/katameros/components/KatamerosScreenBackground.tsx` |
| Settings PNG bg | `src/features/settings/components/ControlCenterScreenBackground.tsx` |
| Trust PNG bg | `src/features/settings/components/TrustSafetyScreenBackground.tsx` |

### 3. Screenshot reference

- **Katameros (PNG ornament curve):** User screenshot `browser-screenshot-d035570d-a7e1-4094-92ff-d7bb0f354f15.png` — curved cap above cross/header on `/katameros`.
- **Radial bowl pattern:** Same visual class appears on `/church`, `/books`, `/profile`, `/bible/*` subpages — elliptical lighter glow under Dynamic Island (no single screenshot in repo; same CSS pattern).

### 4. CSS class / selector responsible

#### A) Global shell (flat — **not the curve**)

| Selector | File | Curves? |
|----------|------|---------|
| `.alpha-viewport-root` | `alpha-viewport.css` | No |
| `.alpha-viewport-root--shell` | `alpha-viewport.css` | No — `background-color: #f4ead8` |
| `.alpha-screen-frame` | `styles.css` | No — `max-width: 440px` only |
| `html.alpha-viewport-bg-shell body` | `alpha-viewport.css` | No — flat overscroll fill |

#### B) Curved bowl (**primary curved shape on most routes**)

**No shared class name.** Inline `style.background` on a wrapper div, typically:

```css
background: radial-gradient(120% 50% at 50% 0%, rgba(255,231,184,0.5), transparent 60%), …
```

Common Tailwind on the same node:

- `pointer-events-none fixed inset-0 -z-0` (viewport-fixed — paints under Dynamic Island)
- or `pointer-events-none absolute inset-0 -z-0` (page-local)

**Example (church — representative):**

```2069:2077:src/routes/church.tsx
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-0"
        style={{
          background:
            "radial-gradient(120% 50% at 50% 0%, rgba(255,231,184,0.6), transparent 60%)," +
            ...
        }}
      />
```

#### C) PNG ornament curve (katameros / settings)

| Selector | File |
|----------|------|
| `img` inside `KatamerosScreenBackground` | `KatamerosScreenBackground.tsx` |
| `div.bg-[#f4ead8]` cap (flat mask, not curved) | same file |
| `img` in `ControlCenterScreenBackground` | `ControlCenterScreenBackground.tsx` |

Asset: `src/assets/katameros-reading-bg.png`, `src/assets/control-center-bg.png` (top circular cross medallion).

#### D) Shared header (padding only)

| Class constant | Value |
|----------------|-------|
| `ALPHA_HEADER_FRAME` | `relative z-30 mx-auto w-full max-w-[440px] px-4 pb-2 pt-[max(env(safe-area-inset-top),14px)]` |

No `border-radius`, no background — **not the curved cap**.

### 5. Does it affect all screens?

| Layer | All shell routes? | Creates curves? |
|-------|-------------------|-----------------|
| `AlphaScreenFrame` + `.alpha-viewport-root--shell` | **Yes** (~all routes except connect/call/messages/intro/platform) | **No** — flat fill; enables “double frame” *feel* when combined with inner decorative layers |
| Top radial bowl (`120% 50% at 50% 0%`) | **No** — **17 files** (see list below) | **Yes** — elliptical top glow |
| PNG ScreenBackground components | **No** — katameros + settings/trust only | **Yes** — circular ornament in asset |
| `AlphaHeaderShell` | Many header screens | **No** |
| `CopticWatermark` | home, synaxarium, church, profile shell, etc. | **No** — center letters, not top cap |
| `SearchOverlay` | When search open only | White `rounded-b-3xl` — not global |

**Routes WITHOUT top radial bowl in code:** `/home`, `/synaxarium`, `/agpeya`, `/katameros` (uses PNG instead), `/feasts` (check), connect stack.

---

## DOM Stack (every shell route)

```
html.alpha-viewport-bg-shell          ← flat #f4ead8
body
└─ AlphaScreenFrame                   ← src/components/alpha/AlphaScreenFrame.tsx
   .alpha-viewport-root.alpha-screen-frame.alpha-viewport-root--shell
   └─ .alpha-viewport-stage
      └─ .alpha-screen-frame-scroll
         └─ [Route page]
            ├─ (optional) fixed/absolute inset-0 radial-gradient div  ★ CURVES
            ├─ (optional) KatamerosScreenBackground / PNG bg         ★ CURVES
            ├─ (optional) CopticWatermark
            ├─ AlphaHeaderShell / local header
            └─ content
```

---

## Search Results Summary

### border-radius on top containers (global-relevant)

- **None** on `AlphaScreenFrame`, `alpha-viewport.css`, `__root.tsx`, `AlphaHeaderShell`.
- `rounded-b-3xl` on `SearchOverlay` — overlay only when open.
- `rounded-t-[22px]` etc. on **cards/sheets** — below header, not DI zone.

### pseudo-elements (::before / ::after)

- **None** on viewport shell or `AlphaScreenFrame`.
- Connect theme pulse rings only under `.alpha-connect-theme` — not shell routes.

### viewport shell backgrounds

- **`.alpha-viewport-root--shell`** — flat `#f4ead8` (current).
- Removed legacy `.alpha-viewport-backdrop--shell` (no longer in codebase).

### Files using top radial bowl pattern (17)

1. `src/routes/church.tsx`
2. `src/routes/church.post.$id.tsx`
3. `src/routes/church.chat.$contactId.tsx`
4. `src/routes/church.directory.tsx`
5. `src/routes/church.directory.$placeId.tsx`
6. `src/routes/books.tsx`
7. `src/routes/$book.index.tsx`
8. `src/routes/bible.notes.tsx`
9. `src/routes/bible.saved.tsx`
10. `src/routes/profile.index.tsx`
11. `src/routes/profile.messages.tsx`
12. `src/routes/profile.membership.tsx`
13. `src/routes/profile.service.tsx`
14. `src/routes/prayer-requests.tsx`
15. `src/features/bible-home/BibleHomeScreen.tsx`
16. `src/features/bible-home/BibleSubpagePlaceholder.tsx`
17. `src/features/church/PostBuilder.tsx`

---

## Classification (requested categories)

| Category | Verdict | Responsible |
|----------|---------|-------------|
| Header Background | Partial — radial bowl sits **behind** header, not in header component | Inline route `fixed inset-0` div |
| Hero Section | No — hero cards are lower on page | — |
| **Decorative Shape** | **YES — primary** | `radial-gradient(… at 50% 0%)` + PNG ornaments |
| Card | No at DI level | — |
| **Container** | **YES — secondary** | `AlphaScreenFrame` (outer flat shell) |
| Safe Area Wrapper | No visual curves | `AlphaHeaderShell` padding only |

---

## Red Border Debug (NOT applied)

Per user request — no modifications. When approved:

| Target | Expected match |
|--------|----------------|
| `outline: 3px solid red` on `.alpha-viewport-root--shell` | Full viewport — **flat**, no curve |
| Red on route `fixed inset-0` gradient div | **Curved bowl** under DI |
| Red on `KatamerosScreenBackground img` | Parchment + top medallion arc |

---

## Conclusion

**Exact global component for the outer frame:** `AlphaScreenFrame` — affects all shell routes, **does not draw curves**.

**Exact source of the curved shape below Dynamic Island across the app:** the **recurring full-viewport decorative background layer** using **`radial-gradient(120% 50% at 50% 0%, …)`** (copy-pasted in 17 files), plus **PNG ScreenBackground components** on katameros/settings routes. There is **no centralized shared component** for the curve today — it is an **architectural pattern**, not one named export.

---

## Overall Status

**ANALYSIS COMPLETE**
