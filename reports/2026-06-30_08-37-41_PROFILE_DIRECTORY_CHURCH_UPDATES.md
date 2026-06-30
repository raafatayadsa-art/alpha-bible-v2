# Profile, Directory, Church Feed & Multi-Membership Updates

## Executive Summary

Implemented multi-church membership, directory search/filter fixes, profile cover upload + identity display, church member suggestions, church feed inline comments, servant direct posting, and priest servant-permissions UI. Production build **PASS**.

## Findings

### 1. انضمام لأكثر من كنيسة
- `getActiveMembershipChurchIds()` + `isMemberOfChurch()` added.
- `joinChurch()` inserts per `(church_id, user_id)` — no longer blocks second church.
- `JoinChurchButton`: `mini` icon variant for directory list; multi-membership aware.

### 2. زر انضمام أصغر في دليل الكنائس
- List cards: `mini` — 32×32 icon button.
- Floating card: `compact` shortened label.

### 3. بحث دليل الكنائس (محافظة / مدينة)
- Removed double client text filter on paginated rows (server RPC is source of truth).
- Map pins now respect governorate, city, patron saint, verified, and query filters.
- `fetchCitiesForGovernorate()` + `useCitiesForGovernorate()` — city dropdown scoped to selected governorate.

### 4. صورة الغلاف في الملف الشخصي
- New `profile-cover-api.ts` — upload to storage + `user_profiles.cover_url`.
- `ProfilePremiumScreen` loads cloud cover on mount; uploads on pick.
- Cover camera button `z-30` so it stays clickable.

### 5. كود المستخدم + المعرف
- Profile shows `ALPHA-XXXXXX` (copy) + truncated UUID (copy).
- `useProfileMembershipData` exposes `alphaIdFull` and `userId`.

### 6. أشخاص قد تعرفهم — أعضاء الكنيسة
- `useCommunityPeopleSuggestions` loads active members from all joined churches (`church_memberships`).
- Subtitle: **من كنيستك**.

### 7. عضو كنيسة
- `AFFILIATION_LABEL.approved` → **عضو كنيسة** (was عضو منتسب).

### 8. بوستات الكنيسة مثل المجتمع
- `ChurchPostInlineComments` on hub-preview cards — toggle comments on same post.
- Card tap still opens `/church/posts/$type` (posts of same type).
- Type-list mode unchanged (detail + `#comments`).

### 9. الخدام والكاهن
- Servants publish trips **without** priest approval (`canPublishTripDirectly` includes servant).
- `FeedSectionHeader` rendered in church feed with **صلاحيات الخدام** → `TripOrganizerGrantSheet` (priest/owner only).

## Warnings

- Primary church hub (`/church`) still uses first active membership — multi-church switcher not added.
- Priest task assignment uses existing trip-organizer grant sheet (localStorage) — not full Alpha Control–style task board.
- Cover upload requires storage RLS + `user_profiles` update permissions.

## Errors

- None in build.

## Recommendations

1. Add church switcher in profile / church home for users in multiple churches.
2. Persist servant permissions to Supabase instead of localStorage only.
3. Test directory filters with real governorate/city data on production.

## Overall Status

**PASS**
