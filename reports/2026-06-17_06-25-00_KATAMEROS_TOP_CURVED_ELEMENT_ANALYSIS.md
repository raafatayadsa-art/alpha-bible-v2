# Katameros — Top Curved Element Analysis (Analysis Only)

**Date:** 2026-06-17  
**Route analyzed:** `/katameros` (home list — matches user screenshot)  
**Mode:** Read-only audit — **no code changes applied**

---

## Executive Summary

The curved “screen inside a screen” effect **below the Dynamic Island** on `/katameros` is **not** caused by Safe Area padding, Status Bar styling, or the header buttons row. It is caused by the **full-page parchment background image** rendered inside **`KatamerosScreenBackground`**, specifically the **ornate circular cross medallion baked into the PNG asset** at the top of `katameros-reading-bg.png`. When scaled with `object-cover`, the **lower arc of that circle** remains visible immediately under the Dynamic Island zone, producing clear curved edges that read as an extra frame.

---

## 1. Responsible Element

| Layer | DOM role | What you see |
|-------|----------|--------------|
| **Primary (curves)** | `<img>` loading `katameros-reading-bg.png` | Circular ornamental cross frame with curved borders |
| **Secondary (flat band)** | `<div class="... bg-[#f4ead8]">` cap inside same component | Flat cream strip (not curved) — may reinforce “double frame” next to curves |
| **Wrapper** | `<div class="... absolute inset-0 z-0 overflow-hidden">` | Positions background behind page — no curves itself |

---

## 2. File & Component

| Item | Value |
|------|-------|
| **Component name** | `KatamerosScreenBackground` |
| **Full path** | `src/features/katameros/components/KatamerosScreenBackground.tsx` |
| **Asset file** | `src/assets/katameros-reading-bg.png` |
| **Used by route** | `src/routes/katameros.index.tsx` (lines 170, 369, 491) |
| **Parent page component** | `KatamerosHome` / `KatamerosPageShell` / `KatamerosReadingDetail` in same route file |

---

## 3. Render Stack (top → bottom on `/katameros`)

```
html.alpha-viewport-bg-shell          ← flat #f4ead8 (NO curves)
└─ AlphaScreenFrame                   ← src/components/alpha/AlphaScreenFrame.tsx
   └─ .alpha-viewport-root--shell     ← flat #f4ead8 (NO curves)
      └─ .alpha-screen-frame-scroll   ← transparent scroll owner
         └─ div.relative.min-h-dvh     ← katameros.index.tsx ~L169
            ├─ KatamerosScreenBackground  ★ SOURCE OF CURVES
            │  ├─ div cap #f4ead8        ← flat top mask (KATAMEROS_BG_TOP)
            │  ├─ img (katameros-reading-bg.png)  ★★ PRIMARY CULPRIT
            │  └─ div tint overlay
            ├─ AlphaHeaderShell        ← padding only, NO background
            │  └─ AlphaHeader           ← buttons + cross + title
            └─ main
               └─ hero div.rounded-3xl ← TOO LOW (below header) — not DI issue
```

---

## 4. Classification (requested categories)

| Candidate | Verdict | Evidence |
|-----------|---------|----------|
| Header Background | **NO** (home view) | `AlphaHeaderShell` / `AlphaHeader` have no `background`, no `border-radius` on list screen |
| Hero Section | **NO** (for DI artifact) | Hero card `rounded-3xl` at `katameros.index.tsx` ~L196, starts after header + `mt-3` |
| **Decorative Shape** | **YES — PRIMARY** | Curves are **drawn inside PNG** (top-center medallion + ornate circles) |
| Card | **NO** (home view) | No top card on list screen; detail view has `rounded-2xl` header card ~L372 but only on reading detail |
| **Container** | **YES — SECONDARY** | `KatamerosScreenBackground` root `div` + cap `div` wrap the decorative image |
| Safe Area Wrapper | **NO** (visual cause) | `pt-[max(env(safe-area-inset-top),14px)]` on `AlphaHeaderShell` adds space only; does not draw curves |

