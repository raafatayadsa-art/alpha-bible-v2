# Home Header — Profile Avatar + Merged Settings

**Date:** 2026-06-27  
**Scope:** Home top bar UX only

---

## Executive Summary

Replaced the home header notifications + settings buttons with a single circular **profile avatar** that opens a merged menu (profile, edit, settings). Build: **PASS**.

---

## Findings

1. **`ProfileSettingsMenu`** — new `trigger="avatar"` mode:
   - Shows user photo (custom avatar + Supabase profile) in gold-ring circle (`h-11`)
   - Guest: user icon → tap navigates to `/login`
   - Menu: الملف الشخصي · تعديل الملف · الإعدادات
2. **`home.tsx`** — removed `AlphaNotificationButton`; single `ProfileSettingsMenu trigger="avatar"`.
3. Notifications remain on other screens via `AlphaHeader` / church flows.

---

## Warnings

- Home no longer exposes notifications bell; users reach notifications from other app surfaces.

---

## Errors

None in build.

---

## Recommendations

- Optional: unread notification dot on avatar edge.

---

## Overall Status

**PASS**
