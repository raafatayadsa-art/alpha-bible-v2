# Profile Screen Cleanup & People Cards Glow

## Executive Summary

Removed duplicate quick services and bottom visits preview from profile. Redesigned family and contacts sections as premium glowing cards with accent lighting.

## Findings

### Removed
- **`QuickServicesRow`** — duplicate of home screen services.
- **`ProfileVisitsSection`** — bottom «معاينة · سجّل من رحلاتك» / visits carousel.

### People cards (`CollapsiblePeopleOrbit`)
- Premium card shell: cream gradient, accent ambient blur, gold inset frame.
- Header: Coptic cross title, count badge, chevron toggle.
- Central orbit button: golden ring + accent glow (stronger when expanded).
- Expanded: horizontal scroll of **`PersonGlowChip`** avatars with gradient rings and soft light.
- Add (+) chip with dashed glow border.

## Warnings

- `ProfileVisitsSection.tsx` remains in repo but unused on profile screen.

## Errors

None. `npm run build` — PASS.

## Recommendations

- Link family/add buttons to real routes when family management ships.

## Overall Status

**PASS**
