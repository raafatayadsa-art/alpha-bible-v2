# Profile Coptic Avatar + 3D Glass Icons + Church Shield Rules

**Date:** 2026-06-29

---

## Executive Summary

Profile avatar enlarged with ornate Coptic gold frame and glowing cross crown. Section icons upgraded to 3D glass style. Church shield shows only for affiliated members (`getChurchShieldRoleSync`); non-affiliated users get no shield. Suggested friends section always on when community module enabled. Build **PASS**. Pushed.

---

## Findings

| Feature | Implementation |
|---------|----------------|
| Avatar | `ProfileCopticAvatarFrame` — 140px photo, gold ring, Ⲁ ticks, glowing `CopticCross` |
| Icons | `ProfileAccentIcon` — glass blur, 3D inset/outset shadows |
| Shield | Profile: church shield only if `isApproved`; no platform-only shield |
| Suggested friends | Always visible when `community` module on; default tab مقترحون |
| Discover shields | Only when `roleType` present (church member) |

---

## Warnings

- Shield requires active church membership sync in auth context.
- FoF discover members without `roleType` show no shield (correct).

---

## Errors

None.

---

## Overall Status

**PASS**
