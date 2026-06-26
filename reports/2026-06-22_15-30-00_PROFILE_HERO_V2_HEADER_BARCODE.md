# Profile Hero V2 — Scene, Header, Name Ledger, Barcode Ornaments

## Executive Summary

Updated profile hero with new user scene (1024×682), repositioned name ledger under avatar inside the artwork, swapped header controls (back right / settings left), and enriched membership barcode with Coptic glyphs and edge filigree.

## Findings

### Hero scene
- Replaced asset **`public/profile/profile-hero-scene.png`** (new attachment).
- Aspect ratio **`1024 / 682`**; avatar **`top 13.5%` · `width 17.2%`**.

### Name plate
- **`ProfileNameLedger`** directly under avatar inside hero — same gradient/blur as verse **like** cell + **Ⲁ** gold glyph.

### Header (RTL)
- **Right:** back (`ChevronRight` + `goBack` / home fallback).
- **Left:** settings menu (`ProfileSettingsMenu menuAlign="end"`).
- **Removed:** notifications bell.

### Membership card
- **Ⲁ / Ⲱ** watermark glyphs inside card.
- Double inner gold borders + **✦ ⲁⲗⲫⲁ ✦** edge filigree + stacked corner ornaments.

## Warnings

None.

## Errors

None. `npm run build` — PASS.

## Recommendations

Fine-tune avatar/name vertical offset if user requests pixel-perfect alignment on device.

## Overall Status

**PASS**
