# Platform Shield + Founder Identity Fix

**Date:** 2026-06-29  
**Scope:** Alpha official shield for founder/admin/super_admin without church; founder label under name

---

## Executive Summary

Platform team roles now receive the **Alpha official shield** (`official`) without church membership. Church-verified users still get church-tier shields when applicable. Founder email `alpha.coptic@proton.me` is recognized client-side and via SQL bootstrap; **المؤسس** appears under the display name on profile.

---

## Findings

### Shield rules (updated)
| User type | Shield | Church required? |
|-----------|--------|------------------|
| المؤسس (platform owner) | Alpha official | No |
| Super Admin | Alpha official | No |
| Admin | Alpha official | No |
| Church member/servant/priest | Church tier | Yes |
| Guest / logged-in only | None | — |

Priority: `platformShieldRole` → `churchShieldRole` → UI `displayShieldRole`

### Founder identity
- `roleLabelFromContext()` returns `المؤسس` for platform owner
- `ProfileHeroV3` shows `identityLabel` directly under display name
- Client fallback: `alpha.coptic@proton.me` treated as founder before SQL runs
- SQL: `RUN_PLATFORM_SHIELD_FOUNDER.sql` registers founder + `admin_fetch_my_team_role` RPC

### Files changed
- `alpha-roles.ts` — platform/admin shield resolution, founder email, owner label
- `auth-context.ts` — `getDisplayShieldRoleSync()`, `getRoleLabelSync()`
- `profile-role.ts`, `useProfileMembershipData.ts`, `ProfileHeroV3.tsx`
- Nav hub, Alpha Connect, connect-channel-state — use display shield
- `supabase/migrations/20260629120000_platform_shield_admin_role.sql`
- `supabase/RUN_PLATFORM_SHIELD_FOUNDER.sql`

---

## Warnings

- Run SQL in Supabase for persistent DB owner record (client fallback is session-only for RPC checks).
- Founder must sign up once with `alpha.coptic@proton.me` before SQL insert succeeds.

---

## Errors

- None. `npm run build` PASS.

---

## Recommendations

1. Run `supabase/RUN_PLATFORM_SHIELD_FOUNDER.sql` in Supabase SQL Editor.
2. Sign in as founder → profile should show **المؤسس** under name + official shield.
3. Invite admin/super_admin team members → they get official shield without church join.

---

## Overall Status

**PASS**
