# Church Mixed Feed — Phase 4 (Cleanup + Directory Tabs)

**Date:** 2026-06-25  
**Scope:** Remove dead code from `church.tsx`; tabbed info panel on directory detail

---

## Executive Summary

Completed **Phase 4**: deleted ~1,150 lines of unused Coverflow/post-card/meetings/live code from `church.tsx`, and reorganized the **public directory page** so posts stay above the fold with church info in **compact tabs** (عن الكنيسة | الموقع | تواصل) plus join/claim actions.

---

## Findings

| Area | Result |
|------|--------|
| Removed Coverflow, PremiumPostCard, mock meetings, PrayerRequestsCard, LiveBroadcast from `church.tsx` | ✅ (~2258 → ~1102 lines) |
| Cleaned unused imports in `church.tsx` | ✅ |
| `ChurchDirectoryInfoTabs` — tabbed about/location/links | ✅ |
| Directory layout: Hero → Feed → Tabs (join/claim/hub at bottom of tabs) | ✅ |
| Removed stacked DetailCard wall from directory | ✅ |
| `npm run build` | ✅ PASS |

---

## Warnings

1. Post interactions still local (`post-store`) — Phase 5 if Supabase sync is desired.
2. `church-feed-lab` route remains for design experiments — optional removal later.

---

## Errors

None.

---

## Recommendations

1. Add map preview inside «الموقع» tab when coords exist.
2. Sticky tab bar on directory scroll for long feeds.
3. Wire live stream widget when real broadcast backend exists.

---

## Overall Status

**PASS**
