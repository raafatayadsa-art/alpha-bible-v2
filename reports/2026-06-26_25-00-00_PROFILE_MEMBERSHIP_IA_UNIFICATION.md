# Profile & Membership IA Unification

**Date:** 2026-06-26  
**Task:** Unify profile vs membership UX, remove duplicate QR/actions, add diocese everywhere relevant

---

## Executive Summary

Implemented a clear three-layer information architecture for the profile system:

- **`/profile`** — social/display identity (hero, church, achievements, activity)
- **Shield overlay** — quick trust verification snapshot (no navigation CTA)
- **`/profile/membership`** — sole official credential surface (QR, share, copy, print)

Diocese (`الإيبارشية`) is now wired from `useProfileMembershipData` across hero, church card, shield card, compact strip, and membership page.

---

## Findings

### Before
- QR appeared 4× (gold barcode card, identity share card, membership page, hero alpha ID context)
- Shield yellow button duplicated path to membership page
- Edit screen had share card + membership link (wrong layer)
- Diocese only on membership info grid and edit church section
- Dead `MoreVertical` button on membership header
- Interactive shield on membership page opened duplicate overlay

### After
| Surface | Role |
|---------|------|
| `ProfileHeroV3` | Name, church, **diocese**, alpha ID, shield → verification only |
| `ChurchInfoCardDark` | Church name + **diocese chip** + location |
| `MembershipCompactStrip` | Tap → `/profile/membership` (no QR) |
| `VerificationCard` | Church, **diocese**, since, role, trust — close only |
| `/profile/membership` | Full QR + actions; static shield badge |
| `/profile/edit` | Data + privacy only; no QR/share |

---

## Changes Applied

### New
- `src/features/profile/MembershipCompactStrip.tsx` — gold strip linking to full membership card

### Modified
- `ProfilePremiumScreen.tsx` — uses `useProfileMembershipData`; removed `ProfileIdentityShareCard` and `MembershipBarcodeCard`
- `ProfileHeroV3.tsx` — diocese in subtitle when church visible
- `AlphaShield.tsx` — `ShieldProfileInfo.diocese`; diocese row in verification; removed yellow membership CTA
- `ProfileEditScreen.tsx` — removed identity share card and membership link
- `profile.membership.tsx` — static `ShieldImage`; diocese under church; removed dead header button
- `index.ts` — export `MembershipCompactStrip`

### Preserved (unchanged file, deprecated on profile)
- `MembershipBarcodeCard.tsx` — kept for reference; no longer used on profile

---

## Warnings

- Scanner modal on membership page remains placeholder ("قريباً")
- `MembershipBarcodeCard` still in repo but unused — safe to delete in a future cleanup PR
- Diocese shows "—" when `memberChurch.diocese` is unset

---

## Errors

None. `npm run build` — **PASS**

---

## Recommendations

1. Remove `MembershipBarcodeCard.tsx` once confirmed no other routes import it
2. When scanner ships, keep it only on `/profile/membership`
3. Consider privacy flag for diocese if users should hide eparchy separately from church

---

## Overall Status

**PASS**
