# Publisher Page — AudioV2 Merge (Unified Experience)

**Date:** 2026-06-24  
**Scope:** `/publisher/$publisherId` canonical page

---

## Executive Summary

Merged the AudioV2 listening engine into the official publisher public page (`PublisherPublicPageView`). One route, one DNA: gold hero + engagement, ivory section tabs, dense track list, mini player, video panel, immersive scroll header, and BottomDock. Legacy `/audiov2/*` routes redirect to publisher routes.

---

## Findings

| Feature | Status |
|---------|--------|
| Hero carousel + like/share/QR | Preserved |
| Ivory `AlphaHeroPublisherSectionTab` navigation | Preserved |
| All content sections (favorites, hymns, albums, …) | Preserved |
| Play all / shuffle / resume quick actions | Added |
| Dense «استمع الآن» track list | Added (`publisher-listen`) |
| Sticky mini player (gold) | Added |
| Video panel (tap-to-play list) | Added |
| Immersive cover blur + scroll-aware header | Added (`PublisherPublicShell`) |
| BottomDock on public publisher page | Added |
| `/audiov2/*` → `/publisher/*` redirect | Done |
| Workspace links updated (no AudioV2 label) | Done |
| `npm run build` | PASS |

---

## New / Updated Files

- `src/features/publisher/publisher-playback.ts` — shared queue builder + player hook
- `src/features/publisher/components/PublisherPublicShell.tsx` — immersive bg + sticky header
- `src/features/publisher/components/PublisherMiniPlayer.tsx`
- `src/features/publisher/components/PublisherDenseTrackList.tsx`
- `src/features/publisher/components/PublisherPublicPageView.tsx` — merged player + UI
- `src/features/publisher/publisher-public-content.ts` — `listen` section key
- `src/routes/publisher.$publisherId.tsx` — uses shell
- `src/routes/publisher.preview.$publisherId.tsx` — uses shell
- `src/routes/audiov2.$publisherId.tsx` — redirect
- `src/routes/audiov2.preview.$publisherId.tsx` — redirect
- `src/features/publisher/components/PublisherWorkspaceScreen.tsx` — link labels

---

## Warnings

- AudioV2 screen components remain in repo for reference; public traffic should use `/publisher/$id` only.
- `listen` + `continue` + quick-action «أكمل» may feel slightly redundant — acceptable for now; can collapse later.
- Preview route header title shows «معاينة — …» prefix.

---

## Errors

None.

---

## Recommendations

1. Manual QA: hero play, list play, mini player next/prev, video overlay, section tab scroll offsets.
2. Consider removing unused `AudioV2PublisherScreen` after soak period.
3. Add heart icon on dense list rows (inline favorites).

---

## Overall Status

**PASS**
