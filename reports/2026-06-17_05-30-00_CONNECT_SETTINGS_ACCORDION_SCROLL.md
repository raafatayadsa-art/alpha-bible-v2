# Alpha Connect — Settings Accordion Scroll Fix

**Date:** 2026-06-17  
**Scope:** Auto-scroll on expandable settings section open

---

## Executive Summary

When any `SettingsGlassCard` accordion opens in Alpha Connect settings, the page now smoothly scrolls so the section header sits near the top of the scroll viewport — ensuring the title and start of content are immediately visible.

**Overall Status:** PASS

---

## Findings

### Root cause
Settings scroll inside `.alpha-screen-frame-scroll`. Expanding a section adds content below the toggle without adjusting scroll position, leaving the header partially above the viewport.

### Fix
- `scrollConnectSettingsSectionIntoView()` targets the section toggle button within the frame scroll container
- `scrollTo({ behavior: "smooth" })` with 12px top offset
- Triggered on `open` via `requestAnimationFrame` + post-expand timeout (320ms, matches 300ms grid transition)
- Implemented in `SettingsGlassCard` — all current and future sections using this component inherit behavior

### Sections covered
Audio & Connection, Appearance, Push To Talk, Privacy, Ephemeral, Groups (notifications), Security, Storage, About

### Unchanged
Design, spacing, colors, layout, accordion animations

---

## Warnings

None.

---

## Errors

None.

---

## Recommendations

Manual QA: open lower sections (Security, Storage) after scrolling mid-page; confirm header lands at top with content visible.

---

## Overall Status

**PASS**
