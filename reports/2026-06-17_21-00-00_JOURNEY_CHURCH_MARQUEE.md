# Journey Discover — Church Quick-Access Marquee

**Date:** 2026-06-17  
**Scope:** Apply Church "وصول سريع" scroll logic to Home "اكتشف رحلتك" while keeping center-card lift.

---

## Executive Summary

Extracted `useAutoMarquee` from Church quick-access DNA and wired it into `HomeJourneyDiscover`: infinite loop rail, auto-scroll, pause on touch, `no-scrollbar` track. Center lift + gold pulse preserved via DOM class toggling on each frame.

---

## Findings

- **New:** `src/hooks/useAutoMarquee.ts` — shared hook (optional `onFrame` for center detection during programmatic scroll).
- **HomeJourneyDiscover:** Same track structure as Church `QuickGrid` (`-mx-4 overflow-x-auto no-scrollbar`, inner `flex gap-3`).
- Duplicated items `[...items, ...items]` for seamless loop (speed 18, direction 1).
- Pause on pointer/touch; resumes after 2.2s idle.
- **Kept:** `is-centered` lift (`-10px`, scale 1.025), gold glow ring, ledger chips, center padding.
- Removed snap-scroll (conflicts with marquee); bottom hint updated.
- Build: PASS.

---

## Warnings

- Church `church.tsx` still has inline `useAutoMarquee` — can dedupe later to shared hook.

---

## Errors

None.

---

## Recommendations

- Tune `speed` (currently 18) if rail feels too fast on home vs church.

---

## Overall Status

**PASS**
