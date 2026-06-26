# Profile UX — مساهماتي · إخفاء الهاتف · تشغيل الصوت · كروت العائلة

**Date:** 2026-06-26  
**Scope:** Profile contributions, privacy, repost playback, family/connect cards

---

## Executive Summary

Implemented four profile UX requests: expanded **مساهماتي** with all saint images plus other platform submissions, **إخفاء رقم هاتفي** toggle in profile edit privacy, **playable audio repost cards** on profile, and restored **CollapsiblePeopleOrbit** for family and connect sections (small card on the right, expandable circle on tap).

---

## Findings

### 1. مساهماتي — all contributions
- Added `profile-contributions-api.ts` aggregating:
  - `saint_gallery_images` (all statuses) via existing `fetchMySaintContributions`
  - `platform_approvals` by `submitted_by` (excluding saint gallery duplicates)
- `/profile/contributions` now shows:
  - Image grid + detailed list for saint photos
  - Separate section for other platform submissions (church setup, claims, etc.)
- `ProfileAchievementsSection` shows contribution thumbnail strip + total count link

### 2. إخفاء رقم هاتفي
- Added `hidePhone: boolean` to `ProfileUserState` (profile-user-store v3)
- Toggle in **خصوصية الملف الشخصي** on `/profile/edit`
- On save, syncs to `settings-store.hidePhone` for app-wide consistency
- Migrates from legacy settings on first load

### 3. Playable audio repost cards
- Extended `ProfilePublisherRepost` with `contentId`, `mediaUrl`, `durationSeconds`
- `repostPublisherToProfile` calls updated in `PublisherPublicPageView` and `AudioV2PublisherHero` to capture playable media via `resolveContentPlayableMedia`
- `ProfilePublisherRepostsSection`: inline play/pause, progress bar, duration; anyone viewing profile can listen
- Old reposts without `mediaUrl` still show as before (link to publisher only); re-share to get playback

### 4. Family & connect cards — original orbit layout
- Replaced `ProfileAvatarRow` with `CollapsiblePeopleOrbit` in `ProfilePremiumScreen`
- Circle on the right (RTL), compact ledger cell, expands avatars on tap

---

## Warnings

- **Existing reposts** saved before this change lack `mediaUrl`; user must re-share from publisher page for inline playback.
- **Platform contributions** query depends on `platform_approvals` RLS allowing users to read their own rows; if empty, only saint gallery shows.
- `hidePhone` is stored locally; public profile phone display wiring depends on future public profile API.

---

## Errors

None. `npm run build` — **PASS**.

---

## Recommendations

1. Re-share publisher hymns once to populate `mediaUrl` on existing repost cards.
2. Add server-side `hide_phone` column when public profiles launch.
3. Consider deduplicating hidePhone between Settings and Profile Edit with single source of truth UI.

---

## Overall Status

**PASS**
