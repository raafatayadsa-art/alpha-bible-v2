# Publisher Preview — Engagement Bar Visibility Fix

**Date:** 2026-06-24

---

## Executive Summary

Engagement bar (like · repost · QR) and follow chip were hidden in preview mode via `{!preview ? ...}`. Fixed to always render for WYSIWYG workspace preview; like/share/follow show informational toast in preview; QR sheet opens normally.

---

## Findings

- Root cause: intentional `!preview` guard on `AlphaHeroPublisherEngagementBar` and `showFollow={!preview}`.
- Publisher preview must mirror published page layout.

---

## Changes

- `PublisherPublicPageView.tsx`: always show engagement bar; follow visible; preview toasts for like/share/follow; QR unchanged.

---

## Warnings

- Like/share/follow API calls remain blocked in preview (by design).

---

## Errors

None.

---

## Overall Status

**PASS**
