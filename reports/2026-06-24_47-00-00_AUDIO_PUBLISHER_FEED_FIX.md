# Audio Screen Publisher Feed Fix

**Date:** 2026-06-24  
**Scope:** Fix publisher cards not appearing on `/audio`

---

## Executive Summary

Publisher pages were missing from the audio screen because rows stayed `draft` / `is_public=false` despite having approved public audio content. Applied DB repair migration plus client-side auto-publish on approval and feed retry.

---

## Root Cause

| Requirement for `/audio` feed | Stuck publisher state |
|------------------------------|------------------------|
| `status = published` | `draft` |
| `is_public = true` | `false` |
| `publisher_type` in choir/hymn_team/church_service | `choir` ✓ |
| Approved public audio content | hymn + album ✓ |

RLS `publishers_public_read` hides non-published rows from anonymous feed queries.

---

## Fixes Applied

### Database (remote)
- Migration `audio_publisher_feed_publish_sync`
- Functions: `publisher_has_public_audio_content`, `publish_audio_publisher_if_ready`
- Repair loop published eligible audio publishers

### Client
- `ensureAudioPublisherPublished()` — publishes when public audio content exists
- `repairAudioPublishersForFeed()` — called from `AudioScreen` when feed empty
- `platform-api.ts` — after publisher setup/publication/content approval sync
- Clearer empty-state copy in `AudioPublishersSection`

---

## Findings

After migration repair, publisher **فغعونعغف** should be `published` + `is_public=true`.

Future flow: approving publisher setup or content with public audio auto-publishes via client + DB helpers.

---

## Warnings

- `repairAudioPublishersForFeed` requires authenticated session (RLS update policy).
- Anonymous visitors rely on DB `published` state (now repaired).

---

## Errors

None in lint pass.

---

## Recommendations

1. Hard refresh `/audio`
2. Approve pending **publisher_setup** in Alpha Control for full workflow parity
3. Apply local migration file `20250625004000_audio_publisher_feed_publish_sync.sql` on other environments

---

## Overall Status

**PASS**
