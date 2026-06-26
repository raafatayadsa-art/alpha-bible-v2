# ALPHA-100 — Saint Community Gallery & Dynamic Saint Card (Audit)

**Date:** 2026-06-22  
**Spec:** Alpha Saint Community Gallery & Dynamic Saint Card System  
**Prior report:** `2026-06-18_18-00-00_ALPHA_100_SAINT_GALLERY.md`

---

## Executive Summary

**ALPHA-100 core is largely implemented in code** (upload → review → approve → auto album → dynamic saint card on Synaxarium). Remaining gaps are mostly **wiring and polish**: profile nav to مساهماتي, home hero parity, DB-backed likes/views, contests, admin featured picker, and **remote Supabase migration** must be applied for uploads to work in production.

---

## Findings — Spec vs Implementation

| Spec area | Status | Detail |
|-----------|--------|--------|
| Upload on saint page (`saint_id` auto-link) | ✅ | `SaintGalleryUploadSheet` on `/synaxarium/$saintId` |
| Title + note optional | ✅ | Upload sheet fields |
| 🟡 قيد المراجعة after upload | ✅ | `status: pending`, toast + status labels |
| مساهماتي → الصور | ⚠️ | Route `/profile/contributions` exists; **no link from profile UI** |
| Admin 🔔 saint_image approval | ✅ | `platform_approvals` kind `saint_image` |
| Approve → library + album + contributor | ✅ | `approveSaintGalleryImage`, auto `is_featured` on first |
| User notification on approve | ✅ | «🎉 تم اعتماد صورتك» via approval notifications |
| Auto album by `saint_id` | ✅ | `SaintGalleryAlbum`, no manual albums |
| Featured image (today, search, synaxarium) | ⚠️ | First approved auto-featured; **no admin cover picker** |
| Dynamic card: like / share / change image | ⚠️ | Full on `/synaxarium/`; home stack = image swap only |
| Crossfade + `1/12` counter | ✅ | `SaintDynamicHeroCard` |
| Share bottom sheet + image picker | ⚠️ | `SaintShareImagePicker` on Synaxarium index; saint detail share uses legacy image |
| 📷 N صور → opens album | ✅ | Dynamic card + album component |
| Contributor attribution | ⚠️ | `contributorLabel()` in album; privacy toggle UI incomplete |
| Contests (monthly winner, likes, views) | ❌ | UI strip only; **no contest tables**; likes API unused in UI |
| No app update needed for new images | ✅ | Approved images load from Supabase at runtime |

---

## Architecture (implemented)

```
Saint page [إضافة صورة]
    → saint_gallery_images (pending)
    → platform_approvals (saint_image)
    → Admin [اعتماد | رفض | طلب تعديل]
    → approved + auto album + is_featured
    → Synaxarium hero / dynamic card / home featured URL
```

---

## Key Files

| Layer | Path |
|-------|------|
| Feature | `src/features/saint-gallery/` |
| Migration | `supabase/migrations/20250618180000_saint_community_gallery.sql` |
| Manual run | `supabase/RUN_SAINT_COMMUNITY_GALLERY.sql` |
| Saint page | `src/routes/synaxarium.$saintId.tsx` |
| Dynamic card | `src/routes/synaxarium.index.tsx` |
| Contributions | `src/routes/profile.contributions.tsx` |
| Admin sync | `src/features/platform-admin/platform-api.ts` |
| Home hero | `src/components/home/useHeroStackData.ts` |

---

## DB Objects

### `saint_gallery_images`
`saint_id`, `storage_path`, `public_url`, `title`, `note`, `status` (pending | under_review | approved | rejected | needs_changes), `submitted_by`, contributor fields, `is_featured`, `like_count`, `view_count`, review metadata.

### `saint_gallery_likes`
`(image_id, user_key)` — API exists, **not wired to hero/album UI**.

### Storage
Bucket `saint-gallery` — path `{saintId}/{userId}/{imageId}.ext`

---

## Warnings

1. **Migration may be unapplied on remote** — uploads fail without `RUN_SAINT_COMMUNITY_GALLERY.sql` (see `2026-06-18_19-00-00_SAINT_GALLERY_UPLOAD_ERROR_FIX.md`).
2. Hero ❤️ uses **localStorage**, not `saint_gallery_likes`.
3. Admin reject may not persist `rejection_reason` on gallery row.
4. RLS is permissive (dev pattern) — tighten before public scale.

---

## Errors

None (audit only).

---

## Recommendations — Priority backlog

| P | Task |
|---|------|
| P0 | Apply `RUN_SAINT_COMMUNITY_GALLERY.sql` on production Supabase |
| P1 | Add profile link: ملفي → مساهماتي → `/profile/contributions` |
| P1 | Wire `toggleSaintGalleryLike` + `incrementSaintGalleryView` in album/hero |
| P2 | Home `HeroDailyCard` parity: cycle + share picker (reuse `SaintDynamicHeroCard` patterns) |
| P2 | Saint detail share uses selected gallery image |
| P3 | Admin featured-image picker (change cover without re-upload) |
| P3 | Contest seasons tables + monthly winner logic |
| P4 | Push notifications beyond in-app approval notifications |

---

## Overall Status

**PARTIAL** — Core pipeline built; production readiness + UX polish remain.
