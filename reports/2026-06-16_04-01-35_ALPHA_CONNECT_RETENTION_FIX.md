# Alpha Connect Retention Fix Report

**Project:** Alpha Bible  
**Policy:** ALPHA-DATA-POLICY-002  
**Report generated:** 2026-06-16 04:01:35  
**Migration file:** supabase/migrations/20250616140000_alpha_connect_retention_policy_002.sql  
**Manual run script:** supabase/RUN_ALPHA_CONNECT_RETENTION_FIX.sql

---

## Executive Summary

Two architecture violations in Alpha Connect retention were fixed in code and database migrations:

1. Removed permanent storage option (never) and all legacy retention values. Allowed policies are now strictly timed: 1h, 6h, 12h, 24h, 3d, 7d (maximum 7 days).

2. Added server-side scheduled cleanup via pg_cron running every 15 minutes. Expired messages are deleted automatically even when no user opens the app, including database rows and storage objects.

**Overall Status: PASS** (pending execution of RUN_ALPHA_CONNECT_RETENTION_FIX.sql on Supabase production)

---

## Findings

### Violation 1 — Retention Policy (FIXED)

**Before (non-compliant):**
- Allowed: read, hour, day, week, never
- never set expires_at to NULL (permanent storage)
- read allowed indefinite storage until read

**After (ALPHA-DATA-POLICY-002 compliant):**

Policy key 1h = 1 hour
Policy key 6h = 6 hours
Policy key 12h = 12 hours
Policy key 24h = 24 hours (new default)
Policy key 3d = 3 days
Policy key 7d = 7 days (maximum)

**Removed completely:** never, read, hour, day, week

**Database changes:**
- CHECK constraint updated on alpha_connect_messages.retention_policy
- Default changed from day to 24h
- alpha_connect_retention_interval() updated for new keys
- alpha_connect_set_message_expiry() always sets expires_at (raises on invalid policy)
- alpha_connect_on_message_read() trigger removed
- Legacy rows migrated: never/read/day to 24h or 7d, hour to 1h, week to 7d

**App changes:**
- EphemeralDelete type updated in AlphaConnectSettings.tsx
- Arabic UI labels updated for six timed options only
- normalizeRetentionPolicy() migrates legacy localStorage values
- Default setting: 24h
- types.ts AlphaConnectRetentionPolicy aligned with database

### Violation 2 — Client-Only Deletion (FIXED)

**Before:** purge only when app calls alpha_connect_purge_expired_messages()

**After:**
- pg_cron job: alpha-connect-purge-expired
- Schedule: every 15 minutes
- Action: select public.alpha_connect_purge_expired_messages()
- Purge deletes: storage object (audio_path), database row (all message metadata)
- FOR UPDATE SKIP LOCKED added for safe concurrent runs
- Client purge retained as supplementary

**Prerequisite:** Enable pg_cron extension in Supabase Dashboard Database Extensions before running migration.

---

## Files Changed

Database:
- supabase/migrations/20250616140000_alpha_connect_retention_policy_002.sql (NEW)
- supabase/RUN_ALPHA_CONNECT_RETENTION_FIX.sql (NEW)
- supabase/migrations/20250615160000_alpha_connect_mvp.sql (updated)
- supabase/RUN_ALPHA_CONNECT_MVP.sql (synced)
- scripts/apply-missing-tables.mjs (includes retention fix)

Application:
- src/features/alpha-connect/types.ts
- src/features/alpha-connect/retention.ts
- src/components/alpha/AlphaConnectSettings.tsx

---

## Deployment Steps

1. Enable pg_cron in Supabase Dashboard Database Extensions
2. Run supabase/RUN_ALPHA_CONNECT_RETENTION_FIX.sql in SQL Editor
3. Verify: SELECT jobid, jobname, schedule FROM cron.job WHERE jobname = 'alpha-connect-purge-expired';
4. Test: SELECT public.alpha_connect_purge_expired_messages();

---

## Warnings

1. Migration must be executed on Supabase — code changes alone do not update production database.
2. pg_cron requires extension enabled before migration.
3. Legacy localStorage never maps to 7d on next settings load.
4. No Edge Function — pg_cron used as primary server-side mechanism.

---

## Errors

None in codebase. Production database not verified until migration executed.

---

## Recommendations

1. Run RUN_ALPHA_CONNECT_RETENTION_FIX.sql on production immediately.
2. Confirm pg_cron job via cron.job query.
3. Test automatic deletion in staging with 1h policy.

---

## Overall Status

**PASS** — Implementation complete. Production compliance after SQL execution.
