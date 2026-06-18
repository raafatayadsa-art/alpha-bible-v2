# TOP AREA FORENSIC ANALYSIS — Katameros (`/katameros`)

**Date:** 2026-06-17  
**Mode:** READ ONLY — no code changes  
**Route analyzed:** `/katameros` — list view (`KatamerosHome`)  
**Reference device:** iPhone-class viewport **393 × 852 px**, `env(safe-area-inset-top) ≈ 59px` (Dynamic Island)

---

## Executive Summary

**Disabling / Variant-A AlphaBackground produces no visible change on Katameros because it is not the primary curve source.**

On Katameros, Variant A renders the **same flat `#f4ead8`** as:

- `html.alpha-viewport-bg-shell body`
- `.alpha-viewport-root--shell`
- `KatamerosScreenBackground` flat cap

All four layers are **indistinguishable flat cream** — toggling AlphaBackground cannot remove a curve that AlphaBackground never drew on this route (Variant A has no gradient).

**The visible top curve is overwhelmingly caused by:**

> **`KatamerosScreenBackground` PNG (`katameros-reading-bg.png`)** — the image’s **top-center circular medallion arc** becomes visible exactly where the flat cap ends (`top: calc(safe-area + 56px)`), showing through the **transparent** `AlphaHeaderShell`.

Secondary contributors: safe-area padding (top gap), transparent header (no fill), viewport lock column (structural, not curved).

---

## Why AlphaBackground Change Did Nothing (Forensic Proof)

| Layer | Variant A | Variant B | Katameros visible difference |
|-------|-----------|-----------|------------------------------|
| `AlphaBackground` | `#f4ead8` fixed full screen | + top radial bowl | A vs B: **none** on Katameros if user already on A |
| `.alpha-viewport-root--shell` | `#f4ead8` | same | identical |
| `html/body` shell class | `#f4ead8` | same | identical |
| Katameros flat cap | `#f4ead8` | same | identical |
| Katameros PNG | medallion arc | same | **unchanged by AlphaBackground** |

**Conclusion:** The element you still see is **`KatamerosScreenBackground` → `<img katameros-reading-bg.png>`**, not `AlphaBackground`.

---

## Real DOM Tree (Katameros list — top to first card)

```
html.alpha-viewport-lock.alpha-viewport-bg-shell          [100% × 100dvh, bg #f4ead8]
└── body.font-arabic-serif                                [100%, bg #f4ead8]
    └── QueryClientProvider
        └── AlphaNavigationProvider
            └── BibleSearchProvider
                └── AlphaBackgroundProvider
                    ├── AlphaViewportSync                 [null — no DOM node]
                    ├── AlphaScreenFrame                  → div.alpha-viewport-root
                    │   ├── AlphaBackground               → div[data-alpha-background] FIXED
                    │   └── div.alpha-viewport-stage
                    │       └── div.alpha-viewport-panel--scroll
                    │           └── div.alpha-viewport-scroll
                    │               └── KatamerosHome       → div.relative.min-h-dvh
                    │                   ├── KatamerosScreenBackground → div.absolute.inset-0
                    │                   │   ├── div flat cap              → div.absolute TOP
                    │                   │   ├── img katameros-reading-bg  → PNG
                    │                   │   └── div overlay tint
                    │                   ├── AlphaHeaderShell              → div z-30
                    │                   │   └── AlphaHeader               → header
                    │                   │       ├── BackButton slot (44×44)
                    │                   │       ├── center (cross + title)
                    │                   │       └── notif + search (44×44)
                    │                   └── main.relative.z-10
                    │                       └── div.hero.rounded-3xl.mt-3  ← FIRST CARD
                    ├── GlobalBackButton                          [null on /katameros]
                    └── Toaster
```

---

## Screenshot Mapping (viewport Y-axis)

```
┌─────────────────────────────────────────────  y = 0
│  ▓▓▓▓▓▓▓▓▓  Dynamic Island (OS chrome)  ▓▓▓▓▓▓▓▓▓
│  ─ ─ ─ ─ ─ ─ safe-area-inset-top ≈ 59px ─ ─ ─ ─ ─
├─────────────────────────────────────────────  y ≈ 59
│  LAYER A — Flat cream band (4 stacked sources, same color):
│    • html/body #f4ead8
│    • AlphaBackground Variant A (fixed, full viewport)     ← invisible vs shell
│    • .alpha-viewport-root--shell #f4ead8
│    • Katameros flat cap div #f4ead8 (0 → 115px)
│
│  LAYER B — AlphaHeaderShell (TRANSPARENT background)
│    • pt safe-area 59px — creates intentional top breathing room
│    • Header row: buttons 44px + center cross/title ~52px
│    • pb-2 = 8px
├─────────────────────────────────────────────  y ≈ 115  ★ CAP END / PNG START
│  LAYER C — PNG medallion UPPER ARC (PRIMARY CURVE) ★★★
│    katameros-reading-bg.png
│    top = calc(59px + 56px) = 115px
│    object-cover, objectPosition center top
│    → first visible pixels = circular cross medallion top curve
│    Shows THROUGH transparent AlphaHeaderShell (z-30, no bg)
├─────────────────────────────────────────────  y ≈ 119  ★ Header block ends
│  (4px zone: PNG arc visible behind header bottom — no cap cover)
├─────────────────────────────────────────────  y ≈ 131
│  LAYER D — First card (Hero)
│    main > div.mt-3.rounded-3xl.min-h-[190px]
│    katameros-hero.png + dark gradient overlay
└─────────────────────────────────────────────
```

