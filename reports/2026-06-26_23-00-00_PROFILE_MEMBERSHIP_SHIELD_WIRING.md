# Profile Membership Card — درع + بيانات حقيقية

**Date:** 2026-06-26

---

## Executive Summary

Shield tap on profile opens **بطاقة العضوية** with live user/church/identity data via shared hook `useProfileMembershipData`.

---

## Findings

### Shield → Membership
- `AlphaShield` prop `openMembership`: navigates to `/profile/membership` on tap (profile hero).
- `profileInfo` overrides verification card church / member since / role with real values.
- Verification overlay (elsewhere) shows button **عرض بطاقة العضوية** when `profileInfo` is set.

### Data hook (`useProfileMembershipData`)
- Name, avatar (incl. custom), church, diocese, role, shield role, Alpha ID, QR, join label, birth date.

### `/profile/membership`
- Avatar + shield, name, role, church on card.
- QR from identity payload.
- Info rows: Alpha ID, church, service, diocese, member since, birth date.

### Profile screen
- `MembershipBarcodeCard` added with live data; shield opens membership card.

---

## Warnings

- Birth date shows only if saved in profile edit.
- Church fields depend on `useMemberChurch` cache/API.

---

## Errors

None (lint clean).

---

## Overall Status

**PASS**
