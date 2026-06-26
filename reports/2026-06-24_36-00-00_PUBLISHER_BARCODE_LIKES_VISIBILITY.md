# Publisher Barcode, Likes, Share + Visibility Map

**Date:** 2026-06-24

---

## Executive Summary

Added **publisher page QR/barcode**, **like + share on hero card**, and **add assistant via member barcode** (Alpha ID scan/manual paste). Documented where publisher pages appear today and planned surfaces.

---

## Findings

### Implemented

| Feature | Details |
|---------|---------|
| Publisher barcode | Code `ALPHA-P-XXXXXX` + QR `alpha://publisher/{id}` — sheet from hero & workspace |
| Hero actions | Like, Share, QR on `PublisherPublicPageView` + action row below hero |
| Page likes | `publisher_page_likes` + `toggle_publisher_page_like` RPC + `likes_count` on publishers |
| Assistant by barcode | `add_publisher_team_member_by_alpha_id` — lookup `alpha_identities` |
| Team UI | «مسح باركود العضو» primary; email fallback retained |

### Where publisher pages appear

| Surface | Route / path | Status |
|---------|----------------|--------|
| Public page | `/publisher/$publisherId` | Live when `published` + `is_public` |
| Owner hub | `/publisher` (from Profile → صفحات الناشر) | Live |
| Private workspace | `/publisher/workspace/$publisherId` | Live |
| Preview | `/publisher/preview/$publisherId` | Live (owner/team) |
| Church directory detail | `ChurchPublisherPageLink` on verified church | Live |
| Platform content review | `/platform/content-review` | Admin only |
| Audio home / discovery | `/audio` aggregator | Planned (Step 2 roadmap) |
| Home feed card | — | Not wired yet |
| Search / global directory | — | Not wired yet |

After publication + content approval, users reach the page via **church link**, **shared URL/QR**, or **direct link**. Full discovery in Audio module is next phase.

---

## Warnings

- Camera scan UI is placeholder — manual Alpha ID paste works now (same as membership scan).
- Member must have row in `alpha_identities` for barcode add.
- Likes require authenticated user.

---

## Errors

None.

---

## Recommendations

1. Wire `/audio` publisher cards to `/publisher/$id`.
2. Enable camera QR via `html5-qrcode` or native bridge.
3. Deep-link handler: `alpha://publisher/{id}` → navigate in app.

---

## Overall Status

**PASS**
