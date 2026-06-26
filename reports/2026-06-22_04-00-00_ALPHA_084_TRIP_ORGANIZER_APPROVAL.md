# ALPHA-084 — Trip Organizer Role & Approval Workflow

**Date:** 2026-06-22  
**Status:** v1 implemented (client-side grants + Supabase post details)

---

## Executive Summary

Implemented ALPHA-084 as an isolated `trip-organizer` module integrated with existing church posts, PostBuilder, and ALPHA-083 trip channel provisioning. Trip organizers can create trips that enter **pending approval**; priests (and servants as reviewers) approve, request changes, or reject. On approval, the post publishes, bookings open, and dual trip channels are provisioned automatically.

---

## Findings

### New module: `src/features/church/trip-organizer/`

| File | Purpose |
|------|---------|
| `trip-organizer-grants.ts` | localStorage grants (permanent / single-trip), reviewer list |
| `trip-organizer-access.ts` | Permission checks, public feed filter |
| `trip-approval-workflow.ts` | Submit / approve / reject / request changes |
| `components/TripApprovalSheet.tsx` | Reviewer UI |
| `components/TripOrganizerGrantSheet.tsx` | Priest grant UI |
| `index.ts` | Public exports |

### Data model (`ChurchPostDetails`)

Extended with:
- `approvalStatus`: `pending` | `changes_requested` | `approved` | `rejected`
- `organizerUserId`, `organizerName`, `churchName`
- `approvedByUserId`, `approvedByName`, `approvalNote`
- `submittedAt`, `reviewedAt`
- `price`, `program`

### Workflow

1. **Trip organizer** (or priest) opens PostBuilder → trip fields include price + program.
2. Non-priest submit → `approvalStatus: pending` — **not** in public feed, **no** channels, **no** bookings.
3. **Priest / servant reviewer** opens "للمراجعة" inbox → approve / request changes / reject.
4. **On approve** → `approved`, `provisionTripChannels()` (ALPHA-083), audit fields saved.
5. **Priest / owner** publish trips directly without queue.

### Integration points

- `PostBuilder.tsx` — `submitTripPost()`, trip-only mode, pending notice
- `use-church-posts.ts` — filters unpublished trips from feed
- `church.tsx` — grant button, approval inbox, gated create button
- `church.post.$id.tsx` — pending banner, blocked reservations
- `smart-context-engine.ts` — only approved trips in home card
- `trip-live-store.ts` — expires single-trip grants on completion

### API

- `patchChurchPostDetails()` added to `church-posts-api.ts` for merging JSON `details`.

---

## Warnings

1. **Grants are localStorage** — not synced across devices or users; needs Supabase `trip_organizer_grants` table for production.
2. **No push notifications** — reviewers see inbox badge only when on church screen.
3. **Servants can review** all trips by role; fine-grained "authorized reviewer" list exists but is not wired to UI yet.
4. **Direct URL** to pending trip still loads detail page (shows pending state, no booking).
5. **Conferences / monastery visits** — v1 uses `trip` post type only; separate categories deferred.

---

## Errors

- None at build time after fixing `church-posts-api.ts` syntax and component import paths.
- `npm run build` — **PASS**

---

## Recommendations

1. Supabase migration: `trip_organizer_grants`, RLS by `church_id`.
2. Notification row on `submitTripPost` for priests/reviewers.
3. Admin UI to pick reviewer servants from church directory (not raw user-id).
4. Resubmit flow when status is `changes_requested` (edit + re-submit).
5. Wire `useSmartContext` to live `fetchChurchPosts` so approved trips appear on home.

---

## Overall Status

**PASS** — v1 client workflow complete; production hardening (DB grants + notifications) recommended next.
