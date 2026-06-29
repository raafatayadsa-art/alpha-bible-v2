# Community Screen Fix — مجتمعي `/community`

**Date:** 2026-06-27  
**Scope:** Runtime crash + layout + empty feed  
**Overall Status:** PASS

---

## Executive Summary

Fixed the community hub screen after recent pin/feed changes. Root cause was an unstable `useSyncExternalStore` snapshot for pinned moments (infinite re-render). Also corrected RTL identity alignment and feed fallback when demo moments did not match friend IDs.

---

## Findings

1. **Crash — unstable pin snapshot**  
   `getPinnedCommunityMomentIds()` returned a new array on every `getSnapshot()` call. Combined with `usePinnedCommunityMomentIds()` in multiple cards → infinite render loop / white screen.

2. **Layout — identity cluster on wrong side**  
   `CommunityUserIdentity` used `justify-end`, pushing avatar/name/shield to the left inside expanded header rows instead of the right (RTL).

3. **Empty feed edge case**  
   When user had friends whose IDs did not match local/demo moments, filtered feed was empty despite stored activity.

---

## Warnings

- Pin state remains local-only (`localStorage`).

---

## Errors

None after fix. `npm run build` exit 0.

---

## Recommendations

1. Open `/community` from bottom dock and confirm feed loads.
2. Toggle pin on a post — feed should re-order without freezing.
3. Verify comment/post headers: avatar + name + shield on the right, ⋮ menu on the far left.

---

## Changes Applied

| File | Change |
|------|--------|
| `community-moment-actions.ts` | Stable cached snapshot for pinned IDs |
| `CommunityMomentCard.tsx` | `isPinned` prop; single pin hook removed from cards |
| `CommunityScreen.tsx` | Pass `isPinned` from parent |
| `CommunityUserIdentity.tsx` | `justify-start` for RTL right alignment |
| `community-store.ts` | Feed fallback when friend filter yields empty list |

---

## Overall Status

**PASS**
