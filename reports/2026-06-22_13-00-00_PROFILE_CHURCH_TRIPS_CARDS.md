# Profile Church & Trips Cards Redesign

## Executive Summary

Redesigned the profile church card with HD church hero background and premium home-journey styling. Replaced the vertical expanding trip timeline with horizontal scroll cards matching the home screen journey discover design.

## Findings

### Church card (`ChurchInfoCard`)
- Full-bleed **`/profile/profile-church-hero.webp`** background (sharp, no fog overlay).
- Home journey DNA: dark gradient, gold inset frame, Ⲁ watermark, ✦ corners.
- Badge **✦ كنيسة ✦** + church icon tile + services chip.
- **`HeroCompactLedgerCell`** CTA: «ادخل · كنيسة».

### Trips timeline (`ProfileTripTimelineSection`)
- Removed vertical **`Timeline`** — card no longer grows with entries.
- Horizontal scroll strip: fixed **176px** cards, **`min(78vw, 272px)`** width each.
- Same visual system as **`HomeJourneyDiscover`**: gradient overlay, inset glow, badge, ledger cell.
- Trip kind → accent, badge, cover image (church / meditation / youth assets).
- Hint: «اسحب لعرض المزيد من الرحلات».

## Warnings

- Trip cards use demo/static cover images until passport entries include image URLs.

## Errors

None. `npm run build` — PASS.

## Recommendations

- Add optional `imageUrl` on `PilgrimagePassportEntry` for real trip photos.
- Wire church card stats from live church API when available.

## Overall Status

**PASS**
