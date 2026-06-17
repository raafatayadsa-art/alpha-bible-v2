# Shell Top Curved Cap Fix (Home / All App Screens)

**Date:** 2026-06-17  
**Scope:** Global shell viewport — home and all routes using root `AlphaScreenFrame`  
**Build:** PASS

---

## Executive Summary

Removed the beige curved “cap” above the main header (e.g. above «صباح الخير يا رأفت» on home). Cause: shell viewport backdrop used a top `radial-gradient` at 50% 0% plus empty safe-area padding above the header, which read as a second frame with rounded bottom edge.

---

## Findings

1. **Primary:** `.alpha-viewport-backdrop--shell` stacked three radial gradients on a cream linear base; the top ellipse (`120% 55% at 50% 0%`) drew a lighter tan bowl under the status bar on every shell route.
2. **Secondary:** Home (and profile shell) applied `pt-[safe-area]` on the page wrapper, leaving a blank band where the radial cap was most visible.
3. **Duplicate:** `alpha-messaging-bg` / `ALPHA_SCREEN_FRAME.shellBackground` used the same top radial pattern.

---

## Warnings

- Side/ambient radials on shell were removed with the top cap; background is now a flat vertical cream gradient (same color stops, no theme change).

---

## Errors

None.

---

## Changes Made

| File | Change |
|------|--------|
| `alpha-viewport.css` | Shell + messaging backdrops → flat linear gradient only |
| `AlphaScreenFrame.tsx` | `shellBackground` constant flattened |
| `styles.css` | `alpha-messaging-bg` / `alpha-chat-bg` flattened |
| `home.tsx` | Safe area on `<header>`, not outer wrapper |
| `Shell.tsx` | Same header safe-area pattern |

---

## Overall Status

**PASS**
