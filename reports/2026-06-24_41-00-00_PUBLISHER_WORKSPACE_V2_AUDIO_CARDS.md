# Publisher Workspace V2 + Audio Cards Fix

**Date:** 2026-06-24  
**Scope:** Audio publisher cards visibility, publisher workspace UX, upload fixes, DB migration

---

## Executive Summary

Implemented three user-requested fixes: (1) audio publisher cards now show for **all users** when publishers are **verified (`is_trusted`)**, **published**, and **public**, with a visible empty state instead of hiding the section; (2) publisher workspace redesigned as a professional hub with **«بيانات الصفحة»** and **«إضافة محتوى»** popups only—no inline upload forms; (3) unified **PublisherContentWizard** for album/hymn/video/book/article with edit support, improved file upload MIME handling, and DB RPCs allowing content on **published** pages.

---

## Findings

### Audio screen (`/audio`)

| Issue | Root cause | Fix |
|-------|------------|-----|
| Cards not visible | `AudioPublishersSection` returned `null` when feed empty | Always render section + loading/empty states |
| Cards only for publisher | Misunderstanding + feed not filtered to verified public pages | `fetchAudioPublisherFeed` uses `trustedOnly: true` + public RLS (`published` + `is_public`) |

**Card visibility requirements (all must be true):**
- `publishers.status = 'published'`
- `publishers.is_public = true`
- `publishers.is_trusted = true`
- Type in `hymn_team`, `choir`, `church_service`

### Publisher workspace

| Issue | Root cause | Fix |
|-------|------------|-----|
| «بيانات الصفحة» hidden after publish | `canEditPublisherWorkspace()` excluded `published` status | New `canManagePublisherProfile()` — works whenever not suspended + permission |
| Inline upload clutter | Old inline form for hymn/video/book | Removed; all additions via `PublisherContentWizard` popup |
| Hymn upload failures on published pages | RPC `submit_publisher_content` blocked `published` status | Migration allows `published` |
| Content not editable | No update API | New `update_publisher_content` RPC + `updatePublisherContentItem()` |

### Upload

- Improved MIME normalization for Windows files with empty/`application/octet-stream` type (MP3/M4A/images).

---

## Warnings

1. **Cards still empty** if publisher is trusted but page not yet **published** or `is_public = false` — admin must complete publication flow.
2. **Content edit** re-triggers review (`pending_review`) unless publisher is **trusted** (auto-approved).
3. **Storage bucket** `publisher-assets` must exist on Supabase (migration `20250624250000`); upload errors still show Arabic message if bucket missing.

---

## Errors

- None during implementation.
- Migration `publisher_published_workspace` **applied successfully** to project `usflbjlyadihyitnvzya`.

---

## Recommendations

1. After admin verifies a publisher, ensure page status → `published` and `is_public = true` so cards appear on `/audio`.
2. Set content `visibility = public` on submit (already default in wizard) so approved items appear in discovery feeds.
3. Test hymn upload on a **published** publisher page end-to-end.

---

## Files Changed

| File | Change |
|------|--------|
| `src/features/audio/components/AudioPublishersSection.tsx` | Empty/loading states |
| `src/features/audio/AudioScreen.tsx` | Loading state for publishers |
| `src/features/publisher/publisher-discovery-api.ts` | `trustedOnly: true` for audio feed |
| `src/features/publisher/types.ts` | `canManagePublisherProfile/Content` |
| `src/features/publisher/publisher-api.ts` | `updatePublisherContentItem`, better errors |
| `src/features/publisher/publisher-storage-api.ts` | MIME normalization |
| `src/features/publisher/components/PublisherWorkspaceScreen.tsx` | Hub layout v2 |
| `src/features/publisher/components/PublisherProfileSheet.tsx` | **New** profile popup |
| `src/features/publisher/components/PublisherContentWizard.tsx` | **New** unified wizard |
| `src/features/publisher/components/PublisherTeamSection.tsx` | Polished UI |
| `supabase/migrations/20250624232000_publisher_published_workspace.sql` | Published upload + update RPC |

---

## Overall Status

**PASS** — Frontend + migration applied; pending user QA on live publisher data.
