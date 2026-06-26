# Global Share, Dock, Scroll & Settings Fix

**Date:** 2026-06-26  
**Scope:** Unified share sheet, Bible mobile scroll, dock sizing, home settings menu

---

## Executive Summary

Implemented a global **انتشار البركة** share system (`openAlphaShareSheet`) mounted app-wide in `__root.tsx`, matching the verse-card share flow with branded image, hashtags, Alpha website links, collapsible social menu, and **مشاركة على صفحتي**. Fixed Bible chapter scroll progress on mobile, added side scroll rail to chapter reader, enlarged bottom dock icons with refreshed Lucide icons, and fixed home settings menu via portal + fixed positioning.

**Overall Status: PASS** (build verified)

---

## Findings

1. Share sheet lived only in `home.tsx` — other screens used clipboard/native share without branded image flow.
2. `articleScrollProgress` used `offsetParent` chain — broken inside `.alpha-viewport-scroll` on mobile.
3. Chapter reader lacked `ChapterReadingScrollRail` (present in Agpeya/Kholagy only).
4. Home `overflow-x-hidden` + absolute dropdown clipped `ProfileSettingsMenu`.
5. Dock icons at 18px felt small; labels at 0.53rem.

---

## Changes Applied

### Global share (`src/lib/alpha-share-sheet/`)
- `openAlphaShareSheet()` — event bus for any screen
- `AlphaShareSheetHost` — in `__root.tsx` (z-120)
- Social: one **السوشيال ميديا** button → WA / Telegram / Facebook / Twitter submenu
- Each social share: Web Share API with image file when supported, else download branded JPEG + open platform URL
- Text includes `#ألفا_القبطي #AlphaCoptic #AlphaBible` + `www.alphacoptic.com` + store links
- **مشاركة على صفحتي** → `repostContentToProfile()` + `ProfileContentRepostsSection` on profile

### Wired to global share
- Home verse/daily cards, saved verses, journal, Bible chapter header share

### Bible scroll
- `articleScrollProgress` → `getBoundingClientRect` + scrollTop (mobile-safe)
- `ChapterReadingScrollRail` added to `$book.$chapter.tsx`
- Wider touch target on rail (28px hit area)
- Scroll-root listener for chrome visibility on mobile

### Dock
- Icons: `House`, `Church`, `BookMarked`, `UsersRound`, `CircleUser`
- Size: 21px → 23px (sm); labels 0.58rem → 0.64rem; more padding

### Home settings
- `ProfileSettingsMenu` → `createPortal` + fixed position (z-10060)
- Home root: `overflow-x-clip` instead of `overflow-x-hidden`

---

## Warnings

1. Social apps on mobile cannot auto-attach images via URL — flow downloads branded image or uses native share with file when available.
2. Profile content reposts are localStorage-only until backend sync exists.
3. Remaining share buttons (church, publisher, membership) not yet migrated — call `openAlphaShareSheet` when needed.

---

## Errors

None. `npm run build` — **PASS**.

---

## Recommendations

1. Migrate church/publisher/membership share buttons to `openAlphaShareSheet`.
2. Sync `ProfileContentRepost` to Supabase for cross-device profile feed.
3. Add verse-level share from chapter reader (per-verse payload).

---

## Verification Checklist

- [ ] Verse card → انتشار → social submenu → WhatsApp (text + image flow)
- [ ] مشاركة على صفحتي → appears on Profile
- [ ] Bible chapter: progress bar moves on mobile scroll
- [ ] Bible chapter: side rail draggable on phone
- [ ] Dock larger + new icons
- [ ] Home ⚙️ opens settings menu (not clipped)