---

## Layer-by-Layer Forensic Table

### Reference formulas (any device)

| Symbol | Formula |
|--------|---------|
| `SAT` | `max(env(safe-area-inset-top), 14px)` |
| `CAP_H` | `calc(SAT + 56px)` — `KATAMEROS_BG_TOP` |
| `HEADER_H` | `SAT + max(44px, ~52px center) + 8px` ≈ `SAT + 60px` |
| `FIRST_CARD_Y` | `HEADER_H + 12px` (`mt-3`) |

### iPhone reference (SAT = 59px)

| # | Component | File | DOM selector / class | Height (px) | Visible? | Role |
|---|-----------|------|----------------------|-------------|----------|------|
| 0 | OS safe area | — | — | **59** | Yes (empty cream) | Space below Dynamic Island |
| 1 | `html` + `body` shell | `alpha-viewport.css` | `html.alpha-viewport-bg-shell` | **852** (full) | Yes — flat cream | Overscroll / bleed fill |
| 2 | **`AlphaBackground`** | `AlphaBackground.tsx` | `[data-alpha-background]` fixed `inset-0 z-0` | **852** (100dvh) | Yes but **indistinguishable** | Variant A = `#f4ead8` only — **NOT curve source** |
| 3 | **`AlphaScreenFrame` root** | `AlphaScreenFrame.tsx` | `.alpha-viewport-root.alpha-viewport-root--shell` | **852** (100dvh) | Yes — flat cream | Scroll lock owner |
| 4 | Viewport stage | `alpha-viewport.css` | `.alpha-viewport-stage.alpha-viewport-phone` | **852** (100%) | Transparent container | max-width 440px column |
| 5 | Scroll panel | `alpha-viewport.css` | `.alpha-viewport-panel--scroll` | **852** | Transparent | Flex child |
| 6 | Scroll surface | `alpha-viewport.css` | `.alpha-viewport-scroll` | **852+** (scroll) | Transparent | Single scroll owner |
| 7 | Katameros page root | `katameros.index.tsx` | `div.relative.min-h-dvh` | **≥852** | Transparent | Positioning context |
| 8a | **Flat cap** | `KatamerosScreenBackground.tsx` | `div.absolute.top-0 bg-[#f4ead8] z-[1]` | **115** (`59+56`) | **Yes — solid band** | Masks PNG above cap line |
| 8b | **PNG background** | `KatamerosScreenBackground.tsx` | `img` `katameros-reading-bg.png` | **737+** (`852-115`) | **Yes — PRIMARY ART** | **Medallion arc at y=115** ★ |
| 8c | PNG tint overlay | `KatamerosScreenBackground.tsx` | `div` `bg-[#f5edd8]/08` | **737+** | Subtle | Texture unify |
| 9 | **`AlphaHeaderShell`** | `AlphaHeader.tsx` | `div` `ALPHA_HEADER_FRAME` `z-30` | **~119** total block | **Yes — UI only** | **Transparent** — shows PNG arc |
| 10 | `AlphaHeader` | `AlphaHeader.tsx` | `header` flex | **~52** content row | Yes | Back, cross, title, buttons |
| 11 | First card (Hero) | `katameros.index.tsx` | `div.rounded-3xl.mt-3` | **≥190** + 12 margin | Yes | First content card |

---

## Symptom → Responsible Element

