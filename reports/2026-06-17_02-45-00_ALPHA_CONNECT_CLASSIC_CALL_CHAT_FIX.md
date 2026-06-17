# Alpha Connect Classic — Call Icons, Call Button Pulse, Outgoing Bubbles

**Date:** 2026-06-17  
**Scope:** Alpha Connect Classic UI fixes  
**Build:** PASS

---

## Executive Summary

Fixed three Classic theme UX issues: call history phone icon color parity, restored neon-green pulsing call button, and improved outgoing message bubble contrast.

---

## Findings

1. **RecentCallerRow** — Right-side phone button now uses `text-destructive` (missed) or `text-neon-green` (outgoing), matching left status icons.
2. **ConnectCallButton** — Re-enabled `pulse` on green `ConnectCircleButton`.
3. **Classic CSS** — Restored `connect-pulse-ring` animation and oklch neon green styling on `.connect-pulse-wrap--green.neon-ring`; bottom dock active tab uses `connect-dock-tab-active` for neon green accent.
4. **Outgoing bubbles** — `--connect-bubble-out` changed to `#b5d9c5` with stronger border/shadow for contrast against sage-mist background.

---

## Warnings

- Channel PTT mic ring also uses `connect-pulse-wrap--green` and now shows neon pulse (consistent with original Secure DNA).

---

## Errors

None.

---

## Overall Status

**PASS**
