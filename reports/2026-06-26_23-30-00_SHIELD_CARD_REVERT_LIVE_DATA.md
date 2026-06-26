# Shield Card — Revert UX · Keep Live Data

**Date:** 2026-06-26

---

## Executive Summary

Restored original shield verification overlay (animated card). User profile data remains wired via `profileInfo`.

---

## Findings

- Removed `openMembership` direct navigation from `AlphaShield`.
- Removed **عرض بطاقة العضوية** button from verification overlay.
- Profile hero shield: tap → verification card (as before).
- `profileInfo` still supplies: church name, member since, role label; plus `userName` / `userAvatar` on card header.

---

## Overall Status

**PASS**
