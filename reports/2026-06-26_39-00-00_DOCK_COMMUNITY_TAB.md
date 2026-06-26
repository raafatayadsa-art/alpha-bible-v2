# Bottom Dock — مجتمعي Tab

**Date:** 2026-06-26

---

## Executive Summary

Added **مجتمعي** tab to the main bottom dock between **الكتاب المقدس** and **الملف الشخصي**, using `Users` icon and `/church` route. Visible when the `community` platform module is enabled. Cleaned unused raised-tab / logo code from `BottomDock`. Build **PASS**.

---

## Findings

| Item | Detail |
|------|--------|
| Label | `nav.community` → «مجتمعي» (AR) / «My Community» (EN) |
| Position | After Bible, before Profile |
| Route | `/church` (community hub) |
| Icon | Lucide `Users` |
| Gating | `isModuleEnabled("community")` |

---

## Warnings

- Replaces prior dock label «كنيستك» in the bottom bar (same route, new name).

---

## Errors

None expected.

---

## Recommendations

- If a dedicated `/community` hub is added later, update the tab `to` prop.

---

## Overall Status

**PASS**
