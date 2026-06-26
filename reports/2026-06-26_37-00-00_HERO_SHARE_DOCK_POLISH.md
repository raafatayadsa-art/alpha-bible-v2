# Hero Verse · Share Sheet · Bottom Dock Polish

**Date:** 2026-06-26

---

## Executive Summary

Hero verse card now opens the exact chapter with a **5-second golden pulse** on the target verse. The separate share button was removed; **انتشار** triggers the branded share sheet. Share sheet redesigned as **dark premium glass** with Alpha-style circular action buttons (WhatsApp, Telegram, Facebook, Twitter, native share, copy). Main bottom dock updated to **dark transparent glass** with gold active icons. Build **PASS**.

---

## Findings

| Area | Change |
|------|--------|
| Hero verse tap | Navigates to `/$book/$chapter?verse=N` with book name resolution |
| Verse pulse | Golden glow animation; duration **5s** (`VERSE_PULSE_DURATION_MS`) |
| Hero top bar | Share button hidden (`hideShare`); save + badge only |
| انتشار | Wired to same share flow as former share button |
| Share sheet | Dark glass panel, Lucide icons, gold CTA, platform glow rings |
| Bottom dock | `.alpha-app-dock` dark glass bar, white idle icons, gold active glow |

### Key files

- `src/components/home/hero-stack-data.ts` — verse search param + book resolve
- `src/components/home/PremiumVerseHeroCard.tsx` — hide share, broadcast = share
- `src/components/home/hero-card-chrome.tsx` — `hideShare` on top bar
- `src/lib/chapter-verse-highlight.ts` — 5s pulse duration
- `src/styles.css` — `verse-saved-pulse--*` keyframes
- `src/routes/home.tsx` — `ShareSheetHost` premium redesign
- `src/components/alpha/alpha-dock-system.css` — dark glass app dock

---

## Warnings

- Twitter/X icon uses Lucide `Twitter` (legacy name); intent URL is `twitter.com/intent/tweet`.
- External share still auto-downloads branded image before opening Facebook/Telegram/etc.

---

## Errors

None. `npm run build` exit 0.

---

## Recommendations

1. Smoke-test hero tap on device with today's verse reference (Arabic book name).
2. Optional: apply `hideShare` + broadcast=share to daily hero cards (readings/saint/feast) for parity.

---

## Overall Status

**PASS**
