# Dynamic Island Top Frame Fix (v2)

**Date:** 2026-06-17  
**Scope:** Alpha Connect Secure/Classic, shell routes, viewport system  
**Build:** PASS

---

## Executive Summary

Further removed the curved “second frame” below the iPhone Dynamic Island. The primary remaining cause was the **top radial ellipse** on the Connect Secure backdrop itself (not just duplicate layers). That ellipse was flattened to a vertical linear gradient using the same color stops. Duplicate page-level fixed backgrounds on home/profile shell were also removed, and viewport inner panels were forced transparent so only one backdrop paints the top area.

---

## Findings

1. **Connect Secure top ellipse (primary)** — `radial-gradient(ellipse at top, …)` on `alpha-viewport-backdrop--connect-secure` drew a visible curved bowl directly under the status bar, even after stage/scroll deduplication in v1.

2. **Duplicate shell backgrounds** — `home.tsx` and `ProfileSubShell` each rendered a second `fixed inset-0` gradient on top of the root viewport shell backdrop, reproducing a layered curved glow at the top.

3. **Nested scroll/panel fills** — Viewport stage was transparent in v1, but scroll containers and panel wrappers could still inherit painted backgrounds from theme utilities.

4. **Settings hero card** — `ConnectSettingsLivePanel` used `rounded-3xl`, creating an oversized curved glass card immediately under the settings header (secondary, not under Dynamic Island).

5. **Classic chat header strip** — Embedded chat header still had a sage gradient bar (removed).

---

## Warnings

- Shell and messaging backdrops still use a top radial highlight (single layer). If a curved top glow is reported on cream routes, flatten those backdrops the same way as Connect Secure.
- Embedded chat `.connect-chat-surface` keeps its panel fill (content area only).

---

## Errors

None. `npm run build` — PASS.

---

## Changes Made

| File | Change |
|------|--------|
| `alpha-viewport.css` | Connect Secure backdrop: ellipse → linear gradient (same colors); stage + scroll + panels transparent when backdrop present |
| `styles.css` | `--gradient-bg` token flattened; classic chat header strip bg removed |
| `home.tsx` | Removed duplicate fixed full-screen gradient |
| `Shell.tsx` | Removed duplicate fixed full-screen gradient |
| `AlphaConnectSettings.tsx` | Live panel `rounded-3xl` → `rounded-2xl` |

Theme colors unchanged.

---

## Recommendations

1. Hard-refresh `/alpha-connect` on iPhone — top area should show flat Secure gradient + header only.
2. Spot-check `/home` and profile sub-pages for single shell backdrop at top.

---

## Overall Status

**PASS**
