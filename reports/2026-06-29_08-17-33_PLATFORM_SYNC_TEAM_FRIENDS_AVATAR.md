# Platform Sync + Team Friends + Avatar Report

**Date:** 2026-06-29  
**Scope:** Alpha Control bottom nav sync, founder friend-as-admin, team card avatars

---

## Executive Summary

Implemented three user-requested features for Alpha Control:

1. **Sync button** replaces Settings in the bottom toolbar — pulls modules, emergency flags, audit log, platform settings, and auth context from Supabase, then broadcasts `ab:platform-sync` and `ab:mc-store` so all screens refresh instantly.
2. **Founder friend-as-admin** — in the team invite sheet, the founder can add any community friend as an active admin with one tap (RPC `admin_team_add_friend_admin`).
3. **Admin team card photos** — avatars resolve from `admin_users.avatar_url`, `user_profiles.avatar_url`, or a deterministic fallback image.

Build: **PASS** (`npm run build` exit 0).

---

## Findings

### Sync button (mission-control-ui.tsx)
- Bottom nav slot 2 is now **مزامنة** with `RefreshCw` icon and spin animation while syncing.
- `syncPlatformControlAll()` in `platform-control-sync.ts` refreshes auth, modules, emergency, audit, settings in parallel.
- Subscribers: `usePlatformStore` (via `ab:mc-store`), `usePlatformDashboard`, `SystemSettingsScreen`, admin permissions hook.

### Friend-as-admin (AlphaTeamInviteSheet.tsx)
- Visible only when `isHiddenOwner` and friends list is non-empty.
- **مسؤول** button calls `addFriendAsAdmin()` for friends with real `linkedUserId` (UUID).
- Demo friends without UUID show a message and pre-fill the manual invite form via **تعبئة**.

### Team avatars
- `admin-team-api.ts`: `enrichAdminTeamAvatars()` joins `user_profiles` client-side; `resolveTeamAvatarUrl()` adds pravatar fallback.
- `AlphaTeamUI.tsx` `MemberAvatar` always prefers image URL over initials.
- `AlphaTeamMemberScreen.tsx` uses the same photo resolution on detail view.
- SQL migration updates `admin_team_list()` to coalesce profile avatars server-side.

---

## Warnings

- **SQL not applied automatically** — run `supabase/RUN_ADMIN_TEAM_FRIEND_AVATAR.sql` in Supabase SQL Editor for server-side avatar join and `admin_team_add_friend_admin` RPC.
- Demo community friends (`demo-friend-*` IDs) cannot be promoted via RPC; founder must use manual invite.
- Sync requires network + valid Supabase session; offline mode uses last cached localStorage values.

---

## Errors

None in build or lint checks.

---

## Recommendations

1. Run `RUN_ADMIN_TEAM_FRIEND_AVATAR.sql` on production Supabase.
2. Test sync on a real device after changing module toggles or emergency flags in another tab.
3. Add a real friend (with Supabase account) before testing one-tap admin promotion.

---

## Overall Status

**PASS** — client implementation complete; pending Supabase SQL apply for full server-side friend-admin + avatar join.

---

## Files Changed

| File | Change |
|------|--------|
| `platform-control-sync.ts` | Central sync + event broadcast |
| `mission-control-ui.tsx` | Sync toolbar button |
| `index.ts` | Export sync helpers |
| `AlphaTeamInviteSheet.tsx` | Friends picker for founder |
| `AlphaTeamUI.tsx` | Avatar fallback on cards |
| `AlphaTeamMemberScreen.tsx` | Avatar fallback on detail |
| `admin-team-api.ts` | `addFriendAsAdmin`, avatar enrichment |
| `RUN_ADMIN_TEAM_FRIEND_AVATAR.sql` | Runnable SQL |
| `migrations/20260629140000_admin_team_friend_avatar_sync.sql` | Migration source |