**Final label:** **Decorative Shape** (asset-driven), hosted inside **Container** (`KatamerosScreenBackground`).

---

## 5. Code References

### Primary — background image

```15:21:src/features/katameros/components/KatamerosScreenBackground.tsx
      <img
        src={katamerosReadingBg}
        alt=""
        className="absolute inset-x-0 bottom-0 w-full object-cover"
        style={{ top: KATAMEROS_BG_TOP, objectPosition: "center top" }}
        decoding="async"
      />
```

### Asset import

```1:1:src/features/katameros/components/KatamerosScreenBackground.tsx
import katamerosReadingBg from "@/assets/katameros-reading-bg.png";
```

### Mount point (home screen)

```169:170:src/routes/katameros.index.tsx
    <div dir="rtl" className="relative min-h-dvh">
      <KatamerosScreenBackground />
```

### Cap mask (flat, not curved — secondary)

```11:14:src/features/katameros/components/KatamerosScreenBackground.tsx
      <div
        className="absolute inset-x-0 top-0 z-[1] bg-[#f4ead8]"
        style={{ height: KATAMEROS_BG_TOP }}
      />
```

---

## 6. Why It Looks Like a “Second Frame”

1. **Outer plane:** `.alpha-viewport-root--shell` paints flat `#f4ead8` on the global frame.
2. **Inner plane:** Parchment PNG with **large circular ornaments** is scaled full-width (`object-cover`).
3. **Top medallion** diameter exceeds current clip height `calc(max(safe-area,14px) + 56px)`, so the **bottom curve of the circle** still appears under the Dynamic Island.
4. Human eye reads that arc as a **rounded container lip** — “screen inside screen”.

This matches user observation: **not Safe Area code**, but **decorative artwork position + scale**.

---

## 7. Red Border Debug (NOT applied — per request)

To confirm visually in a **future** edit (not done now):

| Target | Temporary style |
|--------|-----------------|
| Primary | `img` in `KatamerosScreenBackground.tsx` → `outline: 3px solid red; outline-offset: -2px;` |
| Secondary cap | cap `div.bg-[#f4ead8]` → `outline: 3px dashed orange;` |
| Wrapper | root `div.absolute.inset-0` → `outline: 2px solid blue;` |

**Expected result:** Red outline will hug the **full parchment image area**; the curved artifact aligns with the **top ornamental circle** inside that box.

---

## 8. Excluded Elements (verified)

| Element | Path | Why excluded |
|---------|------|--------------|
| `AlphaScreenFrame` | `src/components/alpha/AlphaScreenFrame.tsx` | Solid `#f4ead8`, no radius |
| `AlphaHeaderShell` | `src/components/navigation/AlphaHeader.tsx` | Transparent wrapper |
| `AlphaHeader` | same | Flex toolbar only |
| Hero card | `katameros.index.tsx` ~L196 | Below header, `rounded-3xl` not at DI |
| `SearchOverlay` | `src/components/overlays/SearchOverlay.tsx` | Unmounted when closed |
| Dynamic Island pill | Browser/device chrome | Not app DOM |

---

## 9. Warnings

- Fix attempt already in repo (cap + clip) may be **insufficient** if medallion radius > clip height.
- Reading **detail** sub-view adds separate `rounded-2xl` header card (`katameros.index.tsx` ~L372) — different layout, not the list screenshot.
- Same PNG pattern may affect any screen reusing `KatamerosScreenBackground`.

---

## 10. Recommendations (for future fix — not applied)

1. Increase top clip OR crop asset top ornament in design.
2. Use `object-position` to push medallion out of viewport top.
3. Replace PNG top art with flat continuation of `#f4ead8`.
4. Apply red-border debug on `img` first to confirm with user before editing.

---

## Overall Status

**ANALYSIS COMPLETE — ROOT CAUSE IDENTIFIED**

**Primary responsible element:** `<img>` in **`KatamerosScreenBackground`** → **`src/features/katameros/components/KatamerosScreenBackground.tsx`** → asset **`src/assets/katameros-reading-bg.png`** (Decorative Shape inside Container).
