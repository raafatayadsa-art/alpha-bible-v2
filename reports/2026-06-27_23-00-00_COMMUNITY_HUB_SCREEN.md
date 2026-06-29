# Community Hub — Spiritual Shares Screen

**Date:** 2026-06-27  
**Scope:** New `/community` church community hub

---

## Executive Summary

Added a professional **المجتمع الكنسي** screen at `/community`. Users share **structured** spiritual content only (readings, prayers, agpeya) — no free-form personal posts. Reactions: **آمين** / **صليت لأجلك** plus comments. Bottom dock community tab now opens this hub.

---

## Findings

### Implemented

| Feature | Detail |
|---------|--------|
| Route | `/community` — `CommunityScreen` |
| Share types | `reading`, `prayer`, `agpeya` only |
| Reactions | `amen` (قراءة/أجبية), `prayed_for` (صلاة) |
| Comments | Inline on each moment card |
| Church section | Official church posts (read-only links to `/church/post/$id`) |
| Entry points | Saved verses, agpeya share sheet, prayer request create |
| Storage | localStorage v1 (`ab:community-hub-v1`) |
| Migration | `20260627220000_community_moments.sql` for future Supabase sync |
| Dock | Community tab → `/community` |

### Rules enforced

- No composer for free text posts
- `shareToCommunity()` validates structured payload only
- `/church` remains church dashboard (linked from hub)

---

## Warnings

- Feed data is **device-local** until Supabase sync layer is wired to new tables.
- Prayer auto-share on create skips anonymous requests.

---

## Recommendations

1. Apply migration and add Supabase sync in `community-store.ts` (mirror `post-interactions.ts`).
2. Add «شارك مع المجتمع» on bible chapter verse actions.
3. Realtime feed per `church_id` when backend is live.

---

## Overall Status

**PASS** — build verified.
