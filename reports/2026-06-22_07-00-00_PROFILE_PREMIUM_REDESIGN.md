# Profile Premium Redesign

**Date:** 2026-06-22  
**Scope:** User profile screen (`/profile`)

---

## Executive Summary

Redesigned the user profile to match the approved premium reference mockups: light cream canvas, heavenly church hero, navy digital membership card with QR, church info strip, quick services, family/connect carousels, settings menu, and 4×2 services grid. Preserved Bottom Navigation and trip journey sections.

---

## Findings

### New module
- `src/features/profile/ProfilePremiumScreen.tsx` — full premium layout
- `src/features/profile/index.ts` — export
- `src/routes/profile.index.tsx` — slim route shell

### Design elements (reference-aligned)
| Section | Implementation |
|---------|----------------|
| Hero | Sky gradient + church silhouette, gold avatar ring, Ⲁ/Ⲱ, shield badge, settings/bell |
| Membership | Navy gold-framed card, QR, active status, Alpha ID |
| Church | Thumbnail + location + CTA |
| Quick services | 4 circular tiles (صلواتي، قراءة، تسابيح، منزلي) |
| Family / Connect | Horizontal avatar carousel |
| Messages | Compact purple preview card |
| Settings | 3-row menu with icons |
| Services grid | 8 premium action tiles |

### Preserved
- `BottomDock` navigation
- `ProfileTripJourneySection` (passport + certificates)
- `useAlphaIdentity` + real user avatar/name
- Link to `/profile/membership`, contributions, security, etc.

---

## Warnings

1. Church name/location still demo constants (`MEMBER`) — wire to dashboard when available.
2. Connect people list uses placeholder avatars until social graph ships.
3. Family row uses `getFamilyProfile()` — empty until user configures family.

---

## Errors

- None — `npm run build` **PASS**

---

## Recommendations

1. Bind church card to `useChurchDashboard` data.
2. Replace placeholder connect avatars with Alpha Connect contacts.
3. Add subtle hero parallax or real church photo asset when available.

---

## Overall Status

**PASS**
