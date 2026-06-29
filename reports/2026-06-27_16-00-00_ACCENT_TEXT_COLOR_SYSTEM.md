# Accent Text Color System — Green/Purple Hierarchy

**Date:** 2026-06-27  
**Scope:** Profile privacy, membership, auth CTAs, settings section labels

---

## Executive Summary

Introduced a unified green/purple accent text system for section titles, field labels/values, and selected chips. Fixed invisible Arabic auth submit buttons caused by undefined `bg-alpha-navy` + white `text-primary-foreground`.

---

## Findings

1. Privacy selections used gold; user requested **green** for selected options.
2. Membership/section headings were brown (`text-alpha-heading`); user wanted **purple/green** headers with distinct field text.
3. Login/register buttons: `bg-alpha-navy` was never registered in Tailwind `@theme` → white text on light background.

---

## Changes

### Tokens + utilities (`alpha-theme.css`, `styles.css`)
- `--alpha-accent-green`, `--alpha-accent-purple`, field label/value colors
- `.text-alpha-section-green`, `.text-alpha-section-purple`
- `.text-alpha-field-label`, `.text-alpha-field-value`, `.text-alpha-field-value-purple`
- `.alpha-chip-selected-green`, `.alpha-chip-unselected`
- `.alpha-auth-cta` (purple), `.alpha-auth-cta-green`
- Legacy auth colors: `--alpha-cream`, `--alpha-navy`, `--alpha-paper`, `--alpha-gold-dark`

### Screens updated
- **Profile edit:** privacy chips green; section titles colored; field hierarchy
- **Membership:** purple page title, green "بيانات العضوية", purple/green field text
- **Auth (Arabic):** purple login CTA, green register CTA, visible titles
- **Premium signup/username:** green CTA buttons, purple/green titles
- **Settings:** purple section labels + card titles

---

## Warnings

- Dark mode chip styles use white-mix gradients; verify on device.

---

## Errors

None — build PASS.

---

## Overall Status

**PASS**
