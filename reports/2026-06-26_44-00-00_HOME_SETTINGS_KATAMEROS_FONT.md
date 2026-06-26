# Home Settings Button + Katameros Font Max 25

**Date:** 2026-06-26

---

## Executive Summary

Added and fixed the settings button on the home screen header; increased Katameros reading bottom bar font maximum to 25px. Build: **PASS**.

---

## Findings

### Home Settings Button
- Added `ProfileSettingsMenu` next to notifications in `home.tsx`
- Menu opens: تعديل الملف الشخصي · الإعدادات
- `ProfileSettingsMenu` hardened: `data-alpha-edge-ignore`, `z-[60]`, theme-aware dropdown, `stopPropagation` on tap

### Katameros Font Size
- `KATAMEROS_FONT_MAX`: 17 → **25**
- `fontStep`: 1.5 → **1** (smoother steps to max)
- Range: 13.5 – 25 via bottom `AutoScrollControls`

---

## Warnings

None.

---

## Errors

None.

---

## Recommendations

None for this scope.

---

## Overall Status

**PASS**