| Visual symptom | Primary cause | % est. | Why AlphaBackground irrelevant |
|----------------|---------------|--------|--------------------------------|
| **Top empty gap below DI** | `AlphaHeaderShell` `pt-[max(env(safe-area-inset-top),14px)]` | **70%** | Padding, not AlphaBackground |
| | Flat cap + shell same color fill safe zone | 20% | Same `#f4ead8` |
| | Header vertical centering | 10% | Layout |
| **Top curve / bowl** | **PNG medallion arc at `top: CAP_H`** | **~85%** | Asset artwork, starts where cap ends |
| | Transparent header revealing PNG | 10% | No header background |
| | AlphaBackground | **0%** on Variant A | No gradient |
| **Frame-in-frame feeling** | PNG circular medallion reads as inner “screen” | **60%** | Ornamental arch |
| | `max-width: 440px` viewport column | 15% | Structural (same bg color on phone) |
| | Hero card `rounded-3xl` inset below header | 15% | Card chrome |
| | Viewport `100dvh` lock | 10% | App shell |
| **Screen inside screen** | Medallion + parchment texture vs flat cap seam at y=115 | **55%** | Cap/PNG boundary |
| | Viewport scroll inside locked root | 25% | Architecture |
| | Rounded hero card floating on parchment | 20% | Content design |

---

## AlphaBackground — Forensic Verdict

| Property | Value |
|----------|-------|
| File | `src/components/alpha/AlphaBackground.tsx` |
| Mount | Inside `AlphaScreenFrame` when backdrop = `shell` |
| Position | `fixed inset-0 z-[0]` |
| Variant A | `backgroundColor: #f4ead8`, `backgroundImage: undefined` |
| Height | Full viewport (852px ref) |
| Visible curve? | **NO** |
| Visible at all? | Only as flat cream — **same as 3 other layers** |
| Explains user observation? | **YES — disabling it changes nothing visible** |

---

## KatamerosScreenBackground — Forensic Verdict (PRIMARY)

| Property | Value |
|----------|-------|
| File | `src/features/katameros/components/KatamerosScreenBackground.tsx` |
| Position | `absolute inset-0 z-0` (relative to Katameros page, not viewport) |
| Flat cap height | `calc(max(env(safe-area-inset-top,0px),14px) + 56px)` → **115px** @ 59px SAT |
| PNG | `src/assets/katameros-reading-bg.png` |
| PNG placement | `top: 115px`, `object-cover`, `objectPosition: center top` |
| Asset top edge | **Straight** (file crop) — but **top pixel row = upper arc of circular medallion** |
| Visible curve? | **YES — this is the curve you see** |
| Cap sufficient? | **NO** — cap ends at 115px; header extends to ~119px; medallion arc spans ~40–80px below PNG start |

**Asset forensic note:** The PNG is a tall parchment with a **large centered cross medallion**. The file’s top edge cuts through the medallion. When the image is positioned at `y=115`, the **first rendered row is the curved top of that medallion** — not a CSS border-radius.

---

## AlphaHeaderShell — Forensic Verdict

| Property | Value |
|----------|-------|
| File | `src/components/navigation/AlphaHeader.tsx` |
| Classes | `relative z-30 mx-auto w-full max-w-[440px] px-4 pb-2 pt-[max(env(safe-area-inset-top),14px)]` |
| Background | **None** (transparent) |
| Height @ ref | **~119px** block |
| Creates curve? | **No** — reveals PNG behind it |
| Creates top gap? | **Yes** — 59px top padding |

---

## Fixed / Absolute Layers in Top Zone (Katameros)

| Layer | Position | In top 131px? | Visible |
|-------|----------|---------------|---------|
| `AlphaBackground` | fixed inset-0 | Yes (full) | Flat only |
| Katameros flat cap | absolute top | 0–115px | Yes |
| Katameros PNG | absolute, top 115px | 115px+ | **Yes — curve** |
| Katameros tint | absolute, top 115px | 115px+ | Subtle |
| `AlphaHeaderShell` | relative z-30 | 0–119px | Transparent |
| `GlobalBackButton` | — | Not mounted | — |
| `BottomDock` | fixed bottom | No | — |

**No other fixed top decorative layers** on `/katameros` list view.

---

## Detail View Note (`KatamerosReadingDetail`)

If the user is on a reading detail (not list), an **additional** “mini screen” appears:

| Element | File | Height | Visible | Curve? |
|---------|------|--------|---------|--------|
| Sticky header wrapper | `katameros.index.tsx` L371 | `SAT + 8px` pad + card | Yes | **Yes — `rounded-2xl` card** |
| Inner header card | same L372 | ~48–56px | Yes | **CSS border-radius**, not PNG |

Same `KatamerosScreenBackground` PNG stack applies underneath.

---

## Overall Status

**ANALYSIS COMPLETE — READ ONLY**

**Primary responsible element for persistent top curve on Katameros:**

> `KatamerosScreenBackground` → `katameros-reading-bg.png` medallion arc at cap boundary (y ≈ 115px)

**Primary responsible element for top gap:**

> `AlphaHeaderShell` safe-area padding (`pt max(safe-area, 14px)`)

**AlphaBackground is NOT the primary cause** — Variant A is visually identical to the shell fill beneath it.
