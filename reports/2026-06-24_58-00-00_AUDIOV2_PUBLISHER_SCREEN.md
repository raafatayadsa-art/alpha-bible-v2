# AudioV2 — Spotify-lite Publisher Listening Screen

**Date:** 2026-06-24  
**Scope:** شاشة audiov2 جديدة + ربط مساحة الناشر

---

## Executive Summary

Added isolated **AudioV2** listening experience (Spotify-lite) on new routes without modifying the legacy publisher public page. Publisher workspace links to preview and published AudioV2 views.

---

## New Routes

| Route | Purpose | Data |
|-------|---------|------|
| `/audiov2/preview/$publisherId` | معاينة من مساحة الناشر | `fetchPublisherById` + `fetchPublisherContent` (all statuses) |
| `/audiov2/$publisherId` | صفحة منشورة | `fetchPublishedPublisher` + `fetchApprovedPublisherContent` |

---

## Features (AudioV2)

- Hero header: cover, name, follow, **تشغيل الكل**, **عشوائي**, **أكمل**
- Tabs: **الكل · ترانيم · ألبومات**
- Flat track list with duration + tap to play
- **Mini player** fixed above bottom nav (play/pause, prev/next, seek)
- **Queue** per tab filter; shuffle + play all
- Continue progress saved via existing `writePublisherContinue`

---

## Workspace Links

`PublisherWorkspaceScreen` quick actions:

- **AudioV2 — معاينة الاستماع** → `/audiov2/preview/$publisherId`
- **AudioV2 — الصفحة المنشورة** (when published) → `/audiov2/$publisherId`
- Legacy **عرض الصفحة المنشورة (كلاسيك)** retained

---

## Files Added

- `src/features/audiov2/` — tracks builder, player hook, screen, mini player
- `src/routes/audiov2.$publisherId.tsx`
- `src/routes/audiov2.preview.$publisherId.tsx`

---

## Warnings

- Preview route has no BottomDock (workspace flow); public route includes BottomDock.
- Video/books/articles not in AudioV2 tabs (audio-first scope by design).

---

## Errors

Build: **PASS** (`npm run build`).

---

## Recommendations

1. Open workspace → **AudioV2 — معاينة الاستماع** after adding hymns/albums.
2. After publish, test `/audiov2/$publisherId` for approved-only content.
3. Optional: link AudioV2 from `/audio` publisher cards.

---

## Overall Status

**PASS**
