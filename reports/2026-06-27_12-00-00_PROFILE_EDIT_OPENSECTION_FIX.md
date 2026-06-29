# Profile Edit Screen Fix — openSection ReferenceError

**Date:** 2026-06-27  
**Scope:** `/profile/edit` — ProfileEditScreen crash on load

---

## Executive Summary

The profile edit screen (`ProfileEditScreen.tsx`) failed to render because `openSection` and `setOpenSection` were used without a `useState` declaration. This caused a runtime `ReferenceError` and a blank/crashed screen when navigating to profile edit from the avatar menu or settings.

---

## Findings

1. **Missing state:** `toggleSection` called `setOpenSection`, and JSX referenced `openSection === "personal" | "privacy" | "church"`, but no `const [openSection, setOpenSection] = useState(...)` existed.
2. **Impact:** React error boundary or white screen on every visit to `/profile/edit`.
3. **Unused import:** `resolveAccountAvatar` was imported but unused (cleaned up).

---

## Warnings

- Guest users can open the screen but avatar cloud upload on save still requires `user?.id`; local-only edits (bio, privacy) still work.

---

## Errors

- **Fixed:** `ReferenceError: openSection is not defined` (implicit — variable never declared).

---

## Recommendations

1. Smoke-test `/profile/edit` from avatar menu → "تحرير الملف الشخصي".
2. Expand sections (personal, privacy, church) and verify save.
3. Consider a quick lint rule or test that catches undeclared identifiers in TSX (TypeScript should catch this if strict — verify tsconfig).

---

## Overall Status

**PASS** — Fix applied; production build succeeds.

### Change

- `src/features/profile/ProfileEditScreen.tsx`: Added `useState<EditSectionId | null>("personal")` for accordion sections.
