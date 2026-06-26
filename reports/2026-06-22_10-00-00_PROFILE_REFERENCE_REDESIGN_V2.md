# Profile Premium Redesign — Reference Layout v2

## Executive Summary

Redesigned the personal profile screen to align with the attached reference mockup: role-based Alpha shields, verse-card pulse on active status, collapsible people/family orbits, visits carousel, and streamlined menu (no duplicate privacy/personal rows).

## Findings

### Layout & DNA
- **Hero:** Sky/church banner, settings menu (edit profile + settings), notifications, avatar with **`AlphaShield`** beside photo (role-aware).
- **Membership card:** Role label, ID, QR, **`ActiveStatusPill`** with `HeroLedgerStylesHost` pulse/glow (verse-card DNA), interactive shield on card left.
- **Church card + quick services** preserved; «منارة حية» links to Alpha Connect.

### Role shields
- New `profile-role.ts`: maps `AlphaRole` → `ShieldRole` + Arabic labels (كاهن / خادم / عضو عادي / Alpha رسمي).
- Shields on **avatar** and **membership card** via existing `AlphaShield` component.

### Collapsible people
- New `CollapsiblePeopleOrbit`: family + contacts **folded by default**; tap circle expands horizontal avatar strip sideways.

### Menu cleanup
- Removed: privacy row, personal profile row, 8-tile «المزيد من الخدمات», church messages block, contributions duplicate grid.
- **Edit profile** moved into **settings gear menu** (`ProfileSettingsMenu`).
- Bottom section: **الدعم والمساعدة** only (+ visits section).

### Visits
- New `ProfileVisitsSection`: horizontal cards for monasteries/churches from pilgrimage passport; demo preview when empty.

## Warnings

- Visit demo cards show when passport empty (labeled «معاينة»).
- Church/member metadata still static until wired to Supabase dashboard.

## Errors

None. `npm run build` — PASS.

## Recommendations

- Wire `MEMBER.church` / join date from `useChurchDashboard` + auth metadata.
- Persist «add person/family» actions when Connect family API is ready.

## Overall Status

**PASS**
