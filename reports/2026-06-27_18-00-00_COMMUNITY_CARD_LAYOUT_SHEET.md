# Community Card Layout & Shield Sheet Report

**Date:** 2026-06-27  
**Scope:** Badge left / identity right, solid gray add-friend sheet, compact member sheet

---

## Executive Summary

Post headers now place **موثّق + kind badge** on the left and **avatar + name + shield** on the right. Add-friend and avatar-tap sheets use a **solid gray shield background** (#E4E9EF) for readable text and buttons. Avatar tap opens a **small** add-friend sheet. Build **PASS**.

---

## Findings

1. **`CommunityCardBadges`** — Left column: موثّق + optional kind (قراءة/صلاة/أجبية).
2. **`CommunityMomentCard` / `CommunityCommentItem`** — `justify-between` layout: identity right, badges left.
3. **`CommunityShieldSheet`** — `variant="solid"` default; gray shell matching Alpha Shield card.
4. **`CommunityMemberQuickSheet`** — Reduced to ~340px height; add-friend focused.
5. **`CommunityAddFriendMethodsPanel`** — Compact mode uses `COMMUNITY_SHIELD_INNER/ROW` with dark text.
6. **Build** — exit 0.

---

## Warnings

- Kind badge only on moment cards; comments show موثّق only on left.

---

## Errors

None.

---

## Overall Status

**PASS**
