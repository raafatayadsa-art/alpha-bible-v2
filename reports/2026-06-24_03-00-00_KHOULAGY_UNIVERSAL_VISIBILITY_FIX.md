# Khoulagy — Universal Visibility Fix (Browser + Mobile + Production)

**Date:** 2026-06-24  
**Status:** Applied + Deployed

---

## Executive Summary

Applied fixes so Khoulagy UI changes are visible on **desktop, mobile, and production**:

1. **Always-visible card glow** — pulse animation on all grid cards (not hover-only).
2. **Tighter grid** — `gap-0.5` between hymn cards.
3. **Route never blocked** — removed `/kholagy` from `PlatformModuleGate` prefixes (Alpha Control toggle still hides nav/journey cards).
4. **Cache bump v4** — purges legacy module caches that caused redirect to `/home`.
5. **Production deploy** — `npm run build && wrangler deploy` completed successfully.

---

## Findings

### Code changes

| File | Change |
|------|--------|
| `src/routes/kholagy.index.tsx` | `kholagyCardGlow` animation, always-on border, top gradient line, `gap-0.5`, touch `active` glow |
| `src/lib/platform-modules/module-route-map.ts` | `kholagy: []` — route not module-gated |
| `src/lib/platform-modules/platform-modules-client.ts` | Cache key `v4`, purge v1–v3 |

### Build & deploy

- **Build:** PASS
- **Deploy:** PASS (`wrangler deploy`)

---

## Warnings

- Khoulagy **home card** still always visible; disabling in Alpha Control hides hub nav + journey carousel only, not the dedicated route.
- First load after deploy: hard refresh once to drop old JS bundle cache.

---

## Errors

None.

---

## Recommendations

1. Open `/kholagy` on phone and desktop — cards should pulse with purple/gold glow.
2. Hard refresh (Ctrl+Shift+R) if an old tab is open.
3. Commit untracked kholagy files to git for team/CI parity.

---

## Overall Status

**PASS**
