# Home Header Avatar Photo Fix

**Date:** 2026-06-27

---

## Executive Summary

Fixed missing profile photo in the home screen avatar circle. Root cause was incorrect hook destructuring in `ProfileSettingsMenu`.

---

## Findings

- `useProfileUser()` returns `{ state, patch, ... }`, not the state object directly.
- Home menu used `profileUser.customAvatarUrl` which was always `undefined`.
- Profile screen correctly uses `const { state: profileUser } = useProfileUser()`.
- Fix: destructure `state` so `customAvatarUrl` and Supabase/OAuth `avatarUrl` resolve via `resolveProfileDisplayAvatar`.

---

## Warnings

- Placeholder `pravatar.cc` URLs are still intentionally hidden on home (initials shown instead).

---

## Errors

None.

---

## Recommendations

- Reload home after login; avatar should match profile page photo.

---

## Overall Status

**PASS**
