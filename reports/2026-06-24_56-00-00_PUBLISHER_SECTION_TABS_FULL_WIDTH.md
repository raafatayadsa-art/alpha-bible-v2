# Publisher Section Tabs — Full Width & Section Scroll

**Date:** 2026-06-24  
**Scope:** تبويبات الأقسام أسفل هيرو الناشر

---

## Executive Summary

Redesigned publisher section quick-jump tabs below the hero: equal-width responsive grid, light ivory styling distinct from dark engagement buttons, and smooth scroll to each content section via `scrollIntoView`.

---

## Findings

- Tabs used horizontal scroll with fixed min/max widths — did not fill screen proportionally.
- Section tabs reused dark ledger DNA — visually identical to like/repost/QR row.
- Navigation used hash `href` only — unreliable in SPA scroll context.

---

## Changes

| File | Change |
|------|--------|
| `hero-card-chrome.tsx` | `AlphaHeroPublisherSectionTab` → light ivory button, `onClick`, `active` state |
| `PublisherPublicPageView.tsx` | CSS grid `repeat(n, 1fr)`, `scrollToPublisherSection`, show when ≥1 section |

---

## Warnings

- Many sections (>6) wrap in 3–4 column grid (2 rows) — labels truncate with ellipsis.
- Active tab highlights on click only (no scroll-spy yet).

---

## Errors

None.

---

## Recommendations

1. Test publisher page with hymns + albums + about — tap each tab lands on correct list.
2. Optional: IntersectionObserver for active tab while scrolling.

---

## Overall Status

**PASS**
