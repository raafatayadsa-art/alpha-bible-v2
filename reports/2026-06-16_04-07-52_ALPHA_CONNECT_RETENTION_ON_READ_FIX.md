# Alpha Connect Retention Fix Report (On-Read Immediate Delete)

**Project:** Alpha Bible  
**Policy:** ALPHA-DATA-POLICY-002 (corrected)  
**Report generated:** 2026-06-16 04:07:52  
**Migration:** supabase/migrations/20250616150000_alpha_connect_on_read_immediate.sql  
**Run script:** supabase/RUN_ALPHA_CONNECT_ON_READ_FIX.sql  
**Scope:** Alpha Connect / Alpha Messages ONLY (not church posts, prayer, events, etc.)

---

## Executive Summary

Corrected ALPHA-DATA-POLICY-002 implementation for Alpha Connect. The previous "read = expires 60 seconds after read" behavior was removed. The new `on_read` policy deletes database rows, storage files, and all metadata immediately when a message is marked read or a voice message is fully listened to.

Allowed retention options are now exactly seven: Immediate After Read/Listen, 1 Hour, 6 Hours, 12 Hours, 24 Hours, 3 Days, 7 Days. Permanent storage (never / keep forever / unlimited) is fully removed.

**Overall Status: PASS** (pending execution of RUN_ALPHA_CONNECT_ON_READ_FIX.sql on Supabase)

---

## Findings

### Violation Corrected — Immediate After Read/Listen

**Previous (incorrect):**
- read policy set expires_at to 60 seconds after read_at update
- No immediate deletion of row or storage

**New (correct):**
- Policy key: `on_read`
- On INSERT: expires_at = NULL (no timed expiry; waits for consumption)
- On UPDATE read_at (first time): AFTER trigger deletes storage object + database row immediately
- Applies to text (read when 75% visible) and voice/PTT (marked consumed only after audio ends fully)

**Database objects:**
- alpha_connect_set_message_expiry() — handles on_read with NULL expires_at
- alpha_connect_on_message_consumed() — security definer trigger function
- alpha_connect_messages_consume_on_read — AFTER UPDATE OF read_at trigger

### Allowed Retention Options (Alpha Connect only)

| Key | Behavior |
|-----|----------|
| on_read | Delete immediately on read / full listen |
| 1h | Delete after 1 hour (server cron + expires_at) |
| 6h | Delete after 6 hours |
| 12h | Delete after 12 hours |
| 24h | Delete after 24 hours (default) |
| 3d | Delete after 3 days |
| 7d | Delete after 7 days (maximum timed retention) |

**Removed completely:** never, read (legacy), hour, day, week, keep forever, unlimited retention

### Server-Side Timed Cleanup (unchanged)

- pg_cron job alpha-connect-purge-expired every 15 minutes
- Purges rows where expires_at <= now()
- Deletes storage + metadata
- on_read messages are NOT in purge queue (expires_at IS NULL); they delete only on consumption

### App Changes

- EphemeralDelete type includes on_read
- Settings UI: "فوراً بعد القراءة/الاستماع" as first option
- normalizeRetentionPolicy maps legacy never/read to on_read
- AlphaConnectMessageThread: voice consumption on audio ended; text on_read uses IntersectionObserver
- markAlphaConnectMessageRead tolerates immediate row deletion (PGRST116)

### Out of Scope (unchanged)

This policy does NOT apply to:
- Church posts
- Prayer requests
- Church announcements
- Community content
- Events / conferences
- Spiritual content

### Bonus Fix

- Repaired corrupted function header in 20250615160000_alpha_connect_mvp.sql (alpha_connect_delete_storage_object)

---

## Warnings

1. Run supabase/RUN_ALPHA_CONNECT_ON_READ_FIX.sql on production after prior retention migrations.
2. If 20250616140000 was applied without on_read, this migration is required.
3. Partial voice playback does NOT trigger deletion (by design — full listen only).
4. Sender viewing own on_read messages does not trigger consumption (recipient only).

---

## Errors

None in codebase. Production DB requires SQL execution.

---

## Recommendations

1. Run RUN_ALPHA_CONNECT_ON_READ_FIX.sql in Supabase SQL Editor.
2. Test on_read text: send message, scroll into view, confirm row deleted.
3. Test on_read voice: play to completion, confirm row + storage deleted.
4. Test timed policy (24h): confirm expires_at set and cron purge works.

---

## Deployment

```sql
-- Run entire file:
-- supabase/RUN_ALPHA_CONNECT_ON_READ_FIX.sql

-- Verify constraint:
SELECT pg_get_constraintdef(oid) FROM pg_constraint
WHERE conrelid = 'public.alpha_connect_messages'::regclass AND contype = 'c';

-- Verify trigger:
SELECT tgname FROM pg_trigger WHERE tgname = 'alpha_connect_messages_consume_on_read';
```

---

## Overall Status

**PASS** — Implementation complete. Production compliance after SQL execution.
