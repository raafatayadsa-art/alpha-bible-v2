# Content Review — عرض المحتوى في الكنترول

**Date:** 2026-06-24  
**Route:** `/platform/content-review`

---

## Executive Summary

Added a **«عرض المحتوى»** button to each pending item in the Content Review Center. Opens a preview sheet with cover, media player (audio/video/PDF), metadata, and approve/reject actions — so platform owners can review uploaded files before deciding.

---

## Findings

| Change | File |
|--------|------|
| Preview sheet (modal) | `ContentReviewPreviewSheet.tsx` |
| Extended API fields | `content-review-api.ts` — `coverUrl`, `mediaUrl`, `visibility`, `payload`, etc. |
| View button + sheet wiring | `ContentReviewCenterScreen.tsx` |

### Preview capabilities

- Cover image thumbnail
- Audio / video inline players
- PDF iframe preview
- «فتح الملف في تبويب جديد» fallback link
- Visibility, download permission, duration
- Article body from `payload.body` / `payload.text` when present
- Decision buttons inside sheet (قبول · تعديل · رفض)

---

## Warnings

- Storage URLs must be publicly readable or signed for iframe/audio to load in browser.
- Items without `media_url` show title/description only.

---

## Errors

None.

---

## Recommendations

- Link preview to related `platform_approvals` record when `approvalId` is set.
- Add rejection reason prompt when choosing «رفض» or «تعديل».

---

## Overall Status

**PASS**
