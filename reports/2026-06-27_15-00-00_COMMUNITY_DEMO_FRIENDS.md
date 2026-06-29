# Community Demo Friends Seed Report

**Date:** 2026-06-27  
**Scope:** Dummy friends + activity preview for مجتمعي UI

---

## Executive Summary

Added 8 demo community friends with avatars (photos + initials fallback), 5 spiritual activity moments, comments, and reactions. Data seeds automatically on first `/community` visit after update. Build **PASS**.

---

## Findings

1. **`community-demo-data.ts`** — 8 Arabic demo friends with roles (خدمة الشباب، التسبحة، etc.) and mixed avatars (`avatar-mina.jpg`, `avatar-priest.jpg`, pravatar URLs).
2. **`community-demo-seed.ts`** — One-time seed via `ab:community-demo-preview-v2` localStorage flag.
3. **`community-store.ts`** — `mergeDemoCommunityPreview()` merges demo moments, comment stacks, and reaction counts.
4. **`CommunityScreen.tsx`** — Filters church suggestions when already added as friends (no duplicates in strip).
5. **Build** — `npm run build` exit 0.

---

## Demo Friends (8)

| Name | Role | Avatar |
|------|------|--------|
| مينا رفعت | خدمة الشباب | Local photo |
| مارينا فادي | التسبحة | pravatar |
| أحمد نبيل | مدرسة الأحد | pravatar |
| سارة عادد | المدائح | pravatar |
| جورج ميلاد | الشماسة | pravatar |
| ناردين كامل | مدرسة الأحد | pravatar |
| بيتر أمين | الكورال | Local priest photo |
| كيرمينا أيوب | خدمة الشباب | pravatar |

---

## Warnings

- Seed runs once per browser (v2 key). To re-seed: remove `ab:community-demo-preview-v2` from localStorage and reload `/community`.
- Demo data is local-only preview until Supabase friends API is live.

---

## Errors

None.

---

## Recommendations

1. Open `/community` and refresh once to trigger seed.
2. Scroll activity feed to see moment cards + comment avatar stacks.

---

## Overall Status

**PASS**
