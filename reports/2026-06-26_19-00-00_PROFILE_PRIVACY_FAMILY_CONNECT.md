# Profile Privacy — أفراد العائلة والتواصل

**Date:** 2026-06-26

---

## Executive Summary

Added **أفراد العائلة** and **التواصل مع الأشخاص** to profile field privacy in `/profile/edit`, with visibility applied on `/profile`.

---

## Findings

- `ProfileFieldPrivacy` extended with `family` and `peopleConnect`.
- Defaults: `family` → الأصدقاء فقط, `peopleConnect` → أعضاء الكنيسة.
- Edit screen privacy section lists both fields with standard visibility chips (الجميع / الكنيسة / الأصدقاء / إخفاء).
- `ProfilePremiumScreen` hides each `CollapsiblePeopleOrbit` card when set to إخفاء.
- Existing saved profiles merge new keys from `DEFAULT_FIELD_PRIVACY` on load (no migration bump required).

---

## Warnings

- Public profile viewer logic (`isFieldVisibleToViewer`) is ready; full public profile route not wired yet.

---

## Errors

None.

---

## Recommendations

- When public profiles ship, pass viewer context to `isFieldVisibleToViewer` for family/connect cards.

---

## Overall Status

**PASS**
