# Alpha Connect — Trust Center Channels Drawer Redesign

**Date:** 2026-06-17  
**Scope:** Restyle Trust & Safety Center across all Alpha Connect screens to match Channels list drawer DNA

---

## Executive Summary

Trust Center (`AlphaTrustShieldSheet`) now opens as a right-side `glass-strong` drawer matching the Channels/Participants list UI: bold title header, green shield badge, glass section cards, and green section labels — instead of the previous anchored dropdown sheet.

**Overall Status:** PASS

---

## Findings

### Visual alignment with Channels drawer
| Element | Implementation |
|---------|----------------|
| Panel | `connect-trust-center-drawer` · `glass-strong` · 340px · slide from right |
| Header | Title 20px bold, muted subtitle, X close + ShieldCheck glass circle |
| Sections | Green `ShieldCheck` label row + `glass rounded-2xl` card |
| Rows | Label muted / value foreground, subtle dividers |
| Bullets | Muted text + neon-green dot |
| Theme | Portal wraps `alpha-connect-theme` + Classic sync |

### Files changed
- `src/components/alpha/AlphaTrustShield.tsx` — drawer shell + restyled body
- `src/components/alpha/styles.css` — drawer animation + classic override
- `src/components/alpha/alpha-trust-shield-content.ts` — fixed title prefix typo

### Surfaces covered
- Alpha Connect main (all contexts via `AlphaTrustShield` / `AlphaTrustShieldSheet`)
- `/call` and `/personal-call` security sheets
- Channel, messages, voice, settings, church contexts (same component)

---

## Warnings

- `anchorRef` is retained for API compatibility but drawer no longer anchors to the shield button position.
- `ConnectTopAnchorSheet` remains for other Connect sheets; Trust Center no longer uses it.

---

## Errors

None.

---

## Recommendations

Visual QA: Secure + Classic themes — open trust shield from Connect header, chat, call screens; confirm drawer matches Channels side panel.

---

## Overall Status

**PASS**
