# Brand, Profile, Bible & Church Setup Fix Report

## Executive Summary

Unified the official slogan to **Ⲁ —THE COPTIC ORTHODOX DIGITAL HOME —Ⲱ** (full-width, dark) across brand components. Removed gold avatar frames on profile and menus. Fixed Alpha ID display after registration. Enabled church directory search on map + city/governorate filtering. Restored verse-sheet share button, light saved-verses theme, meditate glow on home verse card, and hardened church setup submission.

## Findings

### Slogan
- `alpha-brand.ts` — canonical text updated
- New `AlphaOfficialSlogan` — full width, dark `#2a1f12`, responsive clamp sizing
- Applied in: `AlphaBrandFooter`, `AlphaBrandIdentity`, `AlphaAuthScreens`, `profile.membership`, `AlphaControlCenter`

### Profile
- `ProfileCopticAvatarFrame` — plain circular avatar, no gold ornate ring
- `ProfileSettingsMenu` — all avatar variants borderless
- `useProfileMembershipData` — derives Alpha ID from `useAlphaAuth().id` with sync fallback
- `ProfileSimpleHeader` — Alpha ID under name with visible dark muted color

### دليل الكنائس
- Search bar visible on **map and list** modes
- Map pins filtered by name / city / governorate / patron saint
- Church setup directory picker fills city + governorate when selecting a church

### Bible / Home
- `VerseActionSheet` — standalone **مشاركة** button restored in toolbar
- `saved-vault-tokens` + `SavedVersesPremiumScreen` — **light ivory** theme for saved tab
- `PremiumVerseHeroCard` — `meditateActivePulse` + stronger glow when تأمل active

### تأسيس الكنيسة
- `church-setup-api.ts` — waits for auth session (`waitForAuthUserId`), unique request numbers, detailed error logs, approval retry with empty documents, partial success if setup row saved but approval fails

## Warnings

- If church setup still fails on production, check Supabase RLS on `church_setup_requests` / `platform_approvals` and browser console for `[church_setup]` logs.
- Map search filters client-side pins only; list mode still uses RPC `search_church_directory` (already supports city/governorate in query).

## Errors

- None. Build: **PASS** (`npm run build`, exit 0).

## Recommendations

1. Test church setup submit while logged in on device; confirm approval appears in platform console.
2. Verify Alpha ID appears immediately after registration on `/profile`.
3. Confirm saved verses screen readability in sunlight (light theme).

## Overall Status

**PASS**
