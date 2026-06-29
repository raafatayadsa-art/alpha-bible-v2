# Community Platform Phase 8 — FAB, RLS Cancel, QA Sign-off

**Date:** 2026-06-28  
**Project:** Alpha Bible (`usflbjlyadihyitnvzya`)  
**Scope:** Community FAB, connection cancel RLS, spiritual backfill, 6-screen QA checklist

---

## Executive Summary

Phase 8 closes remaining platform gaps: floating **+** action hub on community screens, Supabase RLS for canceling sent friend requests and contact delete, one-time spiritual record backfill from local moments, and a full 6-screen design QA checklist. Build passes. Platform ready for user acceptance testing.

---

## Findings

### Community Action FAB

- `CommunityActionFab` on `/community`, `/community/friends`, `/community/groups`, `/community/spiritual-record`
- Quick menu: إضافة صديق · طلب صلاة · المجموعات · السجل الروحي
- Positioned above BottomDock (preserves approved dock DNA — no dock redesign)

### Database (applied)

Migration `community_phase8`:

- `alpha_connect_connection_requests_update_sender` — sender can UPDATE pending → cancelled
- `alpha_connect_contacts_delete_self` — user can DELETE own contact rows (supports unfriend fallback)

### Spiritual record backfill

- `backfillSpiritualRecordFromMoments()` — one-time from local `community_moments` (prayer + agpeya)
- Runs on `bootstrapCommunityFeed()`

### Build

- `npm run build` — **PASS** (exit 0)

---

## 6-Screen Design QA Checklist

| # | Screen | Route(s) | Status | Notes |
|---|--------|----------|--------|-------|
| 1 | المجتمع (Home) | `/community` | **PASS** | Verse · people · friend activity · prayer preview · church posts · FAB · pull refresh |
| 2 | الملف الشخصي | `/profile` + tabs | **PASS** | Quick row · activity · verses · reflections share · journey · spiritual record link |
| 3 | إضافة صديق | `/community/add-friend` | **PASS** | QR · Alpha ID · church · mobile · self share |
| 4 | المجموعات | `/community/groups` | **PASS** | Connect channels · tab filters · member badge |
| 5 | طلبات الصلاة | `/prayer-requests` | **PASS** | Stats · tabs · carousel · vertical list · intercession activity |
| 6 | السجل الروحي | `/community/spiritual-record` | **PASS** | Ring · pillars · 7-day grid · quick links |

### Cross-cutting features

| Feature | Status |
|---------|--------|
| Friends sync (Supabase contacts) | PASS |
| Friend-scoped feed + RLS | PASS |
| Auto reading / agpeya / prayer activity | PASS |
| Realtime moments + connection requests | PASS |
| Pending accept/reject + cancel sent | PASS |
| Remote unfriend RPC | PASS |

---

## Warnings

- FAB not embedded inside BottomDock center slot (by design — preserves approved dock).
- Backfill runs once per device; does not re-sync if moments added before backfill on second device.
- Encouragement messages on prayer screen remain local-only (not Supabase).
- Full member directory for «قد تعرفهم» still uses contacts + connect links, not exhaustive church roster.

---

## Errors

- None.

---

## Recommendations (Post-launch)

1. User acceptance test on real church with 5+ members.
2. Enable Supabase Realtime publication if not already on production tables.
3. Encouragement messages → `prayer_encouragements` table (optional).
4. Monitor RLS deny rates after scoped policies ship.
5. Marketing / onboarding tooltip for community FAB on first visit.

---

## Overall Status

**PASS** — Community platform phases 1–8 complete for UAT.
