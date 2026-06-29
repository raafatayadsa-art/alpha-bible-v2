# Alpha Control — Media Manager Phase 1

**Date:** 2026-06-29  
**Scope:** Media Manager module inside Alpha Control Center  
**Route:** `/platform/media-manager`  
**Build:** PASS  
**Overall Status:** PARTIAL

---

## Executive Summary

Added **Media Manager** as a new Alpha Control module using the existing dark glass design system (`MC`, `PlatformStatsBar`, `PlatformModuleCard`, `MissionSubShell`). The screen reads from Supabase `media_library` + `saints_index`, resolves previews from `alpha-media` bucket, and supports Pending / Approved / Rejected / Featured / Primary tabs with search, category filters, grid cards, and a right-side detail panel with Approve · Reject · Set Primary · Delete actions.

---

## Findings

### UI (no DNA changes)
- Header, bottom navigation, typography, and hero patterns unchanged.
- New entry via dashboard card **Media Manager** under Tools & Analytics (same pattern as Content Review).
- Side panel slides from the right (not a popup modal).

### Backend wiring
| Source | Usage |
|--------|--------|
| `media_library` | List, approve, reject, set primary, delete |
| `saints_index` | Saint name for `entity_type = saint` |
| `user_profiles` | Uploader display name |
| `alpha-media` bucket | Signed preview URLs for private storage |
| `platform_audit_log` | Rejection reason (no column on `media_library`) |

### Featured tab logic (existing columns only)
- Approved rows where `display_order > 0` **OR** `category = 'featured'`.

---

## Warnings

1. **RLS gap on `media_library`** — Production has SELECT (approved / own pending) and INSERT only. **No UPDATE/DELETE/owner SELECT policies.** Admin actions may return RLS errors until backend policies or RPCs are added (not changed per instructions).
2. **Rejection reason** — Stored in `platform_audit_log`, not on `media_library` (table has no `rejection_reason` column).
3. **`alpha-media` is private** — Previews use signed URLs; broken paths fall back to `image_url`.

---

## Errors

None during build.

---

## Files Added / Updated

| File | Purpose |
|------|---------|
| `src/features/platform-admin/media-manager-api.ts` | Supabase API |
| `src/features/platform-admin/MediaManagerScreen.tsx` | Main screen |
| `src/features/platform-admin/MediaManagerSidePanel.tsx` | Right panel + actions |
| `src/routes/platform.media-manager.tsx` | Route |
| `AlphaMissionControl.tsx` | Dashboard card |
| `mission-control-ui.tsx` | `COMMAND_ICONS.mediaManager` |
| `index.ts` | Export |

---

## Recommendations

1. Add owner/admin RLS (or `security definer` RPC) for `media_library` SELECT all + UPDATE + DELETE when ready (outside this phase).
2. Test with owner session logged into Supabase Auth on `/platform/media-manager`.
3. Upload real assets to `alpha-media` with valid `storage_path` for preview testing.

---

## User Test Checklist

- [ ] Open Alpha Control → **Media Manager**
- [ ] See Pending stats + grid from `media_library`
- [ ] Tap card → side panel with preview + metadata
- [ ] Approve → moves to Approved tab
- [ ] Reject with reason → moves to Rejected tab
- [ ] Set Primary on saint-linked image
- [ ] Search by saint / title / user
- [ ] Filter by category chips

---

## Overall Status

**PARTIAL** — UI + API complete; production RLS may block writes until backend owner policies exist.
