# Platform Module Full Hide Gating — Church · Messaging · Community

**Date:** 2026-06-26  
**Scope:** App-wide UI removal when owner disables modules from Platform Control (`/platform/modules`)

---

## Executive Summary

Implemented **complete UI removal** (not disabled/grayed) when platform modules are locked:

| Module key | Arabic label | Behavior |
|------------|--------------|----------|
| `community` | المجتمع / الكنيسة | Hides church dock tab, church home cards/news/directory, profile church card, family orbit, connect orbit, add-person sheets, trips timeline, spiritual stats, church settings |
| `messaging` | الرسائل / المحادثات | Hides Alpha Connect home card, blocks `/alpha-connect` routes, filters connect smart-context cards |

Route guard (`PlatformModuleGate`) extended to cover `/profile/church`, `/prayer-requests`, `/messages`, `/personal-call`, `/churches-directory`.

**Build:** `npm run build` — PASS

---

## Findings

### Route map (`module-route-map.ts`)
- `community` prefixes: `/profile/church`, `/prayer-requests`, `/churches-directory`, `/church-feed-lab`, `/church`
- `messaging` prefixes: `/alpha-connect`, `/messages`, `/personal-call`
- Added `isPathModuleEnabled()` helper for CTA gating

### Bottom navigation (`BottomDock.tsx`)
- Church tab removed when `community` disabled
- Grid switches from 5 → 4 columns

### Home (`home.tsx`)
- Church news section hidden when `community` disabled
- (Existing) church directory card, church journey card, Alpha Connect card already gated

### Profile (`ProfilePremiumScreen.tsx`, `ProfileHeroV3.tsx`, `ProfileEditScreen.tsx`)
- **Community off:** no church card, family orbit, connect orbit, add sheets, trip timeline, spiritual activity ledger; hero hides church line, trip & family stats
- **Membership card:** church/diocese footer hidden when community off
- **Edit screen:** church data section + privacy fields for church/family/connect/spiritual stats removed

### Settings (`AlphaControlCenter.tsx`)
- "كنيستي" section hidden when community off
- Church/community notification toggles hidden per module state

### Smart Context (`SmartContextCard.tsx`)
- Church/trip/prayer cards hidden when `community` off
- Connect activity cards hidden when `messaging` off
- CTAs validated against enabled modules

### Already wired (unchanged)
- `AlphaNavHub`, `BibleBottomNavigation`, `PlatformModuleGate` in `__root.tsx`
- Home primary/daily card filter via `HOME_CARD_MODULE`

---

## Warnings

- `community` module currently covers **both** church surfaces and social (family/connect). Platform Control has one toggle labeled «المجتمع» — church dock uses the same key. Splitting church vs social into two DB keys would need a migration.
- Some deep links inside church feed UI may still render connect buttons until those screens are individually gated (low priority if routes are blocked).
- `ProfilePublisherRepostsSection` remains visible — publisher module is separate from community lock.

---

## Errors

None. Build passes.

---

## Recommendations

1. Gate `AlphaNotificationsPanel` entries by module (church / messaging notification types).
2. Add `messaging` to `NAV_ITEM_MODULE_KEY` if a dedicated connect nav item is added later.
3. Consider `trips` module gate on profile trip stats when trips toggle is off independently of community.

---

## Overall Status

**PASS**
