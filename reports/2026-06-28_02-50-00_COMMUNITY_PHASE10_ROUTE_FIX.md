# Alpha Bible — Community Phase 10: «مجتمعي» Route Fix

**Date:** 2026-06-28  
**Scope:** Canonical `/community` hub path, dock active state, legacy redirect, home entry  
**Project:** `usflbjlyadihyitnvzya`

---

## Executive Summary

Phase 10 fixes the **«مجتمعي»** screen routing so the bottom dock tab, share flows, and home entry all point to the canonical hub **`/community`**. The dock tab no longer highlights on `/church`. A legacy redirect from `/my-community` preserves old bookmarks. Build passes.

---

## Findings

### Problem

- Dock label is **«مجتمعي»** (`nav.community`) but active state still included `/church` and `/profile/church`, so the tab appeared selected on the church dashboard instead of the community hub.
- No single source of truth for community paths across dock, share sheet, and church page links.
- Home screen had **«كنيستك معاك»** → `/church` only; no direct **«مجتمعي»** card.

### Fixes applied

| Change | Detail |
|--------|--------|
| `community-routes.ts` | `COMMUNITY_HUB_PATH = "/community"`, `COMMUNITY_ROUTES`, `isCommunityHubPath()` |
| `BottomDock.tsx` | Tab `to={COMMUNITY_HUB_PATH}`; active only when `isCommunityHubPath(pathname)` |
| `my-community.tsx` | Redirect `/my-community` → `/community` (replace) |
| `module-route-map.ts` | Added `/my-community` + `community` nav key under community module |
| `CommunityHomeHeader` | Title **«مجتمعي»** (matches dock label) |
| `community.tsx` | Page title **«مجتمعي — ألفا»** |
| `ChurchCommunityHubLink` | Opens `/community` (not `/church`) |
| `home.tsx` | New journey card **«مجتمعي»** → `/community` (separate from church card) |
| `AlphaShareSheetHost` | Post-share navigate uses `COMMUNITY_HUB_PATH` |
| `CommunityHubLinks` | Uses `COMMUNITY_ROUTES` constants |

### Build

- `npm run build` — **PASS** (exit 0)

---

## Warnings

- `/church` remains the church dashboard (services, official posts). Do not conflate with `/community` spiritual hub.
- `/my-community` redirect is client-side route only; deep links must hit the SPA router.
- Home card «مجتمعي» and «كنيستك معاك» share the same image asset temporarily.

---

## Errors

None.

---

## Recommendations

1. UAT: tap **مجتمعي** in dock → must land on `/community` with tab highlighted.
2. UAT: open `/church` → dock **مجتمعي** tab must **not** be active.
3. Optional: dedicated home card artwork for «مجتمعي» vs «كنيستك معاك».

---

## Route Reference

| Screen | Canonical path |
|--------|----------------|
| مجتمعي (Hub) | `/community` |
| Legacy alias | `/my-community` → redirects |
| أصدقائي | `/community/friends` |
| المجموعات | `/community/groups` |
| إضافة صديق | `/community/add-friend` |
| السجل الروحي | `/community/spiritual-record` |
| كنيستك معاك | `/church` (unchanged) |

---

## Overall Status

**PASS**
