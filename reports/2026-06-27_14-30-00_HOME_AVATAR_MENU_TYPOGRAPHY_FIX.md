# Home Avatar Menu, Typography & Real Photo Fix

**Date:** 2026-06-27  
**Scope:** Home header menu positioning, avatar size, real profile photo, home typography

---

## Executive Summary

Fixed profile dropdown clipping off-screen in RTL, enlarged home typography and avatar (56px), and replaced fake pravatar with real profile photo or initials. Build: **PASS**.

---

## Findings

1. **Menu position** — `computeAnchoredMenuLeft()` anchors menu under avatar (visual left in RTL), clamps to viewport; wider menu (228px) with larger labels (15px).
2. **Avatar** — `avatarSize="lg"` → `h-14 w-14` (56px), thicker gold ring.
3. **Real photo** — `resolveProfileDisplayAvatar()` uses custom avatar + Supabase/OAuth URL; skips `pravatar.cc`; shows initials gradient when no photo.
4. **Home typography** — `.alpha-home-screen` scales greeting, sections, journey/daily/news card titles (~17px).

---

## Warnings

- Users without uploaded/OAuth photo see initials (not stock image).

---

## Errors

None in build.

---

## Recommendations

- Sync `userName` in greeting already uses auth display name first name.

---

## Overall Status

**PASS**
