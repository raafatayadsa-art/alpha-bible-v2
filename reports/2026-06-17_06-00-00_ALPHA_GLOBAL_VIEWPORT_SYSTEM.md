# Alpha Global Viewport System — Overscroll & Theme Bleed Audit

**Date:** 2026-06-17  
**Scope:** Global viewport lock, themed overscroll backdrops, nested scroll fixes

---

## Executive Summary

Introduced a unified **Alpha Viewport System** (`alpha-viewport.css` + `alpha-viewport.ts` + refactored `AlphaScreenFrame`) that locks document scroll, uses a fixed full-screen themed backdrop during rubber-band overscroll, and enforces a single scroll owner per screen. Fixed nested `100dvh` stacks and white-body bleed on Connect/messaging routes.

**Overall Status:** PASS (core Alpha surfaces); PARTIAL (legacy church/bible routes still use page-level `min-h-screen` document patterns inside shell frame scroll — now contained by frame lock)

---

## Root Causes

| Issue | Cause |
|-------|-------|
| White/light flash on Connect overscroll | `body { background: white }` while Connect routes excluded root shell |
| Cream shell visible in dark Connect | Fixed gold shell at `z-index: -10` + document scroll |
| Bottom nav / dock bleed | Document scroll + nested `100dvh` panels |
| Theme cross-bleed | Mismatched scroll owners (document vs frame vs inner) |
| Hidden content above/below | `min-h-[100dvh]` inside `100dvh` frames + `flow` mode document scroll |

---

## Global System (New)

### Files
- `src/components/alpha/alpha-viewport.css` — viewport root, backdrop layers, scroll rules
- `src/components/alpha/alpha-viewport.ts` — `AlphaViewportSync`, route/theme backdrop resolver
- `src/components/alpha/AlphaScreenFrame.tsx` — unified `alpha-viewport-root` for all modes
- `src/routes/__root.tsx` — imports CSS + mounts `AlphaViewportSync`

### Rules
1. **`html.alpha-viewport-lock`** — `overflow: hidden`, `height: 100%`, `overscroll-behavior: none`
2. **`html.alpha-viewport-bg-*`** — solid fallback matching active theme (shell / messaging / connect-secure / connect-classic)
3. **`.alpha-viewport-backdrop--*`** — fixed `inset: 0` gradient layer visible during overscroll
4. **`.alpha-viewport-scroll`** — single scroll container; `overscroll-behavior: none`
5. **`flow` mode** — now identical to `scroll` (inner frame scroll, no document scroll)

---

## Screen Audit & Fixes

### Alpha Connect (`/alpha-connect`)
| Issue | Fix |
|-------|-----|
| White body on overscroll | `viewportBackdrop={connectViewportBackdrop}` on all frames |
| Nested `h-[100dvh]` in chat | → `h-full min-h-0` |
| Settings scroll trap | `AlphaConnectSettings` `min-h-[100dvh]` → `min-h-0` |
| Dock / theme bleed | Document lock + frame backdrop sync |

### Messages (`/messages`)
| Issue | Fix |
|-------|-----|
| No themed backdrop | `viewportBackdrop="messaging"` + `frameClassName="alpha-messaging-bg"` |
| Double `100dvh` | Conversations/chat/settings → `h-full min-h-0` |
| Settings clip | Inner `flex-1 overflow-y-auto` on settings scroll area |

### Voice Calls (`/call`, `/personal-call`)
| Issue | Fix |
|-------|-----|
| White overscroll | `viewportBackdrop` from Connect theme |
| Frame | Uses `alpha-viewport-panel--fixed` |

### Trust Center (portal sheet)
| Issue | Status |
|-------|--------|
| Portal outside frame | Already uses `alpha-connect-theme` wrapper + own backdrop overlay |
| Inner scroll | `overscroll-y-contain` on sheet body — OK |

### Connect Channels / Participants drawers
| Issue | Status |
|-------|--------|
| Fixed overlay | `bg-black/55` scrim — OK |
| No document scroll | Viewport lock prevents bleed behind drawers |

### Settings (Alpha Connect)
| Issue | Fix |
|-------|-----|
| Accordion scroll | Prior fix retained; now scrolls inside frame only |
| Tall content | Frame scroll + removed forced `min-h-[100dvh]` |

### Root shell routes (home, bible, church, profile, …)
| Issue | Fix |
|-------|-----|
| Document scroll in `flow` mode | **Fixed globally** — `flow` → inner `.alpha-viewport-scroll` |
| Cream shell on overscroll | `alpha-viewport-backdrop--shell` + `html.alpha-viewport-bg-shell` |

### Reservation screens
| Issue | Status |
|-------|--------|
| No dedicated routes | N/A — reservation is data-only feature flag |

### Excluded routes (platform, dev, diagnostics)
| Issue | Status |
|-------|--------|
| No viewport lock | Intentional — admin tooling |

### Intro (`/intro`)
| Issue | Status |
|-------|--------|
| Own body lock | `AlphaViewportSync` skips lock; onboarding manages overflow |

---

## Warnings

1. **Legacy pages** with local `min-h-screen` + padding may need follow-up audit if new nested scroll issues appear — frame lock should contain most cases.
2. **Wide screens** — phone column (440px) still centered; backdrop fills full width with correct theme (expected).
3. **Modals/portals** — body overflow lock is global; existing modal `body.overflow = hidden` patterns remain compatible.

---

## Errors

None (build PASS).

---

## Recommendations

1. QA on iOS Safari: rubber-band at top/bottom on Connect Secure + Classic, Messages, Home.
2. Migrate remaining standalone pages using document scroll to `AlphaScreenFrame` where possible.
3. Consider exporting `useAlphaViewportScrollRef()` for programmatic scroll (settings accordion already uses frame scroll query).

---

## Overall Status

**PASS** — Global viewport system deployed; primary Alpha Connect / Messages / Calls / Settings surfaces fixed.

---

## COPYABLE REPORT

```
ALPHA GLOBAL VIEWPORT SYSTEM
Status: PASS (core surfaces)

NEW:
- alpha-viewport.css + alpha-viewport.ts + AlphaViewportSync
- AlphaScreenFrame → alpha-viewport-root (all modes)
- flow = scroll (no document scroll)

FIXED:
- Connect/Messages/Calls: themed overscroll backdrop
- Removed nested 100dvh (chat, conversations, settings)
- html/body lock + theme bg classes
- Messaging settings scroll container

AUDIT: Trust Center OK (portal). Reservations N/A. Platform/dev unlocked.
BUILD: PASS
```
