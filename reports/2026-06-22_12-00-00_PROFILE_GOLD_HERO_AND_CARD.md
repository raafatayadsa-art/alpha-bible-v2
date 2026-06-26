# Profile Hero & Membership Card — Gold Polish

## Executive Summary

Updated membership barcode card (smaller QR, larger shield, ornate gold frame, light gold background) and profile hero (generated church image, user photo backdrop, larger gold ring, Coptic cross above avatar).

## Findings

### Membership card (`MembershipBarcodeCard.tsx`)
- **QR:** reduced to **34×34px** inside golden bevel frame.
- **Shield:** enlarged to **xl (92px)** with pulse.
- **Card background:** light gold gradient `#fdf6e3 → #f0ddb0`.
- **Ornate frame:** outer 4px gold gradient border + **✦ corner ornaments** on all four corners.
- Text colors adjusted for light background (navy/gold/brown).

### Profile hero (`ProfilePremiumScreen.tsx`)
- New asset: **`public/profile/profile-church-hero.webp`** (generated Coptic church at golden hour).
- Layered background: church photo + **blurred user avatar** overlay + sky/cream gradient.
- Avatar ring enlarged to **124px** with **6px** gold gradient border.
- **Coptic cross** badge above avatar in small glass circle.
- Removed SVG church silhouette (replaced by photo).

## Warnings

- Church hero is a shared asset; user avatar blur is dynamic per session.
- Generated image also saved under Cursor assets folder (copy in `public/profile/`).

## Errors

None. `npm run build` — PASS.

## Recommendations

- Add `profile-church-hero.webp` to git if not already tracked.
- Optional: per-church hero from dashboard API later.

## Overall Status

**PASS**
