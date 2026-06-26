# Profile Shield & Membership Card Fix

## Executive Summary

Updated profile hero and membership card per user feedback: shield replaces verification badge on avatar, membership card redesigned with large pulsing shield, compact active pill, enlarged church card, and new trip timeline section.

## Findings

### Avatar
- Removed green `BadgeCheck` verification circle and side-by-side duplicate shield.
- **`AlphaShield` (md, 36px)** positioned on avatar corner — shield **is** the verification; tap opens trust card.

### Membership card
- Redesigned 3-column layout: **xl shield (92px) + pulse** | membership data | QR (72px).
- Pulse moved from «نشط» pill to shield via new `AlphaShield` prop `pulseWrap`.
- «نشط» restored to **small compact pill** (no pulse wrap).
- Professional navy/gold card matching reference mockup.

### AlphaShield API
- Sizes: `sm` 28 · `md` 36 · `lg` 48 · `xl` 92 (default `sm` preserves existing usages).
- New `pulseWrap` for hero-ledger gold pulse ring.
- `ShieldImage` exported.

### Church card
- Enlarged hero image strip (120px) + fuller content block.

### Trip timeline
- New `ProfileTripTimelineSection` below church card — vertical Coptic timeline from pilgrimage passport (demo when empty).

## Warnings

- Trip timeline uses demo entries when passport is empty.
- `HeroLedgerStylesHost` required on page for shield pulse CSS on membership card.

## Errors

None. `npm run build` — PASS.

## Recommendations

- Wire timeline to live trip registrations + `getTripTimeline` per post.
- Add laurel SVG asset around card shield if design wants exact reference wreath.

## Overall Status

**PASS**
