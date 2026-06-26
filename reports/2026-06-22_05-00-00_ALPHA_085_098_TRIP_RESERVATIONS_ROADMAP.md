# ALPHA-085 → ALPHA-098 — Trip Reservations Roadmap & v1 Delivery

**Date:** 2026-06-22  
**Scope:** Smart Waiting List (085) + Family Booking (086) implemented; 087–098 scaffolded

---

## Executive Summary

Delivered **v1 client implementations** for the two foundational reservation features (**ALPHA-085**, **ALPHA-086**) inside a new `trip-reservations` module. Created **type scaffolding and feature flags** for ALPHA-087 through ALPHA-098 to guide phased delivery without rebuilding approved trip UI.

---

## Findings

### Implemented — ALPHA-085 Smart Waiting List

| Component | Path |
|-----------|------|
| Core store | `trip-reservations/trip-waitlist.ts` |
| Offer UI | `trip-reservations/components/WaitlistOfferBanner.tsx` |

**Behavior (v1):**
- When trip seats are full, `ReservePopup` offers **انضمام لقائمة الانتظار** (booking stays open).
- On `cancelRegistration`, `processWaitlistAfterCancellation()` offers the seat to the first waiter.
- Offered user gets **30-minute hold** (`WAITLIST_HOLD_MS`) with confirm/decline banner on post page.
- Expired/declined offers cascade to the next person in queue.
- Organizers see waitlist counts in `ParticipantsAdminSheet`.

**Storage:** `localStorage` key `alpha:085:trip-waitlist`

### Implemented — ALPHA-086 Family Booking

| Component | Path |
|-----------|------|
| Family profile | `trip-reservations/family-booking.ts` |
| UI | `ReservePopup` — solo vs family toggle, member checkboxes |

**Behavior (v1):**
- User chooses **نفسي فقط** or **حجز عائلي**.
- Family members from local profile (`alpha:086:family-profile`).
- Booking meta saved per registration (`alpha:086:family-booking-meta`).
- Organizers see household name + member count in participant list.

### Scaffolded — ALPHA-087 → 098

`trip-reservations/trip-features-roadmap.ts` defines:
- `TRIP_FEATURE_FLAGS` (085–086 `true`, 087–098 `false`)
- Shared TypeScript types for buses, certificates, timeline, geo check-in, wallet, command center, etc.

### Integration

- `post-registrations.ts` — cancel hooks waitlist processor
- `PostActions.tsx` — enhanced `ReservePopup`
- `ParticipantsCounter.tsx` — family labels + waitlist stats
- `church.post.$id.tsx` — `WaitlistOfferBanner`

---

## Roadmap (087–098)

| ID | Feature | Depends on | Suggested phase |
|----|---------|------------|-----------------|
| 087 | Bus Management | 084, 083 | P2 — extend `TripOperationsPanel` |
| 088 | Trip Prayer Requests | 083 channels | P2 — trip channel tab |
| 089 | Digital Certificates | registrations | P3 — profile route |
| 090 | Trip Memory Album | 091, media storage | P3 — post-trip archive |
| 091 | Trip Timeline Replay | 090, 083 ops | P3 — archive UI |
| 092 | Smart Geo Check-In | registrations QR | P2 — geolocation API |
| 093 | Organizer Trust Dashboard | 084 grants | P2 — organizer-only sheet |
| 094 | Emergency Contact | 086 bookings | P2 — booking form field |
| 095 | Trip Wallet | 084 trips | P3 — payment ledger table |
| 096 | Companion Matching | 087 buses, 086 | P3 — organizer tool |
| 097 | Pilgrimage Passport | 089, completed trips | P4 — profile lifetime log |
| 098 | Trip Command Center | 083, 087, 092 | P4 — extends ops panel |

---

## Warnings

1. **Waitlist + family meta are localStorage** — not multi-device; needs Supabase tables + Realtime for production.
2. **No push notifications** for waitlist offers — user must open trip post to see banner.
3. **Family profile** uses placeholder members until user configures profile UI (not built yet).
4. **087–098** are types/flags only — no UI beyond existing ALPHA-083 ops panel.

---

## Errors

- None — `npm run build` **PASS**

---

## Recommendations

1. **Supabase migrations:** `trip_waitlist`, `family_booking_meta`, `trip_buses`, `trip_payments`.
2. **Push/in-app notification** when waitlist offer is created.
3. **Profile → أسرتي** screen to manage `FamilyProfile` members.
4. **Next implementation:** ALPHA-094 (emergency contact on booking) + ALPHA-087 (bus list in ops panel) — small, high value.
5. **ALPHA-098** should extend existing `TripOperationsPanel` rather than a new screen.

---

## Overall Status

**PARTIAL** — 085 & 086 v1 **PASS**; 087–098 **PLANNED** (scaffold only)
