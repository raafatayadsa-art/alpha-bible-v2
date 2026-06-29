# Community Screen 1 Rebuild — `/community`

**Date:** 2026-06-28 01:16:47  
**Scope:** Rebuild community home to match design Screen 1  
**Overall Status:** PARTIAL

---

## Executive Summary

Rebuilt `/community` layout to align with design Screen 1: daily verse hero, church people suggestions, friends spiritual activity list, and church posts with thumbnails. Preserved BottomDock and Alpha DNA. Build passes. Full social platform (friends graph, groups, profile tabs) remains future work.

---

## Findings

### Implemented (Screen 1 sections)

| Section | Component | Data source |
|---------|-----------|-------------|
| Header (menu · Alpha · المجتمع · notify · avatar) | `CommunityHomeHeader` | Static + profile/auth |
| آية اليوم | `CommunityDailyVerseCard` | `fetchTodaysDailyVerse()` |
| قد تعرفهم من الكنيسة | `CommunityPeopleSuggestions` | Church dashboard contacts + profile connect links |
| النشاط الروحي لأصدقائك | `CommunityFriendActivityItem` | `community_moments` (local + Supabase) |
| من الكنيسة | `CommunityChurchPostCard` | `useChurchPosts` with `PostImage` thumbnail |

### Removed from old hub

- 3-column gateway cards (كنيستك / طلبات / دليل)
- Kind filter chips (قراءات / صلوات / أجبية)
- Dark `CommunityMomentCard` feed on home (card still exists for reuse elsewhere)

### Still missing vs full design image

- Real friends graph + «Add Friend» screen
- Automatic activity («أنهى قراءة إنجيل لوقا») — still manual shares only
- Groups discovery screen
- Profile tabs (آيات / تأملات / سجل روحي)
- Central «+» FAB in dock
- Prayer requests embedded as tab inside community

---

## Warnings

- People suggestions use church contacts + saved connect links — not a full member directory.
- Activity feed shows all community moments, not filtered to confirmed friends only.
- Add (+) on suggestions links to `/alpha-connect/nearby` as interim entry.

---

## Errors

- None. Build exit code: **0**.

---

## Recommendations

1. Phase 2: friends API + filter activity to friend IDs only.
2. Phase 3: Profile «الآيات» tab showing user's community shares.
3. Phase 4: activity engine (reading plan completion → auto activity).

---

## Files Added/Changed

- `src/features/community/CommunityScreen.tsx` (rewritten)
- `src/features/community/CommunityHomeHeader.tsx`
- `src/features/community/CommunityDailyVerseCard.tsx`
- `src/features/community/CommunityPeopleSuggestions.tsx`
- `src/features/community/CommunityFriendActivityItem.tsx`
- `src/features/community/CommunityChurchPostCard.tsx`
- `src/features/community/community-activity-copy.ts`
- `src/features/community/use-community-people-suggestions.ts`

---

## Overall Status

**PARTIAL** — Screen 1 layout delivered; full community platform from design image not yet complete.
