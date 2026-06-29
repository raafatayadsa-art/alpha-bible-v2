# Profile Registry Full Reset

**Date:** 2026-06-27

---

## Executive Summary

Cleared profile people registry on all devices (one-time bootstrap) and removed fake/default persons from profile UI.

---

## Changes

- `profile-registry-reset.ts` — wipes people links, family profile, booking meta, reposts; resets local profile bio/avatar.
- `ProfileRegistryBootstrap` — runs reset once per device on app load.
- `family-booking.ts` — default family members empty (no placeholder slots).
- `ProfilePremiumScreen` — no legacy family fallback; no auto "self" person in orbit.

---

## Cleared Keys (localStorage)

- `alpha:profile-people-links:v1`
- `alpha:086:family-profile`
- `alpha:086:family-booking-meta`
- `alpha:profile:publisher-reposts`
- `alpha:profile:content-reposts`
- `ab:profile-user` (avatar/bio/birthDate reset; privacy kept default)

---

## User Action

Refresh app on mobile and browser — family/connect orbits start empty; add people manually.

---

## Overall Status

**PASS**
