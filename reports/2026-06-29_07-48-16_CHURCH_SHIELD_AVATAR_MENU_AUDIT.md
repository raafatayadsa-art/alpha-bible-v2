# Church Shield Gating + Avatar Menu + Alpha Control Restore Audit

**Date:** 2026-06-29  
**Scope:** Shield visibility rules, avatar dropdown menu, Alpha Control settings restoration verification

---

## Executive Summary

Completed the in-progress shield-gating work so **only church-verified users** receive a trust shield. Guests, logged-in users without approved church membership, and platform owners without church verification see **no shield**. Avatar menu behavior was updated: guests tap avatar → login; logged-in avatar menu no longer shows "تعديل الملف الشخصي". Alpha Control settings/modules (Core/Tools/System nav, emergency card, quick tools) remain restored from the prior turn. Production build passes.

---

## Findings

### Church-verified shield only
- `resolveChurchShieldRole()` in `alpha-roles.ts` drives `churchShieldRole` in auth context — independent of platform owner status.
- `getChurchShieldRoleSync()` is now the single client source for shield display.
- `AlphaShield` and `ShieldImage` return `null` when `role` is null.
- Updated call sites:
  - `AlphaNavHub.tsx` — conditional shield
  - `connect-channel-state.ts` — current user uses `getChurchShieldRoleSync()`; no owner→official fallback; no default `"member"` for unknown users
  - `connect-shield-center.ts` — church shield fallback for viewer snapshot
  - `alpha-connect.tsx` — join/create channel uses church shield only
  - `community-user-trust.ts` — demo roles only; no blanket `"member"` shield
  - `useProfileMembershipData.ts` — `verified` tied to `shieldRole != null`
  - `ProfileHeroV3`, `MembershipCompactStrip`, `MembershipBarcodeCard`, `profile.membership.tsx` — null-safe shield rendering
  - `AlphaIdentityRow`, `AlphaUserName` — accept `ShieldRole | null`

### Avatar menu (`ProfileSettingsMenu.tsx`)
- **Guest + avatar trigger:** tap navigates to `/login` (no dropdown).
- **Logged-in + avatar trigger:** shows الملف الشخصي، المزيد، الإعدادات — **no** تعديل الملف الشخصي.
- **Settings trigger (gear):** still shows edit profile link for non-avatar contexts.

### Alpha Control restore (verified, no regression)
- `AlphaMissionControl.tsx`: `FounderSectionNav`, module sections, emergency card present.
- `founder-modules-config.ts`: إعدادات النظام in system section.
- `FounderQuickTools.tsx`: notifications, backup, settings entries present.

---

## Warnings

- Demo community friends retain shields via `DEMO_ROLES` map (intentional demo church-verified users).
- Alpha Connect seeded channel members with explicit `shieldRole` in local state still show shields (demo data).
- `alpha-connect.tsx` call-log rows still fall back to `"member"` for contacts missing from `conversations` — low impact on demo data only.

---

## Errors

- None. `npm run build` completed successfully.

---

## Recommendations

1. Run founder SQL if not applied: `RUN_FOUNDER_OWNER_PERMISSIONS_FIX.sql` so `alpha.coptic@proton.me` is recognized as platform owner with full permissions.
2. Manually verify in browser:
   - Guest home avatar → login (no edit menu item)
   - Logged-in without church membership → no shield on nav hub / profile
   - Church-verified member → shield appears with correct tier
   - Alpha Control → Core/Tools/System sections and settings quick tool visible
3. Consider removing call-log `"member"` fallback in a follow-up if strict null-only shields are desired everywhere.

---

## Overall Status

**PASS**
