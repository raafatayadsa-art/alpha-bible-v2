# Profile Icons & Suggested Friends Tab

**Date:** 2026-06-29

---

## Executive Summary

Polished profile section icons with gradient glass styling, bumped typography, and added **أصدقائي / مقترحون** tabbed carousel on `/profile` with real avatars and RPC friend requests. Build **PASS**. Pushed to remote.

---

## Findings

| Area | Change |
|------|--------|
| `ProfileAccentIcon` | Gradient fill, soft shadow, larger icons (md/lg) |
| Typography | +1–2px on headers, labels, activity stats |
| `ProfileSuggestedFriendsSection` | Tabs: أصدقائي · مقترحون; add via RPC; link to discover |
| Avatars | `useCommunityPeopleSuggestions` loads `user_profiles` photos |
| `PrayerUserAvatar` | New `lg` size (62px) for profile carousel |

---

## Warnings

- Suggested list requires church contacts with linked `user_id`.
- Empty state directs user to اكتشف أعضاء.

---

## Errors

None (build PASS).

---

## Overall Status

**PASS**
