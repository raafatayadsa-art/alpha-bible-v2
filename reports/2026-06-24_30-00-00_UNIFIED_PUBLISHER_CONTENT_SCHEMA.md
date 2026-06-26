# Unified Publisher Content Schema (Step 1)

**Date:** 2026-06-24

---

## Executive Summary

Added unified content fields to `publisher_content_items`: visibility levels, download policy, likes count, duration, media URL, and PDF content kind. Updated RPC `submit_publisher_content` and TypeScript types/API mapping.

---

## Findings

### Migration

File: `supabase/migrations/20250624220000_unified_publisher_content.sql`

| Column / type | Purpose |
|---------------|---------|
| `publisher_content_visibility` enum | public, verified_users, church_members, followers, private |
| `visibility` | Default `private` |
| `allow_download` | Default `false` (streaming only) |
| `likes_count` | Default `0` |
| `duration_seconds` | Audio/video duration |
| `media_url` | File URL (audio/PDF) |
| `pdf` content kind | Added to enum |
| Indexes | Public feed + audio feed partial indexes |

### Client

- `PublisherContentItem` extended
- `submitPublisherContent` accepts options object
- Workspace uses defaults until Step 6 UI

---

## Warnings

- **Apply migration on Supabase** before testing new columns.
- Old RPC signature replaced — requires new migration applied.
- Select queries fail if migration not applied (missing columns).

---

## Errors

None in linter for touched publisher files.

---

## Recommendations

- User-approved next steps: **2** (aggregator API) or **4** (`/audio` wiring).

---

## Overall Status

**PASS** (step 1 scope — pending DB apply)
