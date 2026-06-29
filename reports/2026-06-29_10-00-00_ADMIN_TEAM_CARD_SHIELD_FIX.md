# Admin Team Card Actions + Shield + Founder Label Fix

**Date:** 2026-06-29  
**Scope:** Team member cards, avatar shields, role labels, founder title restriction

---

## Executive Summary

Enabled all four action buttons (عرض · تعديل · صلاحيات · تفعيل/تعطيل) on admin team cards with proper navigation. Shields now overlay avatars consistently via `AvatarWithDisplayShield`. Role labels (مسؤول / مسؤول أعلى / المؤسس) appear on cards and under names. **المؤسس** title is restricted to `alpha.coptic@proton.me` only.

---

## Findings

### Team card actions
- Replaced hidden `AdminPermissionGate` wrappers with always-visible buttons
- Founder/owner gets all actions via `isHiddenOwner`
- Others see disabled state when lacking permission (not hidden)
- Fixed **تفعيل** for `pending` members (was incorrectly disabled)
- Navigation uses `useNavigate` for reliable routing

### Shield on avatar everywhere
- New component: `AvatarWithDisplayShield.tsx`
- Applied to: team list cards, member detail, profile avatar menu (home)
- Team admins always show `official` shield on card avatars
- Profile uses live `getDisplayShieldRoleSync()`

### Role labels
- Under name on team cards: مسؤول / مسؤول أعلى
- Under name on member detail screen
- Profile: `identityLabel` for founder/admin only

### Founder title restriction
- `platformOwnerLabel = "المؤسس"` **only** when email is `alpha.coptic@proton.me`
- Other platform owners: no founder label (shows "مالك المنصة" if needed)
- `roleLabelFromContext(ctx, email)` enforces email check

---

## Warnings

- Non-founder platform owners (if any) will not see "المؤسس" — by design.

---

## Errors

- None. Build PASS.

---

## Overall Status

**PASS**
