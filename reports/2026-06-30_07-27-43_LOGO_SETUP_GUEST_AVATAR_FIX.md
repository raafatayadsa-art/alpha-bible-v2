# Logo Removal, Church Setup Open, Guest Avatar AC

## Executive Summary

Three user-requested fixes were implemented: the official Alpha PNG logo was removed app-wide, church setup navigation now opens the setup form directly for all users, and guest/anonymous avatars display **AC** on the avatar circle instead of a generic user icon or placeholder initials.

**Build:** PASS (`npm run build`)

## Findings

### 1. Official Alpha logo removed
- `AlphaOfficialLogo` now renders nothing (stable export preserved).
- `AlphaBrandIdentity` shows slogan only; `AlphaBrandLogoOnly` shows optional title only.
- Auth screens: logo removed; slogan and ALPHA / ⲁⲗⲫⲁ text retained.
- QR badge (`profile.membership`): center mark replaced with Coptic Ⲁ (not PNG).
- Service card (`profile.service`): Coptic cross instead of logo.
- Owner PIN sheet: Shield icon instead of PNG.

### 2. Church setup opens correctly
**Root cause:** «طلب تأسيس كنيسة» in `church.tsx` linked to `/profile/church` (hub), not the setup form. On the hub, the setup button was hidden unless `canManageChurchPosts` (owner/priest/servant only).

**Fixes:**
- `church.tsx` → direct link to `/profile/church/setup`.
- `ChurchManagementHub` → setup button visible for all users in empty state.
- `HubButton` → uses TanStack `Link` instead of brittle `navigate({ to: to as "/" })`.
- Setup page shell → title-only header (`brand` removed).

### 3. Guest avatar «AC»
- Added `GUEST_AVATAR_INITIALS = "AC"` and placeholder name detection in `profile-user-store.ts`.
- `ProfileSettingsMenu`: guest mode shows **AC** on avatar circle (not User icon).
- `ProfileCopticAvatarFrame`: uses `profileAvatarInitials` (AC for placeholders like «مستخدم Alpha»).

## Warnings

- `alpha-logo.png` asset remains in repo but is no longer referenced by UI components (except asset index). Safe to delete in a future cleanup if desired.
- `AlphaConnectLogo` (Connect feature) was **not** removed — user asked specifically for the official Alpha brand logo.

## Errors

None.

## Recommendations

1. Manually test: guest home avatar → **AC**; tap «طلب تأسيس كنيسة» from `/church` empty state → form loads.
2. Confirm authenticated members without church role can submit setup (backend RLS may still gate submission — verify separately if needed).

## Overall Status

**PASS**
